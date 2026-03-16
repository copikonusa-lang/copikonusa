import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Search, Star, Loader2, TrendingUp, Clock, ArrowRight, X, Globe, Package } from "lucide-react";
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

interface LiveSearchResult {
  asin: string;
  name: string;
  image: string;
  amazonPrice: number;
  totalPriceUsd: number;
  weight: number;
  rating: number;
  reviews: number;
  badge: string | null;
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

// Unified result type for merged display
type MergedResult = 
  | { type: "local"; data: AutocompleteResult }
  | { type: "live"; data: LiveSearchResult };

export default function SearchDropdown({ mobile = false }: { mobile?: boolean }) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [localResults, setLocalResults] = useState<AutocompleteResult[]>([]);
  const [liveResults, setLiveResults] = useState<LiveSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [importingAsin, setImportingAsin] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const liveAbortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const liveDebounceRef = useRef<ReturnType<typeof setTimeout>>();

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

  // Fast local autocomplete search
  const doLocalSearch = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();

    if (!q.trim() || q.trim().length < 2) {
      setLocalResults([]);
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
        setLocalResults(data);
        setSelectedIndex(-1);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setLocalResults([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Live API search — fires automatically while typing
  const doLiveSearch = useCallback(async (q: string) => {
    if (liveAbortRef.current) liveAbortRef.current.abort();

    if (!q.trim() || q.trim().length < 3) {
      setLiveResults([]);
      setLiveLoading(false);
      return;
    }

    const controller = new AbortController();
    liveAbortRef.current = controller;
    setLiveLoading(true);

    try {
      const res = await fetch(`/api/search/amazon?q=${encodeURIComponent(q.trim())}&page=1`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Live search failed");
      const data = await res.json();
      if (!controller.signal.aborted) {
        setLiveResults(data.products || []);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setLiveResults([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLiveLoading(false);
      }
    }
  }, []);

  // Debounced searches — both fire while typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (liveDebounceRef.current) clearTimeout(liveDebounceRef.current);

    if (!query.trim() || query.trim().length < 2) {
      setLocalResults([]);
      setLiveResults([]);
      setLoading(false);
      setLiveLoading(false);
      return;
    }

    // Local search: fast (150ms)
    setLoading(true);
    debounceRef.current = setTimeout(() => doLocalSearch(query), 150);

    // Live search: slightly slower (500ms) — fires at 3+ chars
    if (query.trim().length >= 3) {
      setLiveLoading(true);
      liveDebounceRef.current = setTimeout(() => doLiveSearch(query), 500);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (liveDebounceRef.current) clearTimeout(liveDebounceRef.current);
    };
  }, [query, doLocalSearch, doLiveSearch]);

  // Navigate to search results page
  const goToSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const trimmed = searchQuery.trim();
    setOpen(false);
    setQuery(trimmed);
    const encoded = encodeURIComponent(trimmed);
    // Clean any stale page-level query params
    if (window.location.search) {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
    const currentHash = window.location.hash.replace(/^#/, '').split('?')[0];
    if (currentHash === '/catalogo') {
      // Already on catalogo — emit custom event to update search state directly
      // then update the URL hash for browser history
      window.dispatchEvent(new CustomEvent('copikon-search', { detail: { search: trimmed } }));
      window.location.hash = `/catalogo?search=${encoded}`;
      window.scrollTo(0, 0);
    } else {
      setLocation(`/catalogo?search=${encoded}`);
    }
  };

  // Navigate to product (local — already in DB)
  const goToProduct = (slug: string) => {
    setOpen(false);
    setQuery("");
    window.scrollTo(0, 0);
    setLocation(`/producto/${slug}`);
  };

  // Import live result and navigate directly to product page
  const handleLiveClick = async (liveProduct: LiveSearchResult) => {
    if (importingAsin) return; // Prevent double-click
    setImportingAsin(liveProduct.asin);
    try {
      const res = await apiRequest("POST", "/api/search/import", {
        asin: liveProduct.asin,
        name: liveProduct.name,
        image: liveProduct.image,
        amazonPrice: liveProduct.amazonPrice,
        totalPriceUsd: liveProduct.totalPriceUsd,
        weight: liveProduct.weight,
        rating: liveProduct.rating,
        reviews: liveProduct.reviews,
        badge: liveProduct.badge,
      });
      const data = await res.json();
      if (data.slug) {
        setOpen(false);
        setQuery("");
        window.scrollTo(0, 0);
        setLocation(`/producto/${data.slug}`);
      }
    } catch (e) {
      console.error("Import error:", e);
      // Fallback: go to catalog search
      goToSearch(query);
    } finally {
      setImportingAsin(null);
    }
  };

  // Use a ref to hold latest submit logic so native event listener always has current state
  const submitRef = useRef<() => void>(() => {});

  // React form submit handler (backup — primary handling is via handleKeyDown and native listener)
  const handleSubmit = (e?: React.FormEvent | Event) => {
    if (e) e.preventDefault();
    inputRef.current?.blur();
    submitRef.current();
  };

  const formRef = useRef<HTMLFormElement>(null);

  // Native submit listener — handles iOS Safari virtual keyboard "Search" button
  // and any other native submit triggers. Uses capture phase to prevent form navigation.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const nativeHandler = (e: Event) => {
      e.preventDefault();
      // Blur input to dismiss mobile keyboard
      inputRef.current?.blur();
      submitRef.current();
    };
    form.addEventListener('submit', nativeHandler, true);
    return () => form.removeEventListener('submit', nativeHandler, true);
  }, []);

  // Merge local + live results into a single interleaved list
  // Local results first, then live results (deduplicated)
  const localNames = new Set(localResults.map(r => r.name.toLowerCase().slice(0, 40)));
  const filteredLive = liveResults
    .filter(lr => !localNames.has(lr.name.toLowerCase().slice(0, 40)));

  // Interleave: show local results, then live results — up to 10 total
  const mergedResults: MergedResult[] = [];
  const maxLocal = Math.min(localResults.length, filteredLive.length > 0 ? 5 : 8);
  const maxLive = Math.min(filteredLive.length, localResults.length > 3 ? 5 : 8);

  for (let i = 0; i < maxLocal; i++) {
    mergedResults.push({ type: "local", data: localResults[i] });
  }
  for (let i = 0; i < maxLive; i++) {
    mergedResults.push({ type: "live", data: filteredLive[i] });
  }

  // Keep submitRef updated with latest state for iOS Safari native event listener
  submitRef.current = () => {
    if (selectedIndex >= 0 && selectedIndex < mergedResults.length) {
      const item = mergedResults[selectedIndex];
      if (item.type === "local") {
        goToProduct(item.data.slug);
      } else {
        handleLiveClick(item.data);
      }
    } else {
      goToSearch(query);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      e.preventDefault();
      e.stopPropagation();
      // Blur to dismiss any virtual keyboard
      inputRef.current?.blur();
      submitRef.current();
      return;
    }
    if (!open) return;
    const maxIndex = mergedResults.length - 1;
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

  const clearSearch = () => {
    setQuery("");
    setLocalResults([]);
    setLiveResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const showTrending = open && query.trim().length < 2;
  const showResults = open && query.trim().length >= 2;
  const hasAnyResults = mergedResults.length > 0;

  return (
    <div ref={containerRef} className={`relative ${mobile ? 'w-full' : 'flex-1 max-w-2xl'}`}>
      <form ref={formRef} onSubmit={handleSubmit} action="javascript:void(0)" method="get" className="flex w-full">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={mobile ? "Buscar productos..." : "Buscar productos en CopikonUSA..."}
            className={`w-full px-4 py-2.5 pl-10 pr-8 border-2 border-gray-200 rounded-l-lg focus:outline-none focus:border-copikon-red focus:ring-0 text-sm bg-white [&::-webkit-search-cancel-button]:hidden ${mobile ? 'border' : 'border-2'}`}
            autoComplete="off"
            data-testid={mobile ? "input-search-mobile" : "input-search"}
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
        {/* Visible submit button — critical for iOS Safari to fire form submit */}
        <button
          type="submit"
          className={`bg-copikon-red text-white rounded-r-lg hover:bg-red-800 transition flex items-center font-semibold text-sm gap-1.5 shrink-0 ${mobile ? 'px-3' : 'px-6'}`}
          data-testid={mobile ? "button-search-mobile" : "button-search"}
        >
          <Search className="w-4 h-4" />
          {!mobile && "Buscar"}
        </button>
      </form>

      {/* Trending searches */}
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] max-h-[75vh] overflow-hidden">

          {/* Initial loading state — only when nothing to show yet */}
          {loading && !hasAnyResults && !liveLoading && (
            <div className="px-4 py-6 text-center">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-copikon-red" />
              <span className="text-sm text-gray-500">Buscando...</span>
            </div>
          )}

          {/* Combined results list */}
          {hasAnyResults && (
            <div className="overflow-y-auto max-h-[60vh]">
              {mergedResults.map((item, index) => {
                const isLocal = item.type === "local";
                const p = item.data;
                const isSelected = index === selectedIndex;
                const isBeingImported = !isLocal && importingAsin === (p as LiveSearchResult).asin;

                // Show section header when switching from local to live
                const prevItem = index > 0 ? mergedResults[index - 1] : null;
                const showLiveHeader = !isLocal && (prevItem === null || prevItem.type === "local");

                return (
                  <div key={isLocal ? `local-${(p as AutocompleteResult).id}` : `live-${(p as LiveSearchResult).asin}`}>
                    {/* Live results section header */}
                    {showLiveHeader && (
                      <div className="px-4 py-1.5 bg-gray-50/80 border-t border-b border-gray-100">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Más productos disponibles en USA
                          {liveLoading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                        </span>
                      </div>
                    )}

                    <div
                      onClick={() => {
                        if (isBeingImported) return;
                        if (isLocal) {
                          goToProduct((p as AutocompleteResult).slug);
                        } else {
                          handleLiveClick(p as LiveSearchResult);
                        }
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${
                        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                      } ${isBeingImported ? "opacity-70 pointer-events-none" : ""}`}
                      data-testid={isLocal ? `search-result-${(p as AutocompleteResult).id}` : `live-search-${(p as LiveSearchResult).asin}`}
                    >
                      {/* Product image */}
                      <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 p-1 flex items-center justify-center shrink-0 relative">
                        <img
                          src={proxyImageUrl(p.image)}
                          alt=""
                          className="max-w-full max-h-full object-contain"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        {isBeingImported && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                            <Loader2 className="w-4 h-4 animate-spin text-copikon-red" />
                          </div>
                        )}
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
                              {p.reviews > 0 && (
                                <span className="text-gray-300">({p.reviews >= 1000 ? `${(p.reviews/1000).toFixed(0)}K` : p.reviews})</span>
                              )}
                            </span>
                          )}
                          {isLocal && (p as AutocompleteResult).category && (
                            <span className="text-[10px] text-gray-300">{CATEGORY_LABELS[(p as AutocompleteResult).category] || (p as AutocompleteResult).category}</span>
                          )}
                          {!isLocal && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-500 font-medium">
                              <Package className="w-3 h-3" /> Envío aéreo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Badge */}
                      {p.badge && (
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded whitespace-nowrap shrink-0 ${getBadgeStyle(p.badge)}`}>
                          {p.badge}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Live loading indicator at the bottom when local results exist but live still loading */}
              {liveLoading && filteredLive.length === 0 && localResults.length > 0 && (
                <div className="px-4 py-3 flex items-center gap-2 text-gray-400 border-t bg-gray-50/50">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-xs">Buscando más productos en USA...</span>
                </div>
              )}
            </div>
          )}

          {/* No results at all */}
          {!loading && !liveLoading && !hasAnyResults && (
            <div className="px-4 py-8 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-500">No encontramos productos para "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Intenta con otras palabras</p>
            </div>
          )}

          {/* See all results footer */}
          {hasAnyResults && (
            <button
              onClick={() => goToSearch(query)}
              className="w-full px-4 py-3 text-center text-sm text-copikon-red hover:bg-red-50 transition font-semibold border-t flex items-center justify-center gap-2 bg-gray-50/50"
            >
              Ver todos los resultados para "{query}" <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Loading indicator overlay */}
          {(loading || liveLoading) && hasAnyResults && (
            <div className="absolute top-2 right-2">
              <Loader2 className="w-4 h-4 animate-spin text-copikon-red" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
