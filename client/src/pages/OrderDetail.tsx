import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Package, ArrowLeft, CheckCircle, Clock, Truck, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusSteps = [
  { key: "pending_payment", label: "Pago Pendiente", icon: Clock },
  { key: "payment_confirmed", label: "Pago Confirmado", icon: CheckCircle },
  { key: "processing", label: "Procesando", icon: Package },
  { key: "shipped", label: "En Camino", icon: Truck },
  { key: "delivered", label: "Entregado", icon: CheckCircle },
];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const { data: order, isLoading } = useQuery({
    queryKey: ["/api/orders", id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Order not found");
      return res.json();
    },
    enabled: !!token && !!id,
  });

  if (isLoading) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-64" /></div>;
  if (!order) return <div className="text-center py-16">Pedido no encontrado</div>;

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/my-orders">
        <Button variant="ghost" className="mb-4 -ml-2"><ArrowLeft className="h-4 w-4 mr-1" /> Mis Pedidos</Button>
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="font-display font-bold text-lg">Pedido #{order.orderNumber}</h1>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
            {statusSteps.find(s => s.key === order.status)?.label || order.status}
          </Badge>
        </div>

        {/* Progress */}
        {order.status !== 'cancelled' && (
          <div className="flex items-center justify-between mb-6 overflow-x-auto">
            {statusSteps.map((step, i) => {
              const Icon = step.icon;
              const isCompleted = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-copikon-red text-white' : 'bg-gray-100 text-gray-400'
                  } ${isCurrent ? 'ring-2 ring-copikon-red ring-offset-1' : ''}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-center mt-1 text-gray-500 max-w-[60px]">{step.label}</p>
                  {i < statusSteps.length - 1 && (
                    <div className={`h-px flex-1 w-full mt-4 ${ i < currentStepIndex ? 'bg-copikon-red' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Items */}
        <div className="space-y-3 mb-4">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex gap-3">
              <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded bg-gray-50" />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
              </div>
              <p className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t pt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(order.subtotalUsd)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Envío</span><span>{formatCurrency(order.shippingUsd)}</span></div>
          <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>{formatCurrency(order.totalUsd)}</span></div>
        </div>
      </div>

      {order.status === 'pending_payment' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-600 inline mr-2" />
          Envía tu comprobante de pago por WhatsApp para confirmar tu pedido.
        </div>
      )}
    </div>
  );
}
