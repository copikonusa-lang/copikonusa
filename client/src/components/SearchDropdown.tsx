import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Search, Star, Loader2, TrendingUp, Clock, ArrowRight, X } from "lucide-react";
import { formatUSD, formatBs } from "@/lib/utils";
import { proxyImageUrl } from "@/lib/imageProxy";
import { apiRequest } from "@/lib/queryClient";

interface AutocompleteResult {
  id: number;
  name: string;
  slug: string;
  image: string;
  totalPriceUsd: number;
  rating: number;
  reviews: number;
  badge: string | null;
  category: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  tech: "Tecnología", phones: "Teléfonos", home: "Hogar y Cocina",
  clothing: "Ropa y Moda", beauty: "Belleza", health: "Salud",
  sports: "Deportes", toys: "Juguetes", gaming: "Gaming",
  baby: "Bebés y Niños", pets: "Mascotas", food: "Comestibles",
  auto: "Autos y Herramientas", office: "Oficina", shoes: "Calzado",
};

const TRENDING_SEARCHES = [
  "iPhone", "AirPods", "PlayStation", "Nike", "Samsung",
  "Creatina", "Proteína", "MacBook", "Perfume", "Lego",
];

function getBadgeStyle(badge: string) {
  switch (badge) {
    case "Más vendido": return "bg-[#C45500] text-white";
    case "Popular": return "bg-[#007185] text-white";
    default: return "bg-[#C45500] text-white";
  }
}

export default function SearchDropdown() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AutocompleteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fast autocomplete search
  const doSearch = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    
    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(q.trim())}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      if (!controller.signal.aborted) {
        setResults(data);
        setSelectedIndex(-1);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error("Search error:", e);
        setResults([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => doSearch(query), 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Navigate to search results page
  const goToSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setOpen(false);
    setQuery(searchQuery.trim());
    setLocation(`/catalogo?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Navigate to product
  const goToProduct = (slug: string) => {
    setOpen(false);
    setQuery("");
    setLocation(`/producto/${slug}`);
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      goToProduct(results[selectedIndex].slug);
    } else {
      goToSearch(query);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    const maxIndex = results.length - 1;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, maxIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const showTrending = open && query.trim().length < 2;
  const showResults = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative flex-1 max-w-2xl">
      <form onSubmit={handleSubmit} className="flex w-full">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar productos en CopikonUSA..."
            className="w-full px-4 py-2.5 pl-10 pr-8 border-2 border-gray-200 rounded-l-lg focus:outline-none focus:border-copikon-red focus:ring-0 text-sm bg-white"
            autoComplete="off"
            data-testid="input-search"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-copikon-red text-white px-6 rounded-r-lg hover:bg-red-800 transition flex items-center font-semibold text-sm gap-1.5 shrink-0"
          data-testid="button-search"
        >
          <Search className="w-4 h-4" />
          Buscar
        </button>
      </form>

      {/* Trending searches - shown when input focused but no query */}
      {showTrending && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] overflow-hidden">
          <div className="px-4 py-2.5 border-b bg-gray-50/80">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-copikon-red" /> Búsquedas populares
            </span>
          </div>
          <div className="py-1">
            {TRENDING_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => { setQuery(term); goToSearch(term); }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition flex items-center gap-3 group"
              >
                <Clock className="w-4 h-4 text-gray-300 group-hover:text-copikon-red transition" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{term}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-400 ml-auto transition" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search results dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] max-h-[70vh] overflow-hidden">
          
          {/* Loading state */}
          {loading && results.length === 0 && (
            <div className="px-4 py-6 text-center">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-copikon-red" />
              <span className="text-sm text-gray-500">Buscando...</span>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="overflow-y-auto max-h-[60vh]">
              {results.map((p, index) => (
                <div
                  key={p.id}
                  onClick={() => goToProduct(p.slug)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${
                    index === selectedIndex ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  data-testid={`search-result-${p.id}`}
                >
                  {/* Product image */}
                  <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={proxyImageUrl(p.image)}
                      alt=""
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-1 leading-snug">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-copikon-red">{formatUSD(p.totalPriceUsd)}</span>
                      <span className="text-[11px] text-gray-400">{formatBs(p.totalPriceUsd)}</span>
                      {p.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {p.rating.toFixed(1)}
                          <span className="text-gray-300">({p.reviews >= 1000 ? `${(p.reviews/1000).toFixed(0)}K` : p.reviews})</span>
                        </span>
                      )}
                      <span className="text-[10px] text-gray-300">{CATEGORY_LABELS[p.category] || p.category}</span>
                    </div>
                  </div>

                  {/* Badge */}
                  {p.badge && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded whitespace-nowrap shrink-0 ${getBadgeStyle(p.badge)}`}>
                      {p.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-500">No encontramos productos para "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Intenta con otras palabras</p>
            </div>
          )}

          {/* See all results footer */}
          {results.length > 0 && (
            <button
              onClick={() => goToSearch(query)}
              className="w-full px-4 py-3 text-center text-sm text-copikon-red hover:bg-red-50 transition font-semibold border-t flex items-center justify-center gap-2 bg-gray-50/50"
            >
              Ver todos los resultados para "{query}" <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Loading indicator when results exist and still loading more */}
          {loading && results.length > 0 && (
            <div className="absolute top-2 right-2">
              <Loader2 className="w-4 h-4 animate-spin text-copikon-red" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
