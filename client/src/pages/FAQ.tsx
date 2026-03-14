import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "¿Cómo funciona CopikonUSA?", a: "Somos tu tienda americana en Venezuela. Tú eliges el producto en nuestra web, realizas tu pago, nosotros gestionamos la compra en Estados Unidos y te lo entregamos en tu sucursal más cercana." },
  { q: "¿Cuánto tarda la entrega?", a: "El tiempo promedio es de 7 a 16 días. El producto llega a nuestro almacén en USA en 2-3 días, el envío aéreo sale cada viernes y llega el martes a Venezuela. El miércoles está disponible en tu sucursal." },
  { q: "¿Los productos son originales?", a: "Sí, todos los productos son 100% originales y nuevos, comprados directamente de proveedores autorizados en Estados Unidos." },
  { q: "¿Cómo se calcula el precio?", a: "El precio que ves en nuestra web ya incluye todo: costo del producto, gestión de compra y envío aéreo. Sin sorpresas ni cargos ocultos." },
  { q: "¿Qué métodos de pago aceptan?", a: "Aceptamos Zelle (USD), Binance USDT, y transferencia/pago móvil en bolívares. Los precios en bolívares se calculan a 1.50x la tasa BCV del día." },
  { q: "¿Cuánto tiempo tengo para pagar?", a: "Tienes 6 horas después de crear tu pedido para realizar el pago y subir tu comprobante. Si no pagas en ese tiempo, el pedido se cancela automáticamente." },
  { q: "¿Puedo pedir varios productos?", a: "Sí, puedes agregar hasta 5 unidades de cada producto. Los pedidos con múltiples productos se envían juntos." },
  { q: "¿Tienen política de devoluciones?", a: "Sí, tienes 7 días después de recibir el producto para solicitar una devolución. CopikonUSA cubre el costo de la devolución." },
  { q: "¿Qué sucursales tienen?", a: "Tenemos sucursales en Caracas, Barquisimeto, Valencia y Maracay. También ofrecemos envío a domicilio por un costo adicional." },
  { q: "¿Puedo hacer seguimiento de mi pedido?", a: "Sí, desde tu cuenta puedes ver el estado de tu pedido en tiempo real. También recibirás notificaciones por WhatsApp en cada cambio de estado." },
  { q: "¿Qué productos NO pueden enviar?", a: "No enviamos armas, químicos peligrosos, medicamentos con receta, baterías de litio grandes, ni productos restringidos por aduanas." },
  { q: "¿Hacen envíos express?", a: "Por ahora solo ofrecemos envío aéreo estándar con salida los viernes. Próximamente tendremos opción express con recargo." },
];

export default function FAQ() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-2xl text-center mb-2">Preguntas Frecuentes</h1>
      <p className="text-gray-500 text-center mb-8">Todo lo que necesitas saber sobre CopikonUSA</p>

      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-lg border border-gray-200 px-4">
            <AccordionTrigger className="text-sm font-medium text-left" data-testid={`faq-trigger-${i}`}>
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-gray-600 leading-relaxed">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-10 text-center bg-copikon-navy text-white rounded-lg p-8">
        <h2 className="font-display font-bold text-lg mb-2">¿Tienes otra pregunta?</h2>
        <p className="text-gray-300 text-sm mb-4">Contáctanos por WhatsApp y te respondemos al instante</p>
        <a href="https://wa.me/584120000000" target="_blank" rel="noopener noreferrer" className="inline-block bg-green-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition">
          Escribir por WhatsApp
        </a>
      </div>
    </div>
  );
}
