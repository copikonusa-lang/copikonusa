export default function PaymentMethods() {
  const methods = [
    {
      id: 1,
      name: "Zelle (USD)",
      icon: "🏦",
      instructions: "Envía al email: pagos@copikonusa.com",
      details: "Nombre: CopikonUSA LLC",
      note: "Solo para montos en dólares americanos"
    },
    {
      id: 2,
      name: "Pago Móvil (Bolívares)",
      icon: "📱",
      instructions: "Banco: Banesco | CI: J-12345678-9",
      details: "Teléfono: 0412-000-0000",
      note: "Tipo de cambio BCV del día de confirmación"
    },
    {
      id: 3,
      name: "Transferencia Bancaria USD",
      icon: "🏦",
      instructions: "Banco: Bank of America | Routing: 026009593",
      details: "Cuenta: 1234567890 | CopikonUSA LLC",
      note: "Para montos mayores a $500 USD"
    },
    {
      id: 4,
      name: "Transferencia Venezolana (Bs)",
      icon: "🇻🇪",
      instructions: "Banco: Mercantil | Cuenta: 0105-1234-56-1234567890",
      details: "A nombre de: CopikonUSA C.A.",
      note: "Tipo de cambio BCV vigente"
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-display font-bold mb-2">Métodos de Pago</h1>
      <p className="text-gray-500 mb-8">Elige el método más conveniente para ti.</p>

      <div className="space-y-4">
        {methods.map(method => (
          <div key={method.id} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{method.icon}</span>
              <h3 className="font-semibold">{method.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-1">{method.instructions}</p>
            <p className="text-sm text-gray-600 mb-2">{method.details}</p>
            <p className="text-xs text-gray-400 italic">{method.note}</p>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-amber-800">
          <strong>💡 Importante:</strong> Después de realizar el pago, envía el comprobante por WhatsApp al +58 412-000-0000 para confirmar tu pedido.
        </p>
      </div>
    </div>
  );
}
