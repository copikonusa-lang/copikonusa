import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Search, Star, Loader2, Package, ArrowRight, ShoppingCart, TrendingUp } from "lucide-react";
import { formatUSD, formatBs } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { proxyImageUrl } from "@/lib/imageProxy";

interface SearchResult {
  asin: string;
  name: string;
  image: string;
  amazonPrice: number;
  totalPriceUsd: number;
  weight: number;
  rating: number;
  reviews: number;
  isPrime: boolean;
  badge: string | null;
}

function getBadgeStyle(badge: string) {
  switch (badge) {
    case "Más vendido": return "bg-[#C45500] text-white";
    case "Popular": return "bg-[#007185] text-white";
    case "Nuevo": return "bg-[#E47911] text-white";
    default: return "bg-[#C45500] text-white";
  }
}

export default function SearchDropdown() {
  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [localResults, setLocalResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExternal, setLoadingExternal] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search - fast local first, then external
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setLocalResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setOpen(true);

      try {
        // First: search local products (instant)
        const localRes = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=8`);
        const localData = await localRes.json();
        setLocalResults(localData.products || []);
        setLoading(false);

        // Then: search external catalog (may take a moment)
        setLoadingExternal(true);
        const externalRes = await fetch(`/api/search/amazon?q=${encodeURIComponent(query)}`);
        const externalData = await externalRes.json();
        setResults(externalData.products || []);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setLoading(false);
        setLoadingExternal(false);
      }
    }, 300); // Faster debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/catalogo?search=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  // Click on local product → open product page
  const handleLocalClick = (product: any) => {
    setOpen(false);
    setQuery("");
    setLocation(`/producto/${product.slug}`);
  };

  // Click on external result → save to DB and open as product
  const handleExternalClick = async (product: SearchResult) => {
    setOpen(false);
    setQuery("");
    try {
      // Import product to our catalog via API, then redirect
      const res = await fetch("/api/search/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asin: product.asin, name: product.name, image: product.image, price: product.amazonPrice, weight: product.weight, rating: product.rating, reviews: product.reviews }),
      });
      if (res.ok) {
        const imported = await res.json();
        if (imported.slug) {
          setLocation(`/producto/${imported.slug}`);
          return;
        }
      }
    } catch {}
    // Fallback: search catalog with similar terms
    setLocation(`/catalogo?search=${encodeURIComponent(product.name.split(" ").slice(0, 5).join(" "))}`);
  };

  const addToCartFromSearch = (product: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: 0,
      name: product.name,
      slug: product.asin,
      category: "imported",
      description: "",
      basePrice: product.amazonPrice,
      weight: product.weight,
      totalPriceUsd: product.totalPriceUsd,
      image: product.image,
      images: [],
      rating: product.rating,
      reviews: product.reviews,
      badge: product.badge || "",
      specs: { ASIN: product.asin },
      isActive: true,
      isManual: false,
      amazonAsin: product.asin,
      createdAt: new Date().toISOString(),
      oldPrice: null,
    } as any);
    setOpen(false);
    setQuery("");
  };

  const hasAnyResults = localResults.length > 0 || results.length > 0;

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl">
      <form onSubmit={handleSubmit} className="flex w-full">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => { if (query.trim().length >= 2 && hasAnyResults) setOpen(true); }}
            placeholder="Buscar cualquier producto de USA..."
            className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-l-lg focus:outline-none focus:border-copikon-red focus:ring-1 focus:ring-copikon-red text-sm"
            data-testid="input-search"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <button
          type="submit"
          className="bg-copikon-red text-white px-5 rounded-r-lg hover:bg-red-800 transition flex items-center font-medium text-sm"
          data-testid="button-search"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
        </button>
      </form>

      {/* Dropdown results */}
      {open && (query.trim().length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] max-h-[75vh] overflow-y-auto">
          
          {/* Local results from CopikonUSA catalog */}
          {localResults.length > 0 && (
            <div>
              <div className="px-4 py-2.5 bg-gradient-to-r from-gray-50 to-white border-b text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-copikon-red" /> En nuestro catálogo — Entrega inmediata
              </div>
              {localResults.map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => handleLocalClick(p)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition border-b border-gray-50 cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-lg bg-white border border-gray-100 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={proxyImageUrl(p.image)}
                      alt={p.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-2 group-hover:text-copikon-red transition">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-copikon-red">{formatUSD(p.totalPriceUsd)}</span>
                      <span className="text-xs text-gray-400">{formatBs(p.totalPriceUsd)}</span>
                      {p.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-gray-400">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {p.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  {p.badge && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${getBadgeStyle(p.badge)}`}>
                      {p.badge}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-copikon-red transition shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* External results (more products from USA) */}
          {loadingExternal && results.length === 0 && (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-copikon-red" />
              Buscando más productos en USA...
            </div>
          )}

          {results.length > 0 && (
            <div>
              <div className="px-4 py-2.5 bg-gradient-to-r from-gray-50 to-white border-b text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Más productos disponibles ({results.length})
              </div>
              {results.slice(0, 10).map((p) => (
                <div
                  key={p.asin}
                  onClick={() => handleExternalClick(p)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition border-b border-gray-50 cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-lg bg-white border border-gray-100 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-2 group-hover:text-copikon-red transition">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-copikon-red">{formatUSD(p.totalPriceUsd)}</span>
                      <span className="text-xs text-gray-400">{formatBs(p.totalPriceUsd)}</span>
                      {p.isPrime && <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">Envío rápido</span>}
                    </div>
                    {p.rating > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-2.5 h-2.5 ${i < Math.round(p.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400">({p.reviews.toLocaleString()})</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {p.badge && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${getBadgeStyle(p.badge)}`}>
                        {p.badge}
                      </span>
                    )}
                    <button
                      onClick={(e) => addToCartFromSearch(p, e)}
                      className="flex items-center gap-1 text-[11px] bg-copikon-red text-white px-2.5 py-1.5 rounded-lg hover:bg-red-800 transition font-medium"
                    >
                      <ShoppingCart className="w-3 h-3" /> Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !loadingExternal && results.length === 0 && localResults.length === 0 && query.trim().length >= 2 && (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No se encontraron productos para "{query}"
              <p className="text-xs text-gray-400 mt-1">Intenta con otras palabras o revisa la ortografía</p>
            </div>
          )}

          {/* Footer - see all results */}
          {hasAnyResults && (
            <button
              onClick={handleSubmit}
              className="w-full px-4 py-3 text-center text-sm text-copikon-red hover:bg-red-50 transition font-semibold border-t flex items-center justify-center gap-2"
            >
              Ver todos los resultados para "{query}" <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
