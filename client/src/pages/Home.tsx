import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Truck, Shield, CreditCard, Clock, ChevronRight, ArrowRight, Star, ShoppingCart, Zap, Tag, TrendingUp, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import { CATEGORIES, type Product } from "@shared/schema";
import { useState, useEffect, useRef } from "react";
import { formatUSD, formatBs } from "@/lib/utils";
import { useCart } from "@/lib/cart";

// ===== HERO CAROUSEL =====
function HeroBanner() {
  const [, setLocation] = useLocation();
  const slides = [
    {
      title: "Tu tienda americana en Venezuela",
      subtitle: "Miles de productos originales de Estados Unidos con envío aéreo semanal. Paga en dólares o bolívares.",
      cta: "Explorar catálogo",
      link: "/catalogo",
      bg: "from-copikon-navy via-copikon-navy to-gray-900",
      accent: "text-copikon-logo-red",
    },
    {
      title: "Tecnología al mejor precio",
      subtitle: "iPhones, laptops, AirPods, consolas y más. Originales con garantía y envío incluido.",
      cta: "Ver tecnología",
      link: "/catalogo?category=tech",
      bg: "from-gray-900 via-gray-800 to-copikon-navy",
      accent: "text-blue-400",
    },
    {
      title: "Calzado y Moda desde USA",
      subtitle: "Nike, Adidas, New Balance, Crocs y las mejores marcas. Todas las tallas disponibles.",
      cta: "Ver calzado",
      link: "/catalogo?category=shoes",
      bg: "from-copikon-navy to-gray-900",
      accent: "text-orange-400",
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className={`relative bg-gradient-to-r ${slide.bg} text-white overflow-hidden transition-all duration-700`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(227,30,36,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(27,42,74,0.4) 0%, transparent 50%)`,
        }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl">
          <h1 className="font-display font-bold text-2xl md:text-4xl leading-tight mb-3" data-testid="text-hero-title">
            {slide.title.split(" ").slice(0, -2).join(" ")}{" "}
            <span className={slide.accent}>{slide.title.split(" ").slice(-2).join(" ")}</span>
          </h1>
          <p className="text-gray-300 text-base mb-6 leading-relaxed max-w-lg">
            {slide.subtitle}
          </p>
          <Link href={slide.link}>
            <Button className="bg-copikon-red hover:bg-red-800 text-white px-6 h-11 font-semibold" data-testid="button-hero-cta">
              {slide.cta} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Slide indicators */}
        <div className="flex gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "bg-copikon-red w-8" : "bg-white/30 w-4 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== VALUE PROPS BAR =====
function ValueProps() {
  const props = [
    { icon: Truck, title: "Envío Aéreo Semanal", desc: "USA → Venezuela cada viernes" },
    { icon: Shield, title: "100% Originales", desc: "Productos con garantía" },
    { icon: CreditCard, title: "Paga como quieras", desc: "Zelle, Binance, Bolívares" },
    { icon: Clock, title: "Entrega 7-10 días", desc: "El más rápido del mercado" },
  ];

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {props.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <p.icon className="w-4 h-4 text-copikon-red" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">{p.title}</p>
                <p className="text-[11px] text-gray-500">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== CATEGORY CARDS (Amazon-style with product count) =====
function CategoryCards() {
  const { data } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ["/api/products?limit=1"],
  });

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-display font-bold text-lg text-gray-900">Comprar por categoría</h2>
        <Link href="/catalogo" className="text-sm text-copikon-red hover:underline flex items-center gap-1">
          Ver todas <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2.5">
        {CATEGORIES.slice(0, 8).map(cat => (
          <Link
            key={cat.id}
            href={`/catalogo?category=${cat.id}`}
            className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-copikon-red hover:shadow-md transition-all group"
            data-testid={`card-category-${cat.id}`}
          >
            <span className="text-2xl mb-1.5">{cat.icon}</span>
            <span className="text-[11px] text-center text-gray-700 group-hover:text-copikon-red font-medium leading-tight">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ===== PRODUCT ROW (horizontal scrollable) =====
function ProductRow({ title, queryKey, icon: Icon, bgClass = "", linkHref, linkText = "Ver más" }: {
  title: string; queryKey: string; icon: any; bgClass?: string; linkHref: string; linkText?: string;
}) {
  const { data, isLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: [queryKey],
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className={bgClass}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
            <Icon className="w-5 h-5 text-copikon-red" />
            {title}
          </h2>
          <Link href={linkHref} className="text-sm text-copikon-red hover:underline flex items-center gap-1">
            {linkText} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-72 rounded-lg" />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3"
          >
            {data?.products?.slice(0, 10).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ===== DEALS SECTION with countdown =====
function DealsSection() {
  const { data } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ["/api/products?limit=8&sort=price_asc"],
  });

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
    <section className="bg-gradient-to-r from-[#CC0C39] to-[#E31E24] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <Zap className="w-5 h-5" /> Ofertas de la Semana
            </h2>
            <p className="text-red-200 text-sm mt-1">Próximo envío sale en:</p>
          </div>
          <div className="flex gap-2">
            {[
              { val: countdown.days, label: "Días" },
              { val: countdown.hours, label: "Hrs" },
              { val: countdown.mins, label: "Min" },
              { val: countdown.secs, label: "Seg" },
            ].map((t, i) => (
              <div key={i} className="bg-white/15 backdrop-blur rounded-lg px-3 py-2 text-center min-w-[50px]">
                <p className="font-display font-bold text-lg">{String(t.val).padStart(2, "0")}</p>
                <p className="text-[10px] text-red-200">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/10 rounded-lg p-4 h-64"><Skeleton className="w-full h-full bg-white/20" /></div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ===== PROMO BANNERS =====
function PromoBanners() {
  const banners = [
    {
      title: "Tecnología desde USA",
      desc: "iPhones, AirPods, Laptops y más",
      link: "/catalogo?category=tech",
      icon: "💻",
      color: "from-blue-600 to-blue-800",
    },
    {
      title: "Belleza y Cuidado",
      desc: "Las mejores marcas americanas",
      link: "/catalogo?category=beauty",
      icon: "💄",
      color: "from-pink-500 to-rose-600",
    },
    {
      title: "Gaming",
      desc: "Consolas, accesorios y juegos",
      link: "/catalogo?category=gaming",
      icon: "🎮",
      color: "from-purple-600 to-purple-800",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {banners.map((b, i) => (
          <Link
            key={i}
            href={b.link}
            className={`bg-gradient-to-r ${b.color} text-white rounded-lg p-5 hover:shadow-lg transition-shadow group`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{b.icon}</span>
              <div>
                <h3 className="font-bold text-sm">{b.title}</h3>
                <p className="text-xs text-white/80">{b.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ===== CTA BOTTOM =====
function CTABanner() {
  return (
    <section className="bg-copikon-navy text-white py-10">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="font-display font-bold text-xl mb-3">¿Listo para comprar desde Estados Unidos?</h2>
        <p className="text-gray-300 mb-5 max-w-lg mx-auto text-sm">
          Regístrate gratis y empieza a comprar los mejores productos con envío directo a Venezuela.
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

// ===== MAIN HOME PAGE =====
export default function Home() {
  return (
    <>
      <HeroBanner />
      <ValueProps />
      <CategoryCards />
      <PromoBanners />
      <DealsSection />
      <ProductRow
        title="Los Más Vendidos"
        queryKey="/api/products?limit=10&sort=rating"
        icon={TrendingUp}
        linkHref="/catalogo?sort=rating"
      />
      <ProductRow
        title="Nuevos Productos"
        queryKey="/api/products?limit=10&sort=newest"
        icon={Gift}
        bgClass="bg-gray-50"
        linkHref="/catalogo?sort=newest"
        linkText="Ver nuevos"
      />
      <CTABanner />
    </>
  );
}
