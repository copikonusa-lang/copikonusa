import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, TrendingUp, DollarSign, Clock, ChevronRight, ArrowLeft, ExternalLink, Eye, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { formatUSD, formatShortDate } from "@/lib/utils";
import { proxyImageUrl } from "@/lib/imageProxy";
import type { Order, Product, Setting } from "@shared/schema";
import { ADMIN_STATUS_LABELS, PAYMENT_METHOD_LABELS, type OrderStatus } from "@shared/schema";

const adminStatusColors: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  payment_verified: "bg-blue-100 text-blue-800",
  buying_amazon: "bg-purple-100 text-purple-800",
  en_route_miami: "bg-indigo-100 text-indigo-800",
  in_warehouse: "bg-cyan-100 text-cyan-800",
  in_air: "bg-sky-100 text-sky-800",
  in_venezuela: "bg-teal-100 text-teal-800",
  at_branch: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
};

const adminStatuses: OrderStatus[] = [
  "pending_payment", "payment_verified", "buying_amazon", "en_route_miami",
  "in_warehouse", "in_air", "in_venezuela", "at_branch", "delivered",
];

function AdminSidebar({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const links = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "orders", icon: Package, label: "Pedidos" },
    { id: "products", icon: ShoppingBag, label: "Productos" },
    { id: "customers", icon: Users, label: "Clientes" },
    { id: "settings", icon: Settings, label: "Configuración" },
  ];

  return (
    <aside className="w-56 bg-copikon-navy text-white p-4 shrink-0 min-h-[calc(100vh-120px)] hidden md:block">
      <div className="space-y-1">
        <Link href="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white mb-4 px-3">
          <ArrowLeft className="w-3 h-3" /> Volver a la tienda
        </Link>
        {links.map(l => (
          <button
            key={l.id}
            onClick={() => setTab(l.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${tab === l.id ? "bg-white/10 text-white font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            data-testid={`admin-nav-${l.id}`}
          >
            <l.icon className="w-4 h-4" /> {l.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

function DashboardTab({ token }: { token: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
  });

  if (isLoading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>;

  return (
    <div>
      <h2 className="font-display font-bold text-lg mb-4">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Ventas Hoy", value: formatUSD(data?.todaySales || 0), icon: DollarSign, color: "bg-green-50 text-green-700" },
          { label: "Ventas Semana", value: formatUSD(data?.weekSales || 0), icon: TrendingUp, color: "bg-blue-50 text-blue-700" },
          { label: "Ventas Mes", value: formatUSD(data?.monthSales || 0), icon: TrendingUp, color: "bg-purple-50 text-purple-700" },
          { label: "Pedidos Pendientes", value: data?.pendingOrders || 0, icon: Clock, color: "bg-yellow-50 text-yellow-700" },
          { label: "Total Clientes", value: data?.totalCustomers || 0, icon: Users, color: "bg-indigo-50 text-indigo-700" },
          { label: "Total Productos", value: data?.totalProducts || 0, icon: ShoppingBag, color: "bg-pink-50 text-pink-700" },
          { label: "Total Pedidos", value: data?.totalOrders || 0, icon: Package, color: "bg-cyan-50 text-cyan-700" },
          { label: "Ingresos Total", value: formatUSD(data?.totalRevenue || 0), icon: DollarSign, color: "bg-emerald-50 text-emerald-700" },
        ].map((kpi, i) => (
          <div key={i} className={`rounded-lg p-4 ${kpi.color}`} data-testid={`kpi-${i}`}>
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className="w-4 h-4" />
              <span className="text-xs font-medium">{kpi.label}</span>
            </div>
            <p className="font-display font-bold text-xl">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      {data?.recentOrders?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-display font-bold text-sm mb-3">Pedidos Recientes</h3>
          <div className="space-y-2">
            {data.recentOrders.slice(0, 5).map((o: Order) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                <div>
                  <span className="font-medium">{o.orderNumber}</span>
                  <span className="text-gray-400 ml-2">{formatShortDate(o.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${adminStatusColors[o.status]}`}>{ADMIN_STATUS_LABELS[o.status]}</Badge>
                  <span className="font-medium">{formatUSD(o.totalUsd)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersTab({ token }: { token: string }) {
  const [statusFilter, setStatusFilter] = useState("");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders", statusFilter],
    queryFn: async () => {
      const url = statusFilter ? `/api/admin/orders?status=${statusFilter}` : "/api/admin/orders";
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Estado actualizado" });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg">Pedidos</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] text-sm" data-testid="admin-filter-status">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {adminStatuses.map(s => (
              <SelectItem key={s} value={s}>{ADMIN_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay pedidos</div>
      ) : (
        <div className="space-y-2">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-4" data-testid={`admin-order-${order.id}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-display font-bold text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{formatShortDate(order.createdAt)} · {order.items.length} items · {PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={order.status}
                    onValueChange={(status) => updateStatus.mutate({ id: order.id, status })}
                  >
                    <SelectTrigger className="w-[180px] text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {adminStatuses.map(s => (
                        <SelectItem key={s} value={s}>{ADMIN_STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="font-bold text-sm text-copikon-red">{formatUSD(order.totalUsd)}</span>
                  {order.amazonCartUrl && (
                    <a href={order.amazonCartUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductsTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ["/api/admin/products"],
    queryFn: async () => {
      const res = await fetch("/api/admin/products", { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({ title: "Producto actualizado" });
    },
  });

  return (
    <div>
      <h2 className="font-display font-bold text-lg mb-4">Productos ({data?.total || 0})</h2>
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : (
        <div className="space-y-1">
          {data?.products?.map(p => (
            <div key={p.id} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3 text-sm" data-testid={`admin-product-${p.id}`}>
              <img src={proxyImageUrl(p.image)} alt="" className="w-10 h-10 object-contain rounded bg-gray-50" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-xs text-gray-500">{p.category} · {p.weight} lbs</p>
              </div>
              <span className="font-bold text-copikon-red shrink-0">{formatUSD(p.totalPriceUsd)}</span>
              <Switch
                checked={p.isActive}
                onCheckedChange={(checked) => toggleActive.mutate({ id: p.id, isActive: checked })}
                data-testid={`switch-product-${p.id}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomersTab({ token }: { token: string }) {
  const { data, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/customers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/customers", { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
  });

  return (
    <div>
      <h2 className="font-display font-bold text-lg mb-4">Clientes</h2>
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay clientes registrados</div>
      ) : (
        <div className="space-y-1">
          {data.map((c: any) => (
            <div key={c.id} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-gray-500">{c.email} · {c.city} · {c.branch}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{c.orderCount} pedidos</p>
                <p className="font-bold text-sm">{formatUSD(c.totalSpent)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<Setting[]>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
  });

  const [values, setValues] = useState<Record<string, string>>({});

  const settingsConfig = [
    { key: "bcv_rate", label: "Tasa BCV (Bs/$)", type: "number" },
    { key: "shipping_per_lb", label: "Costo envío por lb ($)", type: "number" },
    { key: "bs_differential", label: "Diferencial Bs (multiplicador)", type: "number" },
    { key: "zelle_email", label: "Email Zelle", type: "text" },
    { key: "binance_wallet", label: "Wallet Binance", type: "text" },
    { key: "bank_name", label: "Banco", type: "text" },
    { key: "bank_account", label: "Cuenta Bancaria", type: "text" },
    { key: "bank_rif", label: "RIF", type: "text" },
    { key: "bank_phone", label: "Teléfono Pago Móvil", type: "text" },
  ];

  const getVal = (key: string) => {
    if (values[key] !== undefined) return values[key];
    const found = data?.find(s => s.key === key);
    return found?.value || "";
  };

  const saveSettings = async () => {
    const updates = Object.entries(values).map(([key, value]) => ({ key, value }));
    if (updates.length === 0) return;
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates),
    });
    qc.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    toast({ title: "Configuración guardada" });
    setValues({});
  };

  return (
    <div>
      <h2 className="font-display font-bold text-lg mb-4">Configuración</h2>
      {isLoading ? (
        <Skeleton className="h-64 rounded-lg" />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          {settingsConfig.map(s => (
            <div key={s.key}>
              <Label className="text-sm">{s.label}</Label>
              <Input
                type={s.type}
                value={getVal(s.key)}
                onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))}
                data-testid={`input-setting-${s.key}`}
              />
            </div>
          ))}
          <Button onClick={saveSettings} className="bg-copikon-red hover:bg-red-800" data-testid="button-save-settings">
            Guardar Configuración
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { isAdmin, isAuthenticated, token } = useAuth();
  const [tab, setTab] = useState("dashboard");

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="font-display font-bold text-xl mb-4">Acceso Restringido</h1>
        <p className="text-gray-500 mb-6">Necesitas permisos de administrador</p>
        <Link href="/login"><Button className="bg-copikon-red hover:bg-red-800">Iniciar Sesión</Button></Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)]">
      <AdminSidebar tab={tab} setTab={setTab} />

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex">
        {[
          { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { id: "orders", icon: Package, label: "Pedidos" },
          { id: "products", icon: ShoppingBag, label: "Productos" },
          { id: "customers", icon: Users, label: "Clientes" },
          { id: "settings", icon: Settings, label: "Config" },
        ].map(l => (
          <button
            key={l.id}
            onClick={() => setTab(l.id)}
            className={`flex-1 flex flex-col items-center py-2 text-xs ${tab === l.id ? "text-copikon-red" : "text-gray-500"}`}
          >
            <l.icon className="w-4 h-4 mb-0.5" /> {l.label}
          </button>
        ))}
      </div>

      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
        {tab === "dashboard" && <DashboardTab token={token!} />}
        {tab === "orders" && <OrdersTab token={token!} />}
        {tab === "products" && <ProductsTab token={token!} />}
        {tab === "customers" && <CustomersTab token={token!} />}
        {tab === "settings" && <SettingsTab token={token!} />}
      </main>
    </div>
  );
}
