import { Link } from "wouter";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";
import { useCart } from "@/lib/cart";
import { formatUSD, formatBs } from "@/lib/utils";
import ProductImage from "./ProductImage";

function getBadgeStyle(badge: string) {
  switch (badge) {
    case "Más vendido":
      return "bg-[#C45500] text-white";      // naranja Amazon Best Seller
    case "Nuevo":
      return "bg-[#E47911] text-white";      // naranja dorado Amazon New Release
    case "Popular":
      return "bg-[#007185] text-white";      // teal Amazon's Choice
    case "Oferta":
      return "bg-[#CC0C39] text-white";      // rojo ofertas
    default:
      return "bg-[#C45500] text-white";
  }
}

interface ProductCardProps {
  product: Product;
  bcvRate?: number;
}

export default function ProductCard({ product, bcvRate = 62 }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow" data-testid={`card-product-${product.id}`}>
      {/* Image */}
      <Link href={`/producto/${product.slug}`}>
        <div className="relative aspect-square bg-white p-4 flex items-center justify-center overflow-hidden">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            containerClassName="w-full h-full flex items-center justify-center"
          />
          {product.badge && (
            <span className={`absolute top-2 right-2 px-2.5 py-1 text-[11px] font-bold rounded-sm z-10 shadow-sm ${getBadgeStyle(product.badge)}`}>
              {product.badge}
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 space-y-2">
        <Link href={`/producto/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-copikon-red transition-colors leading-tight" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviews.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div>
          <p className="text-lg font-bold text-copikon-red font-display" data-testid={`text-price-usd-${product.id}`}>
            {formatUSD(product.totalPriceUsd)}
          </p>
          <p className="text-xs text-gray-500" data-testid={`text-price-bs-${product.id}`}>
            {formatBs(product.totalPriceUsd, bcvRate)}
          </p>
          {product.oldPrice && (
            <p className="text-xs text-gray-400 line-through">
              {formatUSD(product.oldPrice)}
            </p>
          )}
        </div>

        {/* Add to cart */}
        <Button
          size="sm"
          className="w-full bg-copikon-red hover:bg-red-800 text-white text-xs"
          onClick={(e) => {
            e.preventDefault();
            addItem(product);
          }}
          data-testid={`button-add-cart-${product.id}`}
        >
          <ShoppingCart className="w-3.5 h-3.5 mr-1" />
          Agregar al carrito
        </Button>
      </div>
    </div>
  );
}
