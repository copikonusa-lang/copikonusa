import { Link, useLocation } from "wouter";
import { ShoppingCart, Heart, User, Menu, X, Search, ChevronDown, Package, LogOut, Settings, LayoutDashboard, Home, Phone } from "lucide-react";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@shared/schema";
import { CopikonLogo } from "./CopikonLogo";
import { PerplexityAttribution } from "./PerplexityAttribution";
import SearchDropdown from "./SearchDropdown";

function Header() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/catalogo?search=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top bar */}
      <div className="bg-copikon-navy text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>Envío aéreo semanal USA → Venezuela</span>
          <div className="hidden sm:flex items-center gap-4">
            <a href="https://wa.me/584120000000" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 flex items-center gap-1">
              <Phone className="w-3 h-3" /> WhatsApp
            </a>
            <Link href="/faq" className="hover:text-gray-300">Ayuda</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            data-testid="button-mobile-menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <CopikonLogo height={36} data-testid="img-logo" />
          </Link>

          {/* Search - Real-time Amazon search with dropdown */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <SearchDropdown />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Wishlist */}
            {isAuthenticated && (
              <Link href="/wishlist" className="p-2 hover:bg-gray-100 rounded-lg hidden sm:block" data-testid="link-wishlist">
                <Heart className="w-5 h-5 text-gray-600" />
              </Link>
            )}

            {/* Cart */}
            <Link href="/carrito" className="p-2 hover:bg-gray-100 rounded-lg relative" data-testid="link-cart">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-copikon-red text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0 rounded-full">
                  {totalItems}
                </Badge>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded-lg text-sm"
                  data-testid="button-user-menu"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="hidden sm:inline text-gray-700 max-w-[100px] truncate">{user?.name?.split(" ")[0]}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link href="/mis-pedidos" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                      <Package className="w-4 h-4" /> Mis Pedidos
                    </Link>
                    <Link href="/wishlist" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                      <Heart className="w-4 h-4" /> Lista de Deseos
                    </Link>
                    <Link href="/perfil" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                      <Settings className="w-4 h-4" /> Mi Perfil
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-copikon-red" onClick={() => setUserMenuOpen(false)}>
                        <LayoutDashboard className="w-4 h-4" /> Panel Admin
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1">
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600" data-testid="button-logout">
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" className="bg-copikon-red hover:bg-red-800 text-sm" data-testid="button-login">
                  Ingresar
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden mt-3 flex">
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-copikon-red text-sm"
            data-testid="input-search-mobile"
          />
          <button type="submit" className="bg-copikon-red text-white px-3 rounded-r-lg">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Category nav - horizontal bar */}
      <nav className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-0.5 overflow-x-auto py-1.5 text-sm" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <a href="#/catalogo" className="inline-flex items-center px-3 py-1.5 rounded-md hover:bg-gray-200 whitespace-nowrap font-medium text-copikon-navy shrink-0" data-testid="link-all-categories"
              onClick={(e) => { e.preventDefault(); setLocation('/catalogo'); }}
            >
              Todos
            </a>
            {CATEGORIES.map(cat => (
              <a key={cat.id} href={`#/catalogo?category=${cat.id}`} className="inline-flex items-center px-2.5 py-1.5 rounded-md hover:bg-gray-200 whitespace-nowrap text-gray-700 text-xs shrink-0" data-testid={`link-category-${cat.id}`}
                onClick={(e) => { e.preventDefault(); setLocation(`/catalogo?category=${cat.id}`); }}>
                <span className="mr-1">{cat.icon}</span> {cat.name}
              </a>
            ))}
          </div>
        </div>
        <style>{`.nav-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 absolute left-0 right-0 shadow-lg max-h-[70vh] overflow-y-auto">
          <div className="p-4 space-y-1">
            <Link href="/" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
              <Home className="w-4 h-4" /> Inicio
            </Link>
            <Link href="/catalogo" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-50 font-medium" onClick={() => setMenuOpen(false)}>
              Todos los productos
            </Link>
            <div className="border-t border-gray-100 my-2" />
            {CATEGORIES.map(cat => (
              <a key={cat.id} href={`#/catalogo?category=${cat.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
                onClick={(e) => { e.preventDefault(); setLocation(`/catalogo?category=${cat.id}`); setMenuOpen(false); }}
              >
                <span>{cat.icon}</span> {cat.name}
              </a>
            ))}
            <div className="border-t border-gray-100 my-2" />
            <Link href="/faq" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm" onClick={() => setMenuOpen(false)}>Preguntas Frecuentes</Link>
            <Link href="/metodos-de-pago" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm" onClick={() => setMenuOpen(false)}>Métodos de Pago</Link>
            <Link href="/sobre-nosotros" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm" onClick={() => setMenuOpen(false)}>Sobre Nosotros</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-copikon-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <CopikonLogo height={36} variant="white" className="mb-4" />
            <p className="text-gray-300 text-sm leading-relaxed">
              Tu tienda americana favorita. Los mejores productos de Estados Unidos con envío aéreo semanal desde USA a Venezuela.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Comprar</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/catalogo" className="hover:text-white">Catálogo Completo</Link></li>
              <li><Link href="/catalogo?category=tech" className="hover:text-white">Tecnología</Link></li>
              <li><Link href="/catalogo?category=phones" className="hover:text-white">Teléfonos</Link></li>
              <li><Link href="/catalogo?category=gaming" className="hover:text-white">Gaming</Link></li>
              <li><Link href="/catalogo?category=beauty" className="hover:text-white">Belleza</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Información</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/sobre-nosotros" className="hover:text-white">Sobre Nosotros</Link></li>
              <li><Link href="/faq" className="hover:text-white">Preguntas Frecuentes</Link></li>
              <li><Link href="/metodos-de-pago" className="hover:text-white">Métodos de Pago</Link></li>
              <li><Link href="/terminos" className="hover:text-white">Términos y Condiciones</Link></li>
              <li><Link href="/devoluciones" className="hover:text-white">Política de Devoluciones</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="https://wa.me/584120000000" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  WhatsApp: +58 412-000-0000
                </a>
              </li>
              <li>
                <a href="mailto:info@copikonusa.com" className="hover:text-white">info@copikonusa.com</a>
              </li>
            </ul>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mt-6 mb-3">Sucursales</h4>
            <p className="text-sm text-gray-300">Caracas · Barquisimeto · Valencia · Maracay</p>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-xs bg-white/10 px-2 py-1 rounded">Zelle</span>
              <span className="text-xs bg-white/10 px-2 py-1 rounded">Binance</span>
              <span className="text-xs bg-white/10 px-2 py-1 rounded">Pago Móvil</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} CopikonUSA. Todos los derechos reservados.</p>
          <a href="https://www.perplexity.ai/computer" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            Created with Perplexity Computer
          </a>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Show tooltip briefly after 3 seconds for first-time visitors
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 4000);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [hasInteracted]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
      {/* Tooltip */}
      <div
        className={`bg-white text-gray-800 text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 max-w-[200px] ${
          showTooltip ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
        }`}
      >
        <div className="relative">
          ¿Necesitas ayuda? Escríbenos
          {/* Arrow pointing right */}
          <div className="absolute top-1/2 -right-6 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-white" />
        </div>
      </div>

      {/* Button */}
      <a
        href="https://wa.me/584120000000?text=Hola%2C%20me%20interesa%20un%20producto%20de%20CopikonUSA"
        target="_blank"
        rel="noopener noreferrer"
        className="relative bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-[#20BD5A] transition-all hover:scale-110 active:scale-95"
        data-testid="button-whatsapp"
        aria-label="Contactar por WhatsApp"
        onMouseEnter={() => { setShowTooltip(true); setHasInteracted(true); }}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setHasInteracted(true)}
      >
        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current relative z-10">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
