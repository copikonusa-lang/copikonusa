import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Truck, Shield, CreditCard, Clock, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES, type Product } from "@shared/schema";
import { useState, useEffect } from "react";

function HeroSection() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setLocation(`/catalogo?search=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-copikon-navy via-copikon-navy to-gray-900 text-white overflow-hidden">
      {/* Decorative pattern overlay instead of hero image */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(227,30,36,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(27,42,74,0.4) 0%, transparent 50%)`,
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <h1 className="font-display font-bold text-3xl md:text-5xl leading-tight mb-4" data-testid="text-hero-title">
            Tu tienda americana<br />
            <span className="text-copikon-logo-red">en Venezuela</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Productos originales de Estados Unidos con envío aéreo semanal. Paga en dólares o bolívares.
          </p>
          <form onSubmit={handleSearch} className="flex max-w-lg">
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="¿Qué estás buscando?"
              className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none text-sm"
              data-testid="input-hero-search"
            />
            <button type="submit" className="bg-copikon-red px-5 rounded-r-lg hover:bg-red-800 transition" data-testid="button-hero-search">
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function ValueProps() {
  const props = [
    { icon: Truck, title: "Envío Aéreo Semanal", desc: "Miami a Venezuela cada viernes" },
    { icon: Shield, title: "Productos Originales", desc: "100% originales con garantía" },
    { icon: CreditCard, title: "Paga como quieras", desc: "Zelle, Binance o Bolívares" },
    { icon: Clock, title: "Entrega en 7-10 días", desc: "El más rápido del mercado" },
  ];

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {props.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <p.icon className="w-5 h-5 text-copikon-red" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                <p className="text-xs text-gray-500">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display font-bold text-xl text-gray-900">Categorías</h2>
        <Link href="/catalogo" className="text-sm text-copikon-red hover:underline flex items-center gap-1">
          Ver todas <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
        {CATEGORIES.slice(0, 8).map(cat => (
          <Link key={cat.id} href={`/catalogo?category=${cat.id}`} className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-copikon-red hover:shadow-sm transition group" data-testid={`card-category-${cat.id}`}>
            <span className="text-2xl mb-1">{cat.icon}</span>
            <span className="text-xs text-center text-gray-700 group-hover:text-copikon-red font-medium">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function OffersSection() {
  const { data } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ["/api/products?limit=8&sort=price_asc"],
  });

  // Countdown: next Friday at midnight
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const getNextFriday = () => {
      const now = new Date();
      const day = now.getDay();
      const diff = (5 - day + 7) % 7 || 7;
      const friday = new Date(now);
      friday.setDate(now.getDate() + diff);
      friday.setHours(23, 59, 59, 0);
      return friday;
    };

    const update = () => {
      const target = getNextFriday();
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return;
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const products = data?.products?.filter(p => p.badge === "Oferta" || p.oldPrice).slice(0, 4);

  return (
    <section className="bg-gradient-to-r from-copikon-red to-red-800 text-white py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl">Ofertas de la Semana</h2>
            <p className="text-red-200 text-sm mt-1">Próximo envío sale en:</p>
          </div>
          <div className="flex gap-2">
            {[
              { val: countdown.days, label: "Días" },
              { val: countdown.hours, label: "Hrs" },
              { val: countdown.mins, label: "Min" },
              { val: countdown.secs, label: "Seg" },
            ].map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-lg px-3 py-2 text-center min-w-[52px]">
                <p className="font-display font-bold text-xl">{String(t.val).padStart(2, "0")}</p>
                <p className="text-xs text-red-200">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/10 rounded-lg p-4 h-64"><Skeleton className="w-full h-full bg-white/20" /></div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TopSellers() {
  const { data, isLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ["/api/products?limit=8&sort=rating"],
  });

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display font-bold text-xl text-gray-900">Más Vendidos</h2>
        <Link href="/catalogo?sort=rating" className="text-sm text-copikon-red hover:underline flex items-center gap-1">
          Ver más <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-72 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data?.products?.slice(0, 8).map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function CTABanner() {
  return (
    <section className="bg-copikon-navy text-white py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="font-display font-bold text-2xl mb-3">¿Listo para comprar?</h2>
        <p className="text-gray-300 mb-6 max-w-lg mx-auto">
          Regístrate gratis y empieza a comprar los mejores productos de Estados Unidos con envío directo a Venezuela.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/registro">
            <Button className="bg-copikon-red hover:bg-red-800 text-white px-6" data-testid="button-cta-register">
              Crear Cuenta Gratis
            </Button>
          </Link>
          <Link href="/catalogo">
            <Button variant="outline" className="border-white text-white hover:bg-white/10 px-6" data-testid="button-cta-catalog">
              Ver Catálogo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <ValueProps />
      <CategoriesGrid />
      <OffersSection />
      <TopSellers />
      <CTABanner />
    </>
  );
}
