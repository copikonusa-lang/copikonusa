import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, CheckCircle, Clock, Package, Truck, MapPin, Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { formatUSD, formatBs, formatDate, formatShortDate } from "@/lib/utils";
import { proxyImageUrl } from "@/lib/imageProxy";
import type { Order, ClientOrderStatus } from "@shared/schema";
import { CLIENT_STATUS_LABELS, ORDER_STATUS_MAP, PAYMENT_METHOD_LABELS } from "@shared/schema";

const timelineSteps: { key: ClientOrderStatus; icon: any; label: string }[] = [
  { key: "pending_payment", icon: Clock, label: "Pago pendiente" },
  { key: "payment_confirmed", icon: CheckCircle, label: "Pago confirmado" },
  { key: "in_preparation", icon: Box, label: "En preparación" },
  { key: "in_transit", icon: Truck, label: "En camino" },
  { key: "ready_pickup", icon: MapPin, label: "Listo para retiro" },
  { key: "delivered", icon: Package, label: "Entregado" },
];

const statusOrder = ["pending_payment", "payment_confirmed", "in_preparation", "in_transit", "ready_pickup", "delivered"];

export default function OrderDetail() {
  const [, params] = useRoute("/pedido/:id");
  const { token } = useAuth();

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["/api/orders", `/${params?.id}`],
    enabled: !!params?.id,
    queryFn: async () => {
      const res = await fetch(`/api/orders/${params?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
  });

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-8"><Skeleton className="h-96 rounded-lg" /></div>;
  }

  if (!order) {
    return <div className="max-w-lg mx-auto px-4 py-16 text-center"><p className="text-gray-500">Pedido no encontrado</p></div>;
  }

  const clientStatus = ORDER_STATUS_MAP[order.status];
  const currentIdx = statusOrder.indexOf(clientStatus);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mis-pedidos" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="font-display font-bold text-xl">Pedido {order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Status timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h3 className="font-display font-bold text-sm mb-4">Estado del Pedido</h3>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200" />
          <div className="absolute top-4 left-8 h-0.5 bg-copikon-red" style={{ width: `${currentIdx > 0 ? (currentIdx / (timelineSteps.length - 1)) * (100 - 16) : 0}%` }} />
          {timelineSteps.map((step, i) => {
            const active = i <= currentIdx;
            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? "bg-copikon-red text-white" : "bg-gray-200 text-gray-400"}`}>
                  <step.icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] mt-2 text-center max-w-[60px] leading-tight ${active ? "text-copikon-red font-medium" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery estimate */}
      {order.estimatedDelivery && clientStatus !== "delivered" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-sm text-green-800">
          <p className="font-medium">Entrega estimada: {formatDate(order.estimatedDelivery)}</p>
          <p className="text-green-600 text-xs mt-0.5">Sucursal: {order.branch}</p>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h3 className="font-display font-bold text-sm mb-4">Productos</h3>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <img src={proxyImageUrl(item.image)} alt="" className="w-12 h-12 object-contain rounded bg-gray-50" />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-gray-500 text-xs">Cantidad: {item.quantity} · Peso: {item.weight} lbs</p>
              </div>
              <p className="font-medium shrink-0">{formatUSD(item.priceUsd * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="font-display font-bold text-sm mb-3">Detalle del Pago</h3>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Método</span><span>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Entrega</span><span>{order.deliveryType === "pickup" ? "Retiro en sucursal" : "Domicilio"}</span></div>
          <div className="flex justify-between border-t border-gray-100 pt-2 mt-2 font-bold">
            <span>Total USD</span><span className="text-copikon-red">{formatUSD(order.totalUsd)}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-xs">
            <span>Total Bs.</span><span>{formatBs(order.totalUsd)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
