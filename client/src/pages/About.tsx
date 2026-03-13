import { Truck, Shield, Star, Users } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-display font-bold mb-2">¿Quiénes Somos?</h1>
      <p className="text-gray-500 mb-8">CopikonUSA — Tu puente directo con Amazon en Venezuela.</p>

      <div className="prose prose-sm max-w-none mb-8">
        <p className="text-gray-600 leading-relaxed">
          CopikonUSA nació en 2020 con una misión clara: hacer accesibles los productos de Amazon para todos los venezolanos. 
          Sabemos lo difícil que es conseguir tecnología, ropa, electrodomésticos y más a buenos precios en Venezuela.
          Por eso creamos un servicio confiable, transparente y rápido que te permite comprar desde la comodidad de tu casa.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { icon: Truck, title: "Envío Aéreo Semanal", desc: "Vuelos todos los lunes desde Miami" },
          { icon: Shield, title: "100% Seguro", desc: "Garantizamos la llegada de tu pedido" },
          { icon: Star, title: "+5000 Clientes", desc: "Confianza ganada año tras año" },
          { icon: Users, title: "Equipo Local", desc: "Venezolanos atendiendo venezolanos" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white border border-gray-100 rounded-xl p-4">
            <Icon className="h-6 w-6 text-copikon-red mb-2" />
            <h3 className="font-semibold text-sm mb-1">{title}</h3>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="font-display font-bold text-lg mb-3">Nuestros Valores</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li><strong>Transparencia:</strong> Precios claros sin costos ocultos</li>
          <li><strong>Confiabilidad:</strong> Más de 5 años de trayectoria</li>
          <li><strong>Servicio:</strong> Atención personalizada por WhatsApp 7 días</li>
          <li><strong>Velocidad:</strong> Envíos semanales con tracking en tiempo real</li>
        </ul>
      </div>
    </div>
  );
}
