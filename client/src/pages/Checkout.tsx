import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart";
import { useLocation } from "wouter";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [, setLocation] = useLocation();

  if (items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Tu carrito est\u00e1 vac\u00edo</h1>
        <Button onClick={() => setLocation("/catalog")}>Ir al Cat\u00e1logo</Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Informaci\u00f3n de Env\u00edo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nombre</Label><Input placeholder="Tu nombre" /></div>
                <div><Label>Apellido</Label><Input placeholder="Tu apellido" /></div>
              </div>
              <div><Label>Email</Label><Input type="email" placeholder="tu@email.com" /></div>
              <div><Label>Direcci\u00f3n</Label><Input placeholder="Direcci\u00f3n de env\u00edo" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Ciudad</Label><Input placeholder="Ciudad" /></div>
                <div><Label>Estado</Label><Input placeholder="Estado" /></div>
                <div><Label>ZIP</Label><Input placeholder="ZIP" /></div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Resumen del Pedido</CardTitle></CardHeader>
          <CardContent>
            {items.map((item: any) => (
              <div key={item.id} className="flex justify-between py-2 border-b">
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between py-4 font-bold text-lg">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
            <Button className="w-full" size="lg">Confirmar Pedido</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
