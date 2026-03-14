import { Link } from "wouter";
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatUSD, formatBs } from "@/lib/utils";
import { proxyImageUrl } from "@/lib/imageProxy";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalItems, totalUsd, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="font-display font-bold text-xl text-gray-900 mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-6">Explora nuestro catálogo y encuentra productos increíbles</p>
        <Link href="/catalogo">
          <Button className="bg-copikon-red hover:bg-red-800" data-testid="button-go-catalog">Ver Catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/catalogo" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display font-bold text-xl">Carrito de Compras ({totalItems})</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4" data-testid={`cart-item-${product.id}`}>
              <Link href={`/producto/${product.slug}`}>
                <img src={proxyImageUrl(product.image)} alt={product.name} className="w-20 h-20 object-contain rounded bg-gray-50" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/producto/${product.slug}`}>
                  <h3 className="text-sm font-medium text-gray-900 hover:text-copikon-red truncate">{product.name}</h3>
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">Peso: {product.weight} lbs</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-gray-200 rounded">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2 py-1 hover:bg-gray-100" data-testid={`button-cart-minus-${product.id}`}>
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-sm">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2 py-1 hover:bg-gray-100" data-testid={`button-cart-plus-${product.id}`}>
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-copikon-red">{formatUSD(product.totalPriceUsd * quantity)}</p>
                    <p className="text-xs text-gray-500">{formatBs(product.totalPriceUsd * quantity)}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => removeItem(product.id)} className="self-start p-1 hover:bg-gray-100 rounded" data-testid={`button-cart-remove-${product.id}`}>
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-24">
            <h3 className="font-display font-bold text-sm mb-4">Resumen del Pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({totalItems} productos)</span>
                <span className="font-medium">{formatUSD(totalUsd)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Envío aéreo</span>
                <span>Incluido</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-copikon-red" data-testid="text-cart-total">{formatUSD(totalUsd)}</span>
                </div>
                <p className="text-xs text-gray-500 text-right mt-0.5" data-testid="text-cart-total-bs">{formatBs(totalUsd)}</p>
              </div>
            </div>
            <Link href="/checkout">
              <Button className="w-full mt-4 bg-copikon-red hover:bg-red-800 text-white" data-testid="button-checkout">
                Proceder al Pago
              </Button>
            </Link>
            <Link href="/catalogo">
              <Button variant="ghost" className="w-full mt-2 text-sm text-gray-500">
                Seguir comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
