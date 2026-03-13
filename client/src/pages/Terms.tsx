export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-display font-bold mb-8">Términos y Condiciones</h1>
      
      <div className="prose prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Servicio de Intermediación</h2>
          <p className="text-gray-600">CopikonUSA es una plataforma de intermediación que facilita la compra de productos de Amazon.com y su envío a Venezuela. No somos una tienda minorista ni actuamos como vendedor directo de los productos listados en Amazon.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Proceso de Compra</h2>
          <p className="text-gray-600">Al realizar un pedido, el cliente autoriza a CopikonUSA a comprar en su nombre los productos seleccionados en Amazon.com. El precio final incluye el precio de Amazon, tarifas de servicio e internación, y costos de envío aéreo.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Disponibilidad y Precios</h2>
          <p className="text-gray-600">Los precios mostrados son estimados y pueden variar según la disponibilidad y el tipo de cambio vigente al momento de la compra. CopikonUSA se reserva el derecho de ajustar los precios antes de confirmar el pedido.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Tiempo de Entrega</h2>
          <p className="text-gray-600">El tiempo estimado de entrega es de 15 a 20 días hábiles desde la confirmación del pago. Este plazo puede variar según la disponibilidad en Amazon, aduana venezolana y distribución local.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Pagos</h2>
          <p className="text-gray-600">Aceptamos pagos en USD mediante Zelle, transferencia bancaria y en Bolívares mediante pago móvil. El pedido será procesado una vez confirmado el pago por nuestro equipo.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Limitaciones</h2>
          <p className="text-gray-600">No aceptamos pedidos de artículos restringidos por regulaciones venezolanas o que Amazon no envíe a casillas en Miami. CopikonUSA no se hace responsable por daños de fábrica ni diferencias estéticas menores.</p>
        </section>
      </div>
    </div>
  );
}
