import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Package, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { formatUSD, formatShortDate } from "@/lib/utils";
import type { Order } from "@shared/schema";
import { CLIENT_STATUS_LABELS, ORDER_STATUS_MAP, PAYMENT_METHOD_LABELS } from "@shared/schema";

const statusColors: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  payment_confirmed: "bg-blue-100 text-blue-800",
  in_preparation: "bg-purple-100 text-purple-800",
  in_transit: "bg-indigo-100 text-indigo-800",
  ready_pickup: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
};

export default function MyOrders() {
  const { token, isAuthenticated } = useAuth();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/my"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch("/api/orders/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Inicia sesión para ver tus pedidos</p>
        <Link href="/login"><Badge className="bg-copikon-red text-white cursor-pointer">Iniciar Sesión</Badge></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="font-display font-bold text-xl mb-6">Mis Pedidos</h1>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No tienes pedidos aún</p>
          <Link href="/catalogo"><Badge className="bg-copikon-red text-white cursor-pointer">Explorar Catálogo</Badge></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const clientStatus = ORDER_STATUS_MAP[order.status];
            return (
              <Link key={order.id} href={`/pedido/${order.id}`}>
                <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition cursor-pointer" data-testid={`order-${order.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-display font-bold text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{formatShortDate(order.createdAt)} · {order.items.length} producto(s)</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <Badge className={`text-xs ${statusColors[clientStatus] || "bg-gray-100"}`}>
                          {CLIENT_STATUS_LABELS[clientStatus]}
                        </Badge>
                        <p className="text-sm font-bold text-copikon-red mt-1">{formatUSD(order.totalUsd)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
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
