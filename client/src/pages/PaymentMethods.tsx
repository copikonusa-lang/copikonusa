import { CreditCard, Bitcoin, Building, Shield, Clock } from "lucide-react";

export default function PaymentMethods() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-2xl text-center mb-2">Métodos de Pago</h1>
      <p className="text-gray-500 text-center mb-8">Elige cómo prefieres pagar tu pedido</p>

      <div className="space-y-4">
        {/* Zelle */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base">Zelle</h2>
              <p className="text-xs text-gray-500">Pago en dólares (USD)</p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-sm space-y-1">
            <p><strong>Email:</strong> pagos@copikonusa.com</p>
            <p><strong>Nombre:</strong> CopikonUSA LLC</p>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Envía el monto exacto en USD. El pago se refleja en minutos. Sube tu comprobante después del pago.
          </p>
        </div>

        {/* Binance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Bitcoin className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base">Binance (USDT)</h2>
              <p className="text-xs text-gray-500">Criptomoneda</p>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-sm space-y-1">
            <p><strong>Wallet:</strong> 0x1234567890abcdef</p>
            <p><strong>Red:</strong> Tron (TRC20)</p>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Envía USDT (Tether) por la red TRC20. Comisión mínima. Pago confirmado en minutos.
          </p>
        </div>

        {/* Bank */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Building className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base">Transferencia / Pago Móvil</h2>
              <p className="text-xs text-gray-500">Bolívares</p>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-sm space-y-1">
            <p><strong>Banco:</strong> Banesco</p>
            <p><strong>Cuenta:</strong> 01340000000000000000</p>
            <p><strong>RIF:</strong> J-12345678-9</p>
            <p><strong>Pago Móvil:</strong> 04120000000</p>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            El precio en bolívares se calcula a 1.50× la tasa BCV del día. Acepta transferencias y pago móvil.
          </p>
        </div>
      </div>

      {/* Important notes */}
      <div className="mt-8 space-y-3">
        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <Clock className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800">Plazo de pago: 6 horas</p>
            <p className="text-yellow-700">Después de crear tu pedido, tienes 6 horas para pagar y subir tu comprobante.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-lg p-4">
          <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-green-800">Compra segura</p>
            <p className="text-green-700">Todos los pagos son verificados manualmente por nuestro equipo antes de procesar tu pedido.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
