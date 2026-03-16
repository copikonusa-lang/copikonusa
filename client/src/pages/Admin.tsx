import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, TrendingUp, DollarSign, Clock, ChevronRight, ArrowLeft, ExternalLink, Eye, Check, X, ShoppingCart, AlertTriangle, CheckCircle2, Loader2, BarChart3, RefreshCw, FileText, XCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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

const purchaseStatusColors: Record<string, string> = {
  "": "bg-gray-100 text-gray-600",
  cart_ready: "bg-amber-100 text-amber-800",
  purchased: "bg-green-100 text-green-800",
  partially_purchased: "bg-orange-100 text-orange-800",
  issue: "bg-red-100 text-red-800",
};

const purchaseStatusLabels: Record<string, string> = {
  "": "Sin procesar",
  cart_ready: "Carrito listo",
  purchased: "Comprado",
  partially_purchased: "Compra parcial",
  issue: "Con problema",
};

const adminStatuses: OrderStatus[] = [
  "pending_payment", "payment_verified", "buying_amazon", "en_route_miami",
  "in_warehouse", "in_air", "in_venezuela", "at_branch", "delivered",
];

function AdminSidebar({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const links = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "orders", icon: Package, label: "Pedidos" },
    { id: "purchases", icon: ShoppingCart, label: "Compras" },
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

  const { data: purchaseData } = useQuery({
    queryKey: ["/api/admin/purchases/summary"],
    queryFn: async () => {
      const res = await fetch("/api/admin/purchases/summary", { headers: { Authorization: `Bearer ${token}` } });
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

      {/* Purchase Stats */}
      {purchaseData && (purchaseData.pendingPurchase > 0 || purchaseData.purchased > 0) && (
        <div className="bg-gradient-to-r from-copikon-navy to-slate-800 rounded-lg p-5 mb-6 text-white">
          <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> Resumen de Compras
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-300">Por comprar</p>
              <p className="font-bold text-xl text-amber-400">{purchaseData.pendingPurchase}</p>
            </div>
            <div>
              <p className="text-xs text-gray-300">Comprados</p>
              <p className="font-bold text-xl text-green-400">{purchaseData.purchased}</p>
            </div>
            <div>
              <p className="text-xs text-gray-300">Ganancia Total</p>
              <p className="font-bold text-xl text-emerald-400">{formatUSD(purchaseData.totalProfit)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-300">Margen</p>
              <p className="font-bold text-xl text-cyan-400">{purchaseData.marginPct}%</p>
            </div>
          </div>
        </div>
      )}

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

// ===== PURCHASE AUTOMATION TAB =====
function PurchasesTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [cartResult, setCartResult] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [issueDialog, setIssueDialog] = useState(false);
  const [amazonOrderId, setAmazonOrderId] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [purchaseNotes, setPurchaseNotes] = useState("");
  const [issueText, setIssueText] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGeneratingCart, setIsGeneratingCart] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/admin/purchases/summary"],
    queryFn: async () => {
      const res = await fetch("/api/admin/purchases/summary", { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
  });

  const { data: allOrders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
  });

  const purchaseOrders = (allOrders || []).filter(o =>
    o.status === "payment_verified" ||
    o.status === "buying_amazon" ||
    (o as any).amazonPurchaseStatus === "cart_ready" ||
    (o as any).amazonPurchaseStatus === "issue"
  );

  const completedPurchases = (allOrders || []).filter(o =>
    (o as any).amazonPurchaseStatus === "purchased"
  );

  async function verifyPrices(order: Order) {
    setSelectedOrder(order);
    setIsVerifying(true);
    setVerifyResult(null);
    setCartResult(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/verify-prices`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  }

  async function generateCart(order: Order) {
    setIsGeneratingCart(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/generate-cart`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCartResult(data);
      qc.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/purchases/summary"] });
      toast({ title: "Carrito generado" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGeneratingCart(false);
    }
  }

  async function confirmPurchase() {
    if (!selectedOrder) return;
    try {
      await fetch(`/api/admin/orders/${selectedOrder.id}/confirm-purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amazonOrderIds: amazonOrderId.split(",").map(s => s.trim()).filter(Boolean),
          actualCost: actualCost || undefined,
          notes: purchaseNotes,
        }),
      });
      qc.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/purchases/summary"] });
      toast({ title: "Compra confirmada" });
      setConfirmDialog(false);
      setSelectedOrder(null);
      setAmazonOrderId("");
      setActualCost("");
      setPurchaseNotes("");
      setVerifyResult(null);
      setCartResult(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  async function reportIssue() {
    if (!selectedOrder) return;
    try {
      await fetch(`/api/admin/orders/${selectedOrder.id}/purchase-issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ issue: issueText }),
      });
      qc.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/purchases/summary"] });
      toast({ title: "Problema reportado" });
      setIssueDialog(false);
      setSelectedOrder(null);
      setIssueText("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  return (
    <div>
      <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5" /> Centro de Compras
      </h2>

      {/* KPIs */}
      {!summaryLoading && summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="rounded-lg p-4 bg-amber-50 text-amber-800 border border-amber-200">
            <p className="text-xs font-medium mb-1">Pendientes</p>
            <p className="font-display font-bold text-2xl">{summary.pendingPurchase}</p>
          </div>
          <div className="rounded-lg p-4 bg-green-50 text-green-800 border border-green-200">
            <p className="text-xs font-medium mb-1">Comprados</p>
            <p className="font-display font-bold text-2xl">{summary.purchased}</p>
          </div>
          <div className="rounded-lg p-4 bg-emerald-50 text-emerald-800 border border-emerald-200">
            <p className="text-xs font-medium mb-1">Ganancia Total</p>
            <p className="font-display font-bold text-2xl">{formatUSD(summary.totalProfit)}</p>
          </div>
          <div className="rounded-lg p-4 bg-red-50 text-red-800 border border-red-200">
            <p className="text-xs font-medium mb-1">Con Problemas</p>
            <p className="font-display font-bold text-2xl">{summary.issues}</p>
          </div>
        </div>
      )}

      {/* Pending Purchases */}
      <div className="mb-8">
        <h3 className="font-display font-bold text-sm mb-3 text-gray-700 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" /> Pedidos por Comprar ({purchaseOrders.length})
        </h3>
        {ordersLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-lg" />)}</div>
        ) : purchaseOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay pedidos pendientes de compra</p>
          </div>
        ) : (
          <div className="space-y-3">
            {purchaseOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden" data-testid={`purchase-order-${order.id}`}>
                {/* Order Header */}
                <div className="p-4 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-copikon-navy text-white flex items-center justify-center font-bold text-xs">
                      {order.orderNumber.slice(-4)}
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">
                        {formatShortDate(order.createdAt)} · {order.items.length} producto{order.items.length > 1 ? "s" : ""} · {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${adminStatusColors[order.status]}`}>
                      {ADMIN_STATUS_LABELS[order.status]}
                    </Badge>
                    <Badge className={`text-xs ${purchaseStatusColors[(order as any).amazonPurchaseStatus || ""]}`}>
                      {purchaseStatusLabels[(order as any).amazonPurchaseStatus || ""]}
                    </Badge>
                    <span className="font-bold text-base text-copikon-red">{formatUSD(order.totalUsd)}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-4 pb-2">
                  <div className="divide-y divide-gray-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 py-2 text-sm">
                        <img src={proxyImageUrl(item.image)} alt="" className="w-10 h-10 object-contain rounded bg-gray-50" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-medium">{item.name}</p>
                          <p className="text-xs text-gray-400">ASIN: {item.amazonAsin} · x{item.quantity} · {item.weight} lbs</p>
                        </div>
                        <span className="text-xs font-bold shrink-0">{formatUSD(item.priceUsd)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Purchase Issue Notes */}
                {(order as any).amazonPurchaseStatus === "issue" && (order as any).amazonPurchaseNotes && (
                  <div className="mx-4 mb-3 p-3 bg-red-50 rounded-lg border border-red-200 text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    {(order as any).amazonPurchaseNotes}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="p-4 pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => verifyPrices(order)}
                    disabled={isVerifying && selectedOrder?.id === order.id}
                    data-testid={`btn-verify-${order.id}`}
                    className="text-xs"
                  >
                    {isVerifying && selectedOrder?.id === order.id ? (
                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Verificando...</>
                    ) : (
                      <><RefreshCw className="w-3 h-3 mr-1" /> Verificar Precios</>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => { setSelectedOrder(order); generateCart(order); }}
                    disabled={isGeneratingCart && selectedOrder?.id === order.id}
                    className="text-xs bg-copikon-navy hover:bg-slate-800"
                    data-testid={`btn-cart-${order.id}`}
                  >
                    {isGeneratingCart && selectedOrder?.id === order.id ? (
                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generando...</>
                    ) : (
                      <><ShoppingCart className="w-3 h-3 mr-1" /> Generar Carrito</>
                    )}
                  </Button>

                  {(order.amazonCartUrl || (order as any).amazonPurchaseStatus === "cart_ready") && (
                    <a href={order.amazonCartUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="text-xs bg-orange-500 hover:bg-orange-600">
                        <ExternalLink className="w-3 h-3 mr-1" /> Abrir Compra
                      </Button>
                    </a>
                  )}

                  <Button
                    size="sm"
                    className="text-xs bg-green-600 hover:bg-green-700"
                    onClick={() => { setSelectedOrder(order); setActualCost(String((order as any).amazonCostUsd || "")); setConfirmDialog(true); }}
                    data-testid={`btn-confirm-${order.id}`}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmar Compra
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => { setSelectedOrder(order); setIssueDialog(true); }}
                    data-testid={`btn-issue-${order.id}`}
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" /> Reportar Problema
                  </Button>
                </div>

                {/* Verify Results (inline) */}
                {verifyResult && selectedOrder?.id === order.id && (
                  <div className="px-4 pb-4">
                    <div className={`p-4 rounded-lg border ${verifyResult.hasIssues ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-sm flex items-center gap-1">
                          {verifyResult.hasIssues ? (
                            <><AlertTriangle className="w-4 h-4 text-red-600" /> <span className="text-red-700">Revisar Manualmente</span></>
                          ) : (
                            <><CheckCircle2 className="w-4 h-4 text-green-600" /> <span className="text-green-700">Listo para Comprar</span></>
                          )}
                        </h4>
                        <div className="text-right text-xs">
                          <p>Costo actual: <strong>{formatUSD(verifyResult.totalCurrentCost)}</strong></p>
                          <p>Ganancia est.: <strong className={verifyResult.estimatedProfit >= 0 ? "text-green-700" : "text-red-700"}>{formatUSD(verifyResult.estimatedProfit)}</strong></p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {verifyResult.verification?.map((v: any, idx: number) => (
                          <div key={idx} className={`flex items-center justify-between text-xs p-2 rounded ${v.status === "OK" ? "bg-white" : "bg-red-100"}`}>
                            <span className="truncate flex-1 mr-2">{v.name}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              {v.originalBasePrice !== undefined && <span className="text-gray-500">${v.originalBasePrice} → ${v.currentPrice}</span>}
                              <Badge className={`text-[10px] ${v.status === "OK" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {v.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cart Generated Results (inline) */}
                {cartResult && selectedOrder?.id === order.id && (
                  <div className="px-4 pb-4">
                    <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                      <h4 className="font-bold text-sm text-blue-700 mb-2 flex items-center gap-1">
                        <ShoppingCart className="w-4 h-4" /> Carrito Generado
                      </h4>
                      <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                        <div>
                          <p className="text-gray-500">Costo Proveedor</p>
                          <p className="font-bold">{formatUSD(cartResult.estimatedAmazonCost)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Cobrado al Cliente</p>
                          <p className="font-bold">{formatUSD(cartResult.totalChargedToCustomer)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Ganancia Est.</p>
                          <p className={`font-bold ${cartResult.estimatedProfit >= 0 ? "text-green-700" : "text-red-700"}`}>{formatUSD(cartResult.estimatedProfit)}</p>
                        </div>
                      </div>
                      <div className="space-y-1 mb-3">
                        {cartResult.productLinks?.map((link: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded">
                            <span className="truncate flex-1 mr-2">{link.name}</span>
                            <a href={link.amazonUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline shrink-0 flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> Ver Producto
                            </a>
                          </div>
                        ))}
                      </div>
                      <a href={cartResult.amazonCartUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" /> Abrir Carrito de Compra
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Purchases */}
      {completedPurchases.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-sm mb-3 text-gray-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" /> Compras Completadas ({completedPurchases.length})
          </h3>
          <div className="space-y-2">
            {completedPurchases.slice(0, 10).map(order => (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <div>
                    <p className="font-display font-bold text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">
                      {formatShortDate(order.createdAt)} · {order.items.length} items
                      {(order as any).amazonOrderIds?.length > 0 && (
                        <> · Orden: {(order as any).amazonOrderIds.join(", ")}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Venta</p>
                    <p className="font-bold">{formatUSD(order.totalUsd)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Costo</p>
                    <p className="font-medium text-gray-600">{formatUSD((order as any).amazonCostUsd || 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Ganancia</p>
                    <p className={`font-bold ${((order as any).profitUsd || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatUSD((order as any).profitUsd || 0)}
                    </p>
                  </div>
                  <Badge className={`text-xs ${adminStatusColors[order.status]}`}>
                    {ADMIN_STATUS_LABELS[order.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Purchase Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" /> Confirmar Compra
            </DialogTitle>
            <DialogDescription>
              Pedido {selectedOrder?.orderNumber} · {formatUSD(selectedOrder?.totalUsd || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">ID(s) de Orden</Label>
              <Input
                placeholder="Ej: 111-1234567-1234567"
                value={amazonOrderId}
                onChange={e => setAmazonOrderId(e.target.value)}
                data-testid="input-amazon-order-id"
              />
              <p className="text-xs text-gray-400 mt-1">Separa múltiples IDs con coma</p>
            </div>
            <div>
              <Label className="text-sm">Costo Real (USD)</Label>
              <Input
                type="number"
                placeholder={String((selectedOrder as any)?.amazonCostUsd || "0")}
                value={actualCost}
                onChange={e => setActualCost(e.target.value)}
                data-testid="input-actual-cost"
              />
              <p className="text-xs text-gray-400 mt-1">
                Estimado: {formatUSD((selectedOrder as any)?.amazonCostUsd || 0)}
              </p>
            </div>
            <div>
              <Label className="text-sm">Notas (opcional)</Label>
              <Textarea
                placeholder="Observaciones sobre la compra..."
                value={purchaseNotes}
                onChange={e => setPurchaseNotes(e.target.value)}
                data-testid="textarea-purchase-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>Cancelar</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={confirmPurchase} data-testid="btn-submit-confirm">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Confirmar Compra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Dialog */}
      <Dialog open={issueDialog} onOpenChange={setIssueDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" /> Reportar Problema
            </DialogTitle>
            <DialogDescription>
              Pedido {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-sm">Describe el problema</Label>
            <Textarea
              placeholder="Ej: Producto no disponible, precio subió demasiado, ASIN incorrecto..."
              value={issueText}
              onChange={e => setIssueText(e.target.value)}
              className="min-h-[100px]"
              data-testid="textarea-issue"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={reportIssue} disabled={!issueText.trim()} data-testid="btn-submit-issue">
              <AlertTriangle className="w-4 h-4 mr-1" /> Reportar Problema
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                  {(order as any).amazonPurchaseStatus && (
                    <Badge className={`text-[10px] ${purchaseStatusColors[(order as any).amazonPurchaseStatus || ""]}`}>
                      {purchaseStatusLabels[(order as any).amazonPurchaseStatus || ""]}
                    </Badge>
                  )}
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
              {/* Show items preview */}
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1 shrink-0 text-xs">
                    <img src={proxyImageUrl(item.image)} alt="" className="w-6 h-6 object-contain" />
                    <span className="truncate max-w-[120px]">{item.name}</span>
                    <span className="text-gray-400">x{item.quantity}</span>
                  </div>
                ))}
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
          { id: "purchases", icon: ShoppingCart, label: "Compras" },
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
        {tab === "purchases" && <PurchasesTab token={token!} />}
        {tab === "products" && <ProductsTab token={token!} />}
        {tab === "customers" && <CustomersTab token={token!} />}
        {tab === "settings" && <SettingsTab token={token!} />}
      </main>
    </div>
  );
}
