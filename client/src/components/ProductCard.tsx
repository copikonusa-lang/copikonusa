import { Link } from "wouter";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@shared/schema";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { token } = useAuth();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.totalPriceUsd,
      image: product.image,
      asin: product.amazonAsin || undefined,
    });
    toast({ title: "Agregado al carrito", description: product.name });
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) { toast({ title: "Inicia sesión para guardar favoritos", variant: "destructive" }); return; }
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productId: product.id }),
    });
    toast({ title: "Guardado en favoritos" });
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="aspect-square overflow-hidden bg-gray-50 relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-product.png"; }}
          />
          {product.badge && (
            <Badge className="absolute top-2 left-2 bg-copikon-red text-white border-0">{product.badge}</Badge>
          )}
          <button onClick={handleWishlist} className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <div className="p-3">
          <p className="text-xs text-gray-400 mb-1">{product.category}</p>
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-gray-500">{product.rating} ({product.reviews})</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900">{formatCurrency(product.totalPriceUsd)}</span>
              {product.oldPrice && <span className="text-xs text-gray-400 line-through ml-1">{formatCurrency(product.oldPrice)}</span>}
            </div>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-copikon-red/10 hover:text-copikon-red" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
