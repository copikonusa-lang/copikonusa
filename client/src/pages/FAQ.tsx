export default function FAQ() {
  const faqs = [
    {
      q: "¿Cuánto tiempo tarda en llegar mi pedido?",
      a: "El tiempo estimado de entrega es de 15 a 20 días hábiles desde la confirmación del pago. Enviamos semanalmente los lunes."
    },
    {
      q: "¿Cómo pago mi pedido?",
      a: "Aceptamos Zelle (USD), transferencia bancaria internacional y pago móvil en Bolívares. El tipo de cambio es el oficial BCV del día de confirmación."
    },
    {
      q: "¿Puedo pedir cualquier producto de Amazon?",
      a: "Casi todos los productos de Amazon.com que tengan envío a Florida. Excepto artículos restringidos por aduanas venezolanas como alimentos perecederos, medicamentos o materiales peligrosos."
    },
    {
      q: "¿Dónde hacen entrega?",
      a: "Hacemos entregas a nivel nacional. Tenemos oficinas en Caracas, Valencia y Maracaibo. También enviamos por MRW a todo el país."
    },
    {
      q: "¿Qué pasa si el producto llega dañado?",
      a: "Si el producto llega con daños visibles en el embalaje, documentamos y procesamos el reclamo con Amazon. Tienes 48 horas para reportar cualquier daño al recibir."
    },
    {
      q: "¿Puedo rastrear mi pedido?",
      a: "Sí. Una vez que tu pedido sale de Miami, te enviamos el número de guía aérea por WhatsApp para que puedas hacer seguimiento."
    },
    {
      q: "¿Cómo se calcula el precio final?",
      a: "El precio incluye: precio de Amazon + 15% de comisión de servicio + $5.50 USD por libra de peso. El precio en Bolívares se calcula al tipo de cambio BCV."
    },
    {
      q: "¿Puedo cancelar mi pedido?",
      a: "Puedes cancelar antes de que confirmemos la compra en Amazon (primeras 24 horas). Una vez comprado en Amazon, no es posible cancelar ya que el producto está en camino."
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-display font-bold mb-2">Preguntas Frecuentes</h1>
      <p className="text-gray-500 mb-8">Todo lo que necesitas saber sobre nuestro servicio.</p>
      
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
            <p className="text-gray-600 text-sm">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
