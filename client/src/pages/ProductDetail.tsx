import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ShoppingCart, Heart, Star, Truck, Shield, ChevronRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/ProductCard";
import type { Product, Review } from "@shared/schema";
import { CATEGORIES } from "@shared/schema";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { formatUSD, formatBs, calculateEstimatedDelivery } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const [, params] = useRoute("/producto/:slug");
  const slug = params?.slug || "";
  const { addItem } = useCart();
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/slug/${slug}`],
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: [`/api/reviews/${product?.id}`],
    enabled: !!product,
  });

  const { data: related } = useQuery<{ products: Product[]; total: number }>({
    queryKey: [`/api/products?category=${product?.category || ""}&limit=4`],
    enabled: !!product,
  });

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4 flex items-center gap-1 flex-wrap">
        <a href="#/" className="hover:text-copikon-red">Inicio</a>
        <ChevronRight className="w-3 h-3" />
        <a href={`#/catalogo?category=${product.category}`} className="hover:text-copikon-red">{catName}</a>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center aspect-square relative">
          {product.badge && (
            <Badge className="absolute top-4 left-4 bg-copikon-red text-white">{product.badge}</Badge>
          )}
          <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" data-testid="img-product-detail" />
        </div>

        {/* Info */}
        <div className="space-y-4">
          <h1 className="font-display font-bold text-xl md:text-2xl text-gray-900" data-testid="text-product-title">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500">{product.rating} ({product.reviews.toLocaleString()} reseñas)</span>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-display font-bold text-copikon-red" data-testid="text-detail-price-usd">{formatUSD(product.totalPriceUsd)}</p>
              {product.oldPrice && (
                <p className="text-lg text-gray-400 line-through">{formatUSD(product.oldPrice)}</p>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1" data-testid="text-detail-price-bs">{formatBs(product.totalPriceUsd)}</p>
            <p className="text-xs text-gray-400 mt-2">Precio incluye envío aéreo ({product.weight} lbs × $5.50/lb)</p>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>

          {/* Delivery estimate */}
          <div className="flex items-center gap-2 bg-green-50 text-green-800 rounded-lg px-4 py-3 text-sm">
            <Truck className="w-4 h-4 shrink-0" />
            <div>
              <p className="font-medium">Entrega estimada: {estimatedDelivery}</p>
              <p className="text-xs text-green-600">Envío aéreo Miami → Venezuela</p>
            </div>
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100" data-testid="button-qty-minus">
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 py-2 text-sm font-medium min-w-[40px] text-center" data-testid="text-qty">{qty}</span>
              <button onClick={() => setQty(q => Math.min(5, q + 1))} className="px-3 py-2 hover:bg-gray-100" data-testid="button-qty-plus">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-gray-500">Máx. 5 unidades</span>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 bg-copikon-red hover:bg-red-800 text-white"
              onClick={() => {
                addItem(product, qty);
                toast({ title: "Agregado al carrito" });
              }}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> Agregar al carrito
            </Button>
            <Button variant="outline" onClick={addToWishlist} data-testid="button-add-wishlist">
              <Heart className="w-4 h-4" />
            </Button>
          </div>

          {/* Trust signals */}
          <div className="flex gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Producto original</div>
            <div className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Envío aéreo</div>
          </div>
        </div>
      </div>

      {/* Tabs: Specs, Reviews */}
      <div className="mt-10">
        <Tabs defaultValue="specs">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="specs" data-testid="tab-specs">Especificaciones</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">Reseñas</TabsTrigger>
          </TabsList>
          <TabsContent value="specs" className="mt-4">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specs || {}).map(([key, value], i) => (
                    <tr key={key} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="px-4 py-2.5 font-medium text-gray-700 w-1/3">{key}</td>
                      <td className="px-4 py-2.5 text-gray-600">{value}</td>
                    </tr>
                  ))}
                  <tr className={Object.keys(product.specs || {}).length % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="px-4 py-2.5 font-medium text-gray-700">Peso</td>
                    <td className="px-4 py-2.5 text-gray-600">{product.weight} lbs</td>
                  </tr>
                  <tr className={Object.keys(product.specs || {}).length % 2 !== 0 ? "bg-gray-50" : ""}>
                    <td className="px-4 py-2.5 font-medium text-gray-700">Categoría</td>
                    <td className="px-4 py-2.5 text-gray-600">{catName}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            <div className="space-y-4">
              {reviews && reviews.length > 0 ? reviews.map(r => (
                <div key={r.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{r.userName}</span>
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("es-VE")}</span>
                  </div>
                  <p className="text-sm text-gray-700">{r.comment}</p>
                </div>
              )) : (
                <p className="text-gray-500 text-sm py-8 text-center">Aún no hay reseñas para este producto</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related products */}
      {related?.products && related.products.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display font-bold text-lg mb-4">Productos relacionados</h2>
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
