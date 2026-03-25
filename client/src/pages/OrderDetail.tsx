import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, CheckCircle, Clock, Package, Truck, MapPin, Box, Upload, Camera, MessageCircle, AlertCircle, X, Image as ImageIcon } from "lucide-react";
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

const WHATSAPP_NUMBER = "17869695464";
const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function compressImage(file: File, maxSize: number = MAX_IMAGE_SIZE): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Scale down if very large
        const maxDim = 1600;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No canvas context"));
        ctx.drawImage(img, 0, 0, width, height);

        // Try quality 0.7 first, reduce if still too large
        let quality = 0.7;
        let result = canvas.toDataURL("image/jpeg", quality);
        while (result.length > maxSize * 1.37 && quality > 0.1) {
          // base64 is ~37% larger than binary
          quality -= 0.1;
          result = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(result);
      };
      img.onerror = () => reject(new Error("Error al cargar imagen"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Error al leer archivo"));
    reader.readAsDataURL(file);
  });
}

export default function OrderDetail() {
  const [, params] = useRoute("/pedido/:id");
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

  const uploadMutation = useMutation({
    mutationFn: async (paymentProof: string) => {
      const res = await fetch(`/api/orders/${params?.id}/proof`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentProof }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al enviar comprobante");
      }
      return res.json();
    },
    onSuccess: () => {
      setUploadSuccess(true);
      setBase64Data(null);
      queryClient.invalidateQueries({ queryKey: ["/api/orders", `/${params?.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/my"] });
    },
  });

  const handleFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert("Solo se permiten imágenes JPG, PNG o WebP");
      return;
    }
    try {
      setCompressing(true);
      const compressed = await compressImage(file);
      setPreview(compressed);
      setBase64Data(compressed);
    } catch {
      alert("Error al procesar la imagen. Intenta con otra.");
    } finally {
      setCompressing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const clearPreview = useCallback(() => {
    setPreview(null);
    setBase64Data(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-8"><Skeleton className="h-96 rounded-lg" /></div>;
  }

  if (!order) {
    return <div className="max-w-lg mx-auto px-4 py-16 text-center"><p className="text-gray-500">Pedido no encontrado</p></div>;
  }

  const clientStatus = ORDER_STATUS_MAP[order.status];
  const currentIdx = statusOrder.indexOf(clientStatus);
  const isPendingPayment = clientStatus === "pending_payment";
  const hasProof = !!order.paymentProof;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, adjunto comprobante de pago para pedido ${order.orderNumber}`)}`;

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

      {/* Payment proof section — only for pending_payment */}
      {isPendingPayment && !hasProof && !uploadSuccess && (
        <div className="bg-white rounded-lg border-2 border-yellow-300 p-5 mb-6">
          <h3 className="font-display font-bold text-base mb-1 flex items-center gap-2">
            <Camera className="w-5 h-5 text-copikon-red" />
            Enviar Comprobante de Pago
          </h3>
          <p className="text-sm text-gray-500 mb-4">Sube una captura de tu pago para que verifiquemos tu pedido.</p>

          {/* Payment instructions */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-copikon-red shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Instrucciones de Pago</p>
                <p className="text-gray-600 mt-1">
                  Método seleccionado: <span className="font-semibold">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
                </p>
              </div>
            </div>
            <div className="ml-6 mt-2 space-y-1 text-gray-600">
              {order.paymentMethod === "zelle" && (
                <p>Envía <span className="font-bold text-copikon-red">{formatUSD(order.totalUsd)}</span> USD por Zelle</p>
              )}
              {order.paymentMethod === "binance" && (
                <p>Envía <span className="font-bold text-copikon-red">{formatUSD(order.totalUsd)}</span> USDT por Binance Pay</p>
              )}
              {order.paymentMethod === "bank_vzla" && (
                <p>Realiza transferencia/pago móvil de <span className="font-bold text-copikon-red">{formatBs(order.totalUsd)}</span></p>
              )}
            </div>
            <p className="ml-6 mt-2 text-xs text-yellow-700 font-medium">
              Sube tu comprobante lo antes posible para agilizar tu pedido.
            </p>
          </div>

          {/* Upload zone */}
          {!preview ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-copikon-red bg-red-50"
                  : "border-gray-300 hover:border-copikon-red hover:bg-red-50/30"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {compressing ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-copikon-red border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Comprimiendo imagen...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Arrastra tu comprobante aquí o haz clic para seleccionar</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG o WebP • Máximo 5MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Preview */}
              <div className="relative border border-gray-200 rounded-lg overflow-hidden">
                <img src={preview} alt="Comprobante" className="w-full max-h-64 object-contain bg-gray-50" />
                <button
                  onClick={clearPreview}
                  className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              {/* Submit button */}
              <button
                onClick={() => base64Data && uploadMutation.mutate(base64Data)}
                disabled={uploadMutation.isPending}
                className="w-full bg-copikon-red text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Enviar Comprobante
                  </>
                )}
              </button>
              {uploadMutation.isError && (
                <p className="text-sm text-red-600 text-center">Error al enviar. Intenta de nuevo.</p>
              )}
            </div>
          )}

          {/* WhatsApp alternative */}
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-2">¿Prefieres enviarlo por WhatsApp?</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition"
            >
              <MessageCircle className="w-4 h-4" />
              Enviar por WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Upload success state */}
      {(uploadSuccess || (isPendingPayment && hasProof)) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-bold text-sm text-green-800">
                ¡Comprobante enviado!
              </h3>
              <p className="text-sm text-green-600 mt-1">
                Verificaremos tu pago pronto.
              </p>
            </div>
          </div>
          {hasProof && order.paymentProof && (
            <div className="mt-3 border border-green-200 rounded-lg overflow-hidden">
              <img
                src={order.paymentProof}
                alt="Comprobante enviado"
                className="w-full max-h-48 object-contain bg-white"
              />
            </div>
          )}
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Comprobante enviado • En espera de verificación
          </p>
        </div>
      )}

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
