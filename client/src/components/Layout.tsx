import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, User, Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items } = useCart();
  const { user } = useAuth();
  const cartCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-bold text-primary cursor-pointer">CopikonUSA</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/catalog">
              <span className={`text-sm font-medium cursor-pointer ${location === '/catalog' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>Catálogo</span>
            </Link>
            <Link href="/about">
              <span className={`text-sm font-medium cursor-pointer ${location === '/about' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>Nosotros</span>
            </Link>
            <Link href="/faq">
              <span className={`text-sm font-medium cursor-pointer ${location === '/faq' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>FAQ</span>
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">{cartCount}</span>
                )}
              </Button>
            </Link>
            {user ? (
              <Link href="/profile">
                <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">Iniciar Sesión</Button>
              </Link>
            )}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t p-4 space-y-2">
            <Link href="/catalog"><span className="block py-2 text-sm">Catálogo</span></Link>
            <Link href="/about"><span className="block py-2 text-sm">Nosotros</span></Link>
            <Link href="/faq"><span className="block py-2 text-sm">FAQ</span></Link>
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="border-t py-8 mt-16">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 CopikonUSA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
