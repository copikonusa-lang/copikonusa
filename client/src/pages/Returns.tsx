export default function Returns() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-display font-bold mb-2">Devoluciones y Garantías</h1>
      <p className="text-gray-500 mb-8">Nuestra política de satisfacción del cliente.</p>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Importante sobre devoluciones</h3>
          <p className="text-blue-800 text-sm">Dado que los productos provienen de Amazon.com en Estados Unidos, las devoluciones tienen consideraciones especiales relacionadas con el envío internacional.</p>
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-3">Productos Elegibles para Devolución</h2>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Productos que llegan con defectos de fábrica</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Artículos dañados durante el envío (con evidencia fotográfica)</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Productos incorrectos (diferente al pedido)</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Artículos incompletos o sin accesorios prometidos</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Proceso de Reclamación</h2>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3"><span className="bg-copikon-red text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span><span><strong>Reporta en 48 horas:</strong> Contacta nuestro WhatsApp con fotos del daño dentro de las 48 horas de recibido el producto.</span></li>
            <li className="flex gap-3"><span className="bg-copikon-red text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span><span><strong>Evaluación:</strong> Nuestro equipo revisa las fotos y el caso en 24-48 horas hábiles.</span></li>
            <li className="flex gap-3"><span className="bg-copikon-red text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span><span><strong>Solución:</strong> Ofrecemos reemplazo del producto en el siguiente vuelo o crédito para futura compra.</span></li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Garantía de Productos Electrónicos</h2>
          <p className="text-gray-600 text-sm mb-3">Los productos electrónicos tienen garantía del fabricante. Si el producto falla dentro del período de garantía:</p>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span> Te asesoramos para contactar directamente al fabricante</li>
            <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span> Facilitamos el proceso de reclamación en caso necesario</li>
          </ul>
        </section>

        <div className="bg-gray-50 border rounded-lg p-5">
          <p className="text-sm text-gray-600"><strong>Contacto para reclamos:</strong> WhatsApp +58 412-000-0000 o email reclamaciones@copikonusa.com</p>
        </div>
      </div>
    </div>
  );
}
