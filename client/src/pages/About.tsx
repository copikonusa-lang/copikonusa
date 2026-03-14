import { Truck, Shield, Users, Globe, MapPin, Star } from "lucide-react";
import { CopikonLogo } from "@/components/CopikonLogo";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6"><CopikonLogo height={56} /></div>
        <h1 className="font-display font-bold text-3xl text-gray-900 mb-3">Sobre CopikonUSA</h1>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Somos tu tienda americana en Venezuela. Nacimos con la misión de hacer accesibles los mejores productos de Estados Unidos para todos los venezolanos, con precios justos y envío confiable.
        </p>
      </div>

      {/* Mission */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-display font-bold text-lg mb-3 text-copikon-red">Nuestra Misión</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Ofrecer a los venezolanos acceso a productos originales de Estados Unidos con un servicio confiable, rápido y a precios transparentes. Queremos que comprar en línea sea una experiencia positiva para todos.
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-display font-bold text-lg mb-3 text-copikon-navy">Nuestra Visión</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Ser la plataforma líder de compras internacionales en Venezuela, expandiendo nuestra red de sucursales y servicios para llegar a más ciudades y ofrecer más opciones de entrega.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="font-display font-bold text-xl text-center mb-8">¿Por qué elegirnos?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: "Productos Originales", desc: "Todo 100% original y nuevo, directo de Estados Unidos." },
            { icon: Truck, title: "Envío Aéreo Semanal", desc: "Cada viernes sale un envío desde Miami directo a Venezuela." },
            { icon: Users, title: "Atención Personalizada", desc: "Soporte por WhatsApp 24/7 para resolver cualquier duda." },
            { icon: Globe, title: "Catálogo Amplio", desc: "Más de 145 productos en 15 categorías diferentes." },
            { icon: MapPin, title: "4 Sucursales", desc: "Recoge tu pedido en Caracas, Barquisimeto, Valencia o Maracay." },
            { icon: Star, title: "Precios Transparentes", desc: "Sin costos ocultos. El precio que ves incluye todo." },
          ].map((v, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-3">
                <v.icon className="w-5 h-5 text-copikon-red" />
              </div>
              <h3 className="font-display font-bold text-sm mb-1">{v.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-copikon-navy text-white rounded-lg p-8 text-center">
        <h2 className="font-display font-bold text-xl mb-6">¿Cómo funciona?</h2>
        <div className="grid sm:grid-cols-4 gap-6">
          {[
            { step: "1", title: "Elige", desc: "Selecciona productos de nuestro catálogo" },
            { step: "2", title: "Paga", desc: "Paga por Zelle, Binance o Bolívares" },
            { step: "3", title: "Esperamos", desc: "Gestionamos tu compra y lo enviamos por aéreo" },
            { step: "4", title: "Recibe", desc: "Recoge en sucursal o lo llevamos a tu casa" },
          ].map((s, i) => (
            <div key={i}>
              <div className="w-10 h-10 rounded-full bg-copikon-red text-white flex items-center justify-center mx-auto mb-3 font-display font-bold">
                {s.step}
              </div>
              <h3 className="font-bold text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-gray-300">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
