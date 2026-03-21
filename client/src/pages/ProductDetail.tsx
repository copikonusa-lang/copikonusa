import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { ShoppingCart, Heart, Star, Truck, Shield, ChevronRight, Minus, Plus, Check, Package, ZoomIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import type { Product, Review } from "@shared/schema";
import { CATEGORIES } from "@shared/schema";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { formatUSD, formatBs, calculateEstimatedDelivery } from "@/lib/utils";
import { proxyImageUrl } from "@/lib/imageProxy";
import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AmazonDetail {
  images: string[];
  featureBullets: string[];
  translatedDescription?: string;
  variants: { asin: string; text: string; attributes: { name: string; value: string }[] }[];
  brand: string;
}

// Preload images to avoid the 5s delay
function usePreloadImages(urls: string[]) {
  useEffect(() => {
    if (!urls.length) return;
    const proxied = urls.map(u => proxyImageUrl(u));
    proxied.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [urls]);
}

function ImageGallery({ mainImage, images, productName }: { mainImage: string; images: string[]; productName: string }) {
  const allImages = images.length > 0 ? [...new Set(images)] : [mainImage];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const imgRef = useRef<HTMLDivElement>(null);

  // Preload all gallery images immediately
  usePreloadImages(allImages);

  // Reset selected index when images change
  useEffect(() => {
    setSelectedIdx(0);
    setLoadedImages(new Set([0]));
  }, [allImages.length, mainImage]);

  const currentImage = allImages[selectedIdx] || mainImage;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="flex gap-3">
      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex flex-col gap-2 w-16 shrink-0">
          {allImages.slice(0, 7).map((img, i) => (
            <button
              key={`${img}-${i}`}
              onClick={() => setSelectedIdx(i)}
              onMouseEnter={() => setSelectedIdx(i)}
              className={`w-16 h-16 rounded border-2 p-1 bg-white flex items-center justify-center transition-all ${
                selectedIdx === i ? "border-copikon-red shadow-sm" : "border-gray-200 hover:border-gray-400"
              }`}
              data-testid={`button-thumb-${i}`}
            >
              <img
                src={proxyImageUrl(img)}
                alt={`${productName} - ${i + 1}`}
                className="max-w-full max-h-full object-contain"
                onLoad={() => setLoadedImages(prev => new Set(prev).add(i))}
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image with zoom */}
      <div
        ref={imgRef}
        className="flex-1 bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-center aspect-square relative cursor-zoom-in overflow-hidden"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        data-testid="img-main-product"
      >
        <img
          src={proxyImageUrl(currentImage)}
          alt={productName}
          className={`max-h-full max-w-full object-contain transition-transform duration-200 ${
            zoomed ? "scale-150" : "scale-100"
          }`}
          style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
          loading="eager"
        />
        {!zoomed && (
          <div className="absolute bottom-3 right-3 bg-gray-800/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <ZoomIn className="w-3 h-3" /> Pasa el mouse para ampliar
          </div>
        )}
      </div>
    </div>
  );
}

interface VariantSelectorProps {
  variants: AmazonDetail["variants"];
  onVariantSelect: (asin: string, text: string) => void;
  selectedAsin: string;
  loadingVariant: boolean;
}

function VariantSelector({ variants, onVariantSelect, selectedAsin, loadingVariant }: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  // Group by attribute name from structured attributes
  const attrGroups = new Map<string, { value: string; asin: string }[]>();
  let hasStructuredAttrs = false;
  
  variants.forEach(v => {
    v.attributes?.forEach(a => {
      hasStructuredAttrs = true;
      const key = a.name || "Opción";
      if (!attrGroups.has(key)) attrGroups.set(key, []);
      // Avoid duplicates
      const existing = attrGroups.get(key)!;
      if (!existing.find(e => e.value === a.value)) {
        existing.push({ value: a.value, asin: v.asin });
      }
    });
  });

  // If no structured attributes, parse from text
  if (!hasStructuredAttrs && variants.length > 0) {
    const options: { value: string; asin: string }[] = [];
    variants.forEach(v => {
      const text = (v.text || "").trim();
      if (text && text.length < 60 && !options.find(o => o.value === text)) {
        options.push({ value: text, asin: v.asin });
      }
    });
    if (options.length > 0 && options.length <= 30) {
      attrGroups.set("Opción", options);
    }
  }

  const filtered = [...attrGroups.entries()].filter(([, values]) => values.length > 0);
  if (filtered.length === 0) return null;

  const nameMap: Record<string, string> = {
    Size: "Talla / Tamaño", Color: "Color", Style: "Estilo",
    Pattern: "Patrón", Flavor: "Sabor", Scent: "Fragancia",
    size_name: "Talla", color_name: "Color", style_name: "Estilo",
    "Opción": "Opciones disponibles",
  };

  // Track which value is selected per group
  const [selectedPerGroup, setSelectedPerGroup] = useState<Record<string, string>>({});

  // Find selected variant's asin
  const getSelectedAsinForValue = (items: { value: string; asin: string }[], value: string) => {
    return items.find(i => i.value === value)?.asin || "";
  };

  return (
    <div className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-900">Opciones del producto</h4>
        {loadingVariant && (
          <span className="flex items-center gap-1.5 text-xs text-copikon-red">
            <Loader2 className="w-3 h-3 animate-spin" /> Cargando variante...
          </span>
        )}
      </div>
      {filtered.map(([name, items]) => {
        const displayName = nameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);
        const selectedVal = selectedPerGroup[name] || items[0]?.value || "";
        
        return (
          <div key={name}>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              {displayName}: <span className="font-normal text-gray-500">{selectedVal}</span>
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto">
              {items.slice(0, 24).map(({ value, asin }) => (
                <button
                  key={value}
                  onClick={() => {
                    setSelectedPerGroup(prev => ({ ...prev, [name]: value }));
                    if (asin && asin !== selectedAsin) {
                      onVariantSelect(asin, value);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs border rounded-lg transition-all ${
                    value === selectedVal
                      ? "border-copikon-red bg-red-50 text-copikon-red font-semibold shadow-sm"
                      : "border-gray-300 text-gray-600 hover:border-copikon-red hover:bg-red-50/50"
                  }`}
                  data-testid={`variant-${name}-${value}`}
                >
                  {value.length > 30 ? value.slice(0, 28) + "..." : value}
                </button>
              ))}
              {items.length > 24 && (
                <span className="text-xs text-gray-400 self-center ml-1">+{items.length - 24} más</span>
              )}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-gray-400 italic">
        Selecciona tu variante preferida — el precio se actualiza automáticamente.
      </p>
    </div>
  );
}

function DescriptionTab({ featureBullets, product, translatedDescription }: { featureBullets: string[]; product: Product; translatedDescription?: string }) {
  const hasFeatures = featureBullets && featureBullets.length > 0;
  const description = translatedDescription || product.description;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Package className="w-5 h-5 text-copikon-red" />
          Acerca de este producto
        </h3>
        {description && description !== product.name && (
          <p className="text-sm text-gray-700 leading-relaxed mb-4">{description}</p>
        )}
      </div>

      {hasFeatures && (
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Características principales</h4>
          <ul className="space-y-2.5">
            {featureBullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-bold text-gray-900 mb-2">¿Qué incluye tu compra?</h4>
        <ul className="space-y-1.5 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-copikon-red" />
            1x {product.name.length > 60 ? product.name.slice(0, 60) + "..." : product.name}
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-copikon-red" />
            Empaque y embalaje original del fabricante
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-copikon-red" />
            Envío aéreo USA → Venezuela incluido
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-copikon-red" />
            Garantía de producto 100% original
          </li>
        </ul>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-sm font-bold text-gray-900 mb-2">Información de envío</h4>
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-copikon-navy" />
            <span>Envío aéreo incluido</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-copikon-navy" />
            <span>Envío aéreo semanal</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-copikon-navy" />
            <span>Desde USA</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Costo envío incluido en precio</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const [, params] = useRoute("/producto/:slug");
  const [, navigate] = useLocation();
  const slug = params?.slug || "";
  const { addItem } = useCart();
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  
  // Variant state
  const [selectedVariantAsin, setSelectedVariantAsin] = useState("");
  const [selectedVariantText, setSelectedVariantText] = useState("");
  const [variantPrice, setVariantPrice] = useState<number | null>(null);
  const [variantName, setVariantName] = useState<string | null>(null);
  const [variantImage, setVariantImage] = useState<string | null>(null);
  const [loadingVariant, setLoadingVariant] = useState(false);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/slug/${slug}`],
  });

  const { data: amazonDetail } = useQuery<AmazonDetail>({
    queryKey: [`/api/products/${product?.id}/amazon-detail`],
    enabled: !!product?.id,
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: [`/api/reviews/${product?.id}`],
    enabled: !!product,
  });

  const { data: related } = useQuery<{ products: Product[]; total: number }>({
    queryKey: [`/api/products?category=${product?.category || ""}&limit=8`],
    enabled: !!product,
  });

  // Preload amazon detail images as soon as they arrive
  usePreloadImages(amazonDetail?.images || []);

  // Reset variant state when product changes
  useEffect(() => {
    setSelectedVariantAsin("");
    setSelectedVariantText("");
    setVariantPrice(null);
    setVariantName(null);
    setVariantImage(null);
  }, [slug]);

  // Handle variant selection — fetch the variant's price from API
  const handleVariantSelect = useCallback(async (asin: string, text: string) => {
    setSelectedVariantAsin(asin);
    setSelectedVariantText(text);
    setLoadingVariant(true);
    
    try {
      // Fetch variant product details from Canopy
      const res = await fetch(`/api/variant/${asin}`);
      if (res.ok) {
        const data = await res.json();
        if (data.price) setVariantPrice(data.price);
        if (data.name) setVariantName(data.name);
        if (data.image) setVariantImage(data.image);
      }
    } catch (e) {
      console.error("Variant fetch error:", e);
    } finally {
      setLoadingVariant(false);
    }
  }, []);

  const addToWishlist = async () => {
    if (!isAuthenticated || !product) {
      toast({ title: "Inicia sesión para guardar en tu lista de deseos", variant: "destructive" });
      return;
    }
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product.id }),
      });
      toast({ title: "Agregado a tu lista de deseos" });
    } catch {
      toast({ title: "Error al agregar", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Producto no encontrado</h1>
        <Link href="/catalogo"><Button className="mt-4">Volver al catálogo</Button></Link>
      </div>
    );
  }

  const catName = CATEGORIES.find(c => c.id === product.category)?.name || product.category;
  const estimatedDelivery = calculateEstimatedDelivery();
  const allImages = amazonDetail?.images || (product.images?.length ? product.images : [product.image]);
  
  // Use variant overrides when available
  const displayPrice = variantPrice || product.totalPriceUsd;
  const displayName = variantName || product.name;
  const displayImages = variantImage ? [variantImage, ...allImages.filter(i => i !== variantImage)] : allImages;
  
  const discount = product.oldPrice ? Math.round((1 - displayPrice / product.oldPrice) * 100) : 0;

  // Build cart item with variant info
  const handleAddToCart = () => {
    const cartProduct = {
      ...product,
      totalPriceUsd: displayPrice,
      name: selectedVariantText 
        ? `${product.name} — ${selectedVariantText}`
        : product.name,
    };
    addItem(cartProduct, qty);
    toast({ 
      title: "Agregado al carrito",
      description: selectedVariantText ? `Variante: ${selectedVariantText}` : undefined,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4 flex items-center gap-1 flex-wrap" data-testid="breadcrumb">
        <a href="#/" className="hover:text-copikon-red">Inicio</a>
        <ChevronRight className="w-3 h-3" />
        <a href={`#/catalogo?category=${product.category}`}
          onClick={(e) => { e.preventDefault(); navigate(`/catalogo?category=${product.category}`); }}
          className="hover:text-copikon-red cursor-pointer">{catName}</a>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 truncate max-w-[250px]">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
        {/* Image Gallery */}
        <div className="relative">
          {product.badge && (
            <span className={`absolute top-2 right-2 px-3 py-1.5 text-xs font-bold rounded-sm z-20 shadow-sm ${
              product.badge === "Más vendido" ? "bg-[#C45500] text-white" :
              product.badge === "Nuevo" ? "bg-[#E47911] text-white" :
              product.badge === "Popular" ? "bg-[#007185] text-white" :
              product.badge === "Oferta" ? "bg-[#CC0C39] text-white" :
              "bg-[#C45500] text-white"
            }`}>{product.badge}</span>
          )}
          <ImageGallery mainImage={variantImage || product.image} images={displayImages} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          {/* Brand */}
          {amazonDetail?.brand && (
            <p className="text-sm text-blue-600 font-medium" data-testid="text-brand">
              Marca: {amazonDetail.brand}
            </p>
          )}

          {/* Title */}
          <h1 className="font-display font-bold text-lg md:text-xl text-gray-900 leading-tight" data-testid="text-product-title">
            {displayName}
            {selectedVariantText && (
              <span className="text-copikon-red font-normal text-base ml-2">— {selectedVariantText}</span>
            )}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-[#FFA41C] text-[#FFA41C]" : "text-gray-300"}`} />
              ))}
            </div>
            <span className="text-sm text-blue-600 hover:text-copikon-red cursor-pointer">
              {product.rating.toFixed(1)} ({product.reviews.toLocaleString()} valoraciones)
            </span>
          </div>

          {/* Price block */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            {discount > 0 && (
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#CC0C39] text-white text-xs font-bold px-2 py-0.5 rounded">-{discount}%</span>
                <span className="text-sm text-gray-500 line-through">{formatUSD(product.oldPrice!)}</span>
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-gray-500 mt-1">Precio:</span>
              <p className={`text-2xl font-display font-bold text-copikon-red transition-all ${loadingVariant ? "opacity-50" : ""}`} data-testid="text-detail-price-usd">
                {loadingVariant ? "..." : formatUSD(displayPrice)}
              </p>
              {variantPrice && variantPrice !== product.totalPriceUsd && (
                <span className="text-sm text-gray-400 line-through">{formatUSD(product.totalPriceUsd)}</span>
              )}
            </div>
            <p className={`text-sm text-gray-600 mt-1 transition-all ${loadingVariant ? "opacity-50" : ""}`} data-testid="text-detail-price-bs">
              {loadingVariant ? "Calculando..." : formatBs(displayPrice)}
            </p>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Truck className="w-3 h-3" /> Envío aéreo desde USA incluido
            </p>
          </div>

          {/* Variants */}
          {amazonDetail?.variants && amazonDetail.variants.length > 0 && (
            <VariantSelector 
              variants={amazonDetail.variants} 
              onVariantSelect={handleVariantSelect}
              selectedAsin={selectedVariantAsin}
              loadingVariant={loadingVariant}
            />
          )}

          {/* Delivery estimate */}
          <div className="flex items-center gap-3 bg-green-50 text-green-800 rounded-lg px-4 py-3 text-sm border border-green-100">
            <Truck className="w-5 h-5 shrink-0 text-green-600" />
            <div>
              <p className="font-semibold">Entrega estimada: {estimatedDelivery}</p>
              <p className="text-xs text-green-600">Envío aéreo semanal USA → Venezuela</p>
            </div>
          </div>

          {/* In stock */}
          <p className="text-sm text-green-700 font-medium">Disponible - Compramos directo para ti</p>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-300 rounded-lg bg-white">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2.5 hover:bg-gray-100 rounded-l-lg" data-testid="button-qty-minus">
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2.5 text-sm font-semibold min-w-[44px] text-center border-x border-gray-200" data-testid="text-qty">{qty}</span>
              <button onClick={() => setQty(q => Math.min(3, q + 1))} className="px-3 py-2.5 hover:bg-gray-100 rounded-r-lg" data-testid="button-qty-plus">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-gray-500">Máx. 3 unidades</span>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 bg-copikon-red hover:bg-red-800 text-white h-11 text-sm font-semibold"
              onClick={handleAddToCart}
              disabled={loadingVariant}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> Agregar al carrito
            </Button>
            <Button variant="outline" className="h-11 px-4" onClick={addToWishlist} data-testid="button-add-wishlist">
              <Heart className="w-4 h-4" />
            </Button>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-copikon-navy" />
              <span>100% original garantizado</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-copikon-navy" />
              <span>Envío aéreo incluido</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-copikon-navy" />
              <span>Empaque protegido</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Pago seguro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <div className="mt-8">
        <Tabs defaultValue="description">
          <TabsList className="bg-gray-100 w-full justify-start">
            <TabsTrigger value="description" data-testid="tab-description" className="text-sm">Descripción</TabsTrigger>
            <TabsTrigger value="specs" data-testid="tab-specs" className="text-sm">Especificaciones</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews" className="text-sm">
              Reseñas ({reviews?.length || product.reviews.toLocaleString()})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-4">
            <DescriptionTab
              featureBullets={amazonDetail?.featureBullets || []}
              product={product}
              translatedDescription={amazonDetail?.translatedDescription}
            />
          </TabsContent>

          <TabsContent value="specs" className="mt-4">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {amazonDetail?.brand && !/^amazon$/i.test(amazonDetail.brand.trim()) && (
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700 w-1/3 border-b border-gray-100">Marca</td>
                      <td className="px-4 py-3 text-gray-600 border-b border-gray-100">{amazonDetail.brand.replace(/Amazon\s+Basics/gi, "Copikon Basics").replace(/^Amazon$/i, "")}</td>
                    </tr>
                  )}
                  {Object.entries(product.specs || {}).map(([key, value], i) => (
                    <tr key={key} className={i % 2 === 0 ? "" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-medium text-gray-700 w-1/3 border-b border-gray-100">{key}</td>
                      <td className="px-4 py-3 text-gray-600 border-b border-gray-100">{value}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700 border-b border-gray-100">Peso estimado</td>
                    <td className="px-4 py-3 text-gray-600 border-b border-gray-100">{product.weight} lbs</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-700 border-b border-gray-100">Categoría</td>
                    <td className="px-4 py-3 text-gray-600 border-b border-gray-100">{catName}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">Envío</td>
                    <td className="px-4 py-3 text-gray-600">Aéreo semanal USA → Venezuela</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">{product.rating.toFixed(1)}</p>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-[#FFA41C] text-[#FFA41C]" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{product.reviews.toLocaleString()} valoraciones</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map(star => {
                    const pct = star === 5 ? 68 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 3 : 2;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-6 text-blue-600">{star}★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#FFA41C] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-gray-500 w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {reviews && reviews.length > 0 ? reviews.map(r => (
                <div key={r.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                      {r.userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{r.userName}</span>
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("es-VE")}</span>
                  </div>
                  <div className="flex mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-[#FFA41C] text-[#FFA41C]" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700">{r.comment}</p>
                </div>
              )) : (
                <p className="text-gray-500 text-sm py-6 text-center">Aún no hay reseñas para este producto</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related products */}
      {related?.products && related.products.length > 0 && (
        <div className="mt-8 mb-4">
          <h2 className="font-display font-bold text-lg mb-4">Clientes también vieron</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.products.filter(p => p.id !== product.id).slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
