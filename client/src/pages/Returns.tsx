import { RefreshCcw, Shield, Clock, MessageCircle } from "lucide-react";

export default function Returns() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-2xl text-center mb-2">Política de Devoluciones</h1>
      <p className="text-gray-500 text-center mb-8">Tu satisfacción es nuestra prioridad</p>

      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-display font-bold text-base">Plazo de devolución</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Tienes <strong>7 días calendarios</strong> desde que recibes tu producto para solicitar una devolución. El producto debe estar en su empaque original y en las mismas condiciones en que fue recibido.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <RefreshCcw className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="font-display font-bold text-base">Costo de devolución</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>CopikonUSA cubre el costo de la devolución.</strong> No tienes que pagar nada adicional para devolver un producto. El reembolso se procesa dentro de las 48 horas siguientes a la recepción del producto devuelto.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-display font-bold text-base">Casos especiales</h2>
          </div>
          <ul className="text-sm text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
            <li><strong>Producto agotado después del pago:</strong> Reembolso completo del 100%.</li>
            <li><strong>Producto dañado en tránsito:</strong> Reembolso o reposición sin costo.</li>
            <li><strong>Producto diferente al pedido:</strong> Reposición inmediata + devolución gratuita.</li>
            <li><strong>Precio baja después de tu compra:</strong> El diferencial se mantiene como ganancia de CopikonUSA (no se ajusta el precio).</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="font-display font-bold text-base">¿Cómo solicitar una devolución?</h2>
          </div>
          <ol className="text-sm text-gray-600 leading-relaxed space-y-2 list-decimal list-inside">
            <li>Contacta a nuestro equipo por WhatsApp al +58 412-000-0000</li>
            <li>Indica tu número de pedido y el motivo de la devolución</li>
            <li>Te indicaremos cómo y dónde entregar el producto</li>
            <li>Una vez recibido y verificado, procesamos tu reembolso en 48h</li>
          </ol>
        </div>
      </div>

      <div className="mt-8 text-center">
        <a href="https://wa.me/584120000000" target="_blank" rel="noopener noreferrer" className="inline-block bg-green-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 transition">
          Contactar soporte por WhatsApp
        </a>
      </div>
    </div>
  );
}
