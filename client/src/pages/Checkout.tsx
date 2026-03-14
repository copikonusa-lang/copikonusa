import { useState } from "react";
import { useLocation, Link } from "wouter";
import { CreditCard, Building, Bitcoin, ArrowLeft, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { proxyImageUrl } from "@/lib/imageProxy";
import { apiRequest } from "@/lib/queryClient";
import { formatUSD, formatBs } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { BRANCHES, PAYMENT_METHOD_LABELS } from "@shared/schema";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, totalUsd, clearCart } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const { toast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [branch, setBranch] = useState(user?.branch || "");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any>(null);

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="font-display font-bold text-xl mb-4">Inicia sesión para continuar</h1>
        <p className="text-gray-500 mb-6">Necesitas una cuenta para realizar tu compra</p>
        <Link href="/login"><Button className="bg-copikon-red hover:bg-red-800">Iniciar Sesión</Button></Link>
      </div>
    );
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="font-display font-bold text-xl mb-4">Tu carrito está vacío</h1>
        <Link href="/catalogo"><Button className="bg-copikon-red hover:bg-red-800">Ver Catálogo</Button></Link>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">¡Pedido Creado!</h1>
        <p className="text-gray-600 mb-2">Tu número de orden es:</p>
        <p className="text-2xl font-display font-bold text-copikon-red mb-4" data-testid="text-order-number">{orderComplete.orderNumber}</p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left text-sm">
          <p className="font-medium text-yellow-800 mb-2">Información de Pago - {PAYMENT_METHOD_LABELS[orderComplete.paymentMethod]}</p>
          {orderComplete.paymentMethod === "zelle" && (
            <p className="text-yellow-700">Envía <strong>{formatUSD(orderComplete.totalUsd)}</strong> por Zelle a: <strong>pagos@copikonusa.com</strong></p>
          )}
          {orderComplete.paymentMethod === "binance" && (
            <p className="text-yellow-700">Envía <strong>{formatUSD(orderComplete.totalUsd)}</strong> USDT a: <strong>0x1234567890abcdef</strong></p>
          )}
          {orderComplete.paymentMethod === "bank_vzla" && (
            <p className="text-yellow-700">Transfiere <strong>{formatBs(orderComplete.totalUsd)}</strong> a: Banesco - 01340000000000000000 - J-12345678-9</p>
          )}
          <p className="text-yellow-600 mt-2 text-xs">Tienes 6 horas para realizar el pago. Sube tu comprobante desde "Mis Pedidos".</p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/mis-pedidos"><Button className="bg-copikon-red hover:bg-red-800">Ver Mis Pedidos</Button></Link>
          <Link href="/catalogo"><Button variant="outline">Seguir Comprando</Button></Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!paymentMethod) {
      toast({ title: "Selecciona un método de pago", variant: "destructive" });
      return;
    }
    if (!branch) {
      toast({ title: "Selecciona una sucursal", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const orderItems = items.map(({ product, quantity }) => ({
        productId: product.id,
        name: product.name,
        image: product.image,
        quantity,
        priceUsd: product.totalPriceUsd,
        weight: product.weight,
        amazonAsin: product.amazonAsin || "",
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: orderItems,
          paymentMethod,
          branch,
          deliveryType,
          deliveryAddress,
          notes,
        }),
      });

      if (!res.ok) throw new Error("Error al crear pedido");
      const order = await res.json();
      setOrderComplete(order);
      clearCart();
    } catch (e: any) {
      toast({ title: e.message || "Error al procesar el pedido", variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/carrito" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-display font-bold text-xl">Finalizar Compra</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Branch selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-display font-bold text-sm mb-4">Entrega</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => setDeliveryType("pickup")}
                  className={`flex-1 p-3 rounded-lg border text-sm text-center ${deliveryType === "pickup" ? "border-copikon-red bg-red-50 text-copikon-red" : "border-gray-200"}`}
                  data-testid="button-delivery-pickup"
                >
                  Retiro en sucursal
                </button>
                <button
                  onClick={() => setDeliveryType("delivery")}
                  className={`flex-1 p-3 rounded-lg border text-sm text-center ${deliveryType === "delivery" ? "border-copikon-red bg-red-50 text-copikon-red" : "border-gray-200"}`}
                  data-testid="button-delivery-delivery"
                >
                  Envío a domicilio
                </button>
              </div>

              <div>
                <Label className="text-sm">Sucursal</Label>
                <Select value={branch} onValueChange={setBranch}>
                  <SelectTrigger data-testid="select-branch"><SelectValue placeholder="Seleccionar sucursal" /></SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {deliveryType === "delivery" && (
                <div>
                  <Label className="text-sm">Dirección de entrega</Label>
                  <Textarea
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder="Dirección completa"
                    data-testid="input-delivery-address"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-display font-bold text-sm mb-4">Método de Pago</h3>
            <div className="space-y-2">
              {[
                { id: "zelle", icon: CreditCard, name: "Zelle", desc: "Pago en USD" },
                { id: "binance", icon: Bitcoin, name: "Binance (USDT)", desc: "Criptomoneda" },
                { id: "bank_vzla", icon: Building, name: "Transferencia / Pago Móvil", desc: "Bolívares" },
              ].map(pm => (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left ${paymentMethod === pm.id ? "border-copikon-red bg-red-50" : "border-gray-200 hover:bg-gray-50"}`}
                  data-testid={`button-payment-${pm.id}`}
                >
                  <pm.icon className={`w-5 h-5 ${paymentMethod === pm.id ? "text-copikon-red" : "text-gray-500"}`} />
                  <div>
                    <p className="text-sm font-medium">{pm.name}</p>
                    <p className="text-xs text-gray-500">{pm.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <Label className="text-sm font-display font-bold">Notas (opcional)</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Instrucciones especiales para tu pedido..."
              className="mt-2"
              data-testid="input-notes"
            />
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-24">
            <h3 className="font-display font-bold text-sm mb-4">Resumen</h3>
            <div className="space-y-3 mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-2 text-sm">
                  <img src={proxyImageUrl(product.image)} alt="" className="w-10 h-10 object-contain rounded bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-gray-700">{product.name}</p>
                    <p className="text-gray-500 text-xs">x{quantity}</p>
                  </div>
                  <p className="font-medium shrink-0">{formatUSD(product.totalPriceUsd * quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-copikon-red">{formatUSD(totalUsd)}</span>
              </div>
              <p className="text-xs text-gray-500 text-right">{formatBs(totalUsd)}</p>
            </div>
            <Button
              className="w-full mt-4 bg-copikon-red hover:bg-red-800 text-white"
              onClick={handleSubmit}
              disabled={submitting}
              data-testid="button-place-order"
            >
              {submitting ? "Procesando..." : "Confirmar Pedido"}
            </Button>
            <div className="flex items-center gap-1 justify-center mt-3 text-xs text-gray-400">
              <Shield className="w-3 h-3" /> Compra 100% segura
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
