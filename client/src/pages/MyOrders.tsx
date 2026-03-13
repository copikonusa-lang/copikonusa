import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Package, ChevronRight, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_payment: { label: "Pago Pendiente", variant: "outline" },
  payment_confirmed: { label: "Pago Confirmado", variant: "secondary" },
  processing: { label: "Procesando", variant: "secondary" },
  shipped: { label: "En Camino", variant: "default" },
  delivered: { label: "Entregado", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

export default function MyOrders() {
  const { user, token } = useAuth();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Error cargando pedidos");
      return res.json();
    },
    enabled: !!token,
  });

  if (!user) return <div className="text-center py-16 text-gray-500">Inicia sesión para ver tus pedidos</div>;

  if (isLoading) return (
    <div className="container mx-auto px-4 py-8">
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 mb-3" />)}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-display font-bold mb-6">Mis Pedidos</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No tienes pedidos aún</p>
          <Link href="/catalog"><span className="text-copikon-red hover:underline">Explorar catálogo</span></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const status = statusLabels[order.status] || { label: order.status, variant: "outline" as const };
            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="bg-white border border-gray-100 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">#{order.orderNumber}</span>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(order.createdAt)} • {order.items?.length} producto(s)</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold">{formatCurrency(order.totalUsd)}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
