import { Link } from "wouter";
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="font-display font-bold text-xl text-gray-900 mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-6">Explora nuestro catálogo y encuentra productos increíbles</p>
        <Link href="/catalog">
          <Button className="bg-copikon-red hover:bg-red-800" data-testid="button-go-catalog">Ver Catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/catalog" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display font-bold text-xl">Carrito de Compras ({totalItems})</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-contain rounded bg-gray-50" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-gray-200 rounded">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} className="self-start p-1 hover:bg-gray-100 rounded">
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-24">
            <h3 className="font-display font-bold text-sm mb-4">Resumen del Pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({totalItems} productos)</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t mt-3 pt-3">
              <div className="flex justify-between font-bold">
                <span>Total USD</span>
                <span className="text-copikon-red">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout">
              <Button className="w-full mt-4 bg-copikon-red hover:bg-red-800" data-testid="button-checkout">
                Proceder al Pago
              </Button>
            </Link>
            <button onClick={clearCart} className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600">
              Vaciar carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
