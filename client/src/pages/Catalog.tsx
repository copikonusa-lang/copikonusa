import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState, useEffect, useCallback, useRef } from "react";
import { SlidersHorizontal, X, Star, Loader2, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES, type Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatUSD, formatBs } from "@/lib/utils";
import { proxyImageUrl } from "@/lib/imageProxy";

// Live search result from API (not yet in catalog)
interface LiveResult {
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

export default function Catalog() {
  const [location, setLocation] = useLocation();

  const getParams = () => {
    const fromSearch = new URLSearchParams(window.location.search);
    const hashParts = window.location.hash.split("?");
    const fromHash = hashParts.length > 1 ? new URLSearchParams(hashParts[1]) : new URLSearchParams();
    const merged = new URLSearchParams();
    fromHash.forEach((v, k) => merged.set(k, v));
    fromSearch.forEach((v, k) => merged.set(k, v));
    return merged;
  };
  const params = getParams();

  const [category, setCategory] = useState(params.get("category") || "");
  const [search, setSearch] = useState(params.get("search") || "");
  const [sort, setSort] = useState(params.get("sort") || "");
  const [page, setPage] = useState(1);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  // Track which live results are being imported
  const [importingAsins, setImportingAsins] = useState<Set<string>>(new Set());

  // Sync search from URL changes (e.g. when SearchDropdown navigates here)
  // Track both hash AND search params since wouter puts search in window.location.search
  const lastUrlRef = useRef(window.location.hash + window.location.search);

  useEffect(() => {
    const syncFromUrl = () => {
      const currentUrl = window.location.hash + window.location.search;
      if (currentUrl !== lastUrlRef.current) {
        lastUrlRef.current = currentUrl;
        const p = getParams();
        const newSearch = p.get("search") || "";
        const newCat = p.get("category") || "";
        setSearch(prev => {
          if (prev !== newSearch) {
            setPage(1);
            return newSearch;
          }
          return prev;
        });
        setCategory(prev => {
          if (prev !== newCat) {
            setPage(1);
            return newCat;
          }
          return prev;
        });
      }
    };

    // Direct search event from SearchDropdown — reliable for same-page search changes
    const handleSearchEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.search !== undefined) {
        setSearch(detail.search);
        setCategory(""); // Reset category so search covers all products
        setPage(1);
        lastUrlRef.current = window.location.hash + window.location.search;
      }
    };

    window.addEventListener("hashchange", syncFromUrl);
    window.addEventListener("popstate", syncFromUrl);
    window.addEventListener("copikon-search", handleSearchEvent);
    const interval = setInterval(syncFromUrl, 300);
    return () => {
      window.removeEventListener("hashchange", syncFromUrl);
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener("copikon-search", handleSearchEvent);
      clearInterval(interval);
    };
  }, []);

  // Initial sync on mount
  useEffect(() => {
    const p = getParams();
    const urlCat = p.get("category") || "";
    const urlSearch = p.get("search") || "";
    setCategory(urlCat);
    if (urlSearch) setSearch(urlSearch);
    setPage(1);
  }, [location]);

  // ─── LOCAL catalog search ───
  const queryStr = new URLSearchParams({
    ...(category && { category }),
    ...(search && { search }),
    ...(sort && { sort }),
    ...(minRating && { minRating: String(minRating) }),
    page: String(page),
    limit: "24",
  }).toString();

  const { data: localData, isLoading: localLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: [`/api/products?${queryStr}`],
  });

  // ─── LIVE API search (only when user searches something) ───
  const { data: liveData, isLoading: liveLoading } = useQuery<{ products: LiveResult[] }>({
    queryKey: ["/api/search/amazon", search, page],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/search/amazon?q=${encodeURIComponent(search)}&page=${page}`);
      return res.json();
    },
    enabled: !!search && search.trim().length >= 2 && !category, // Only search live when there's a text search query (not category browse)
    staleTime: 5 * 60 * 1000, // Cache for 5 min
    retry: 1,
  });

  // ─── MERGE results: live API first (most relevant), then local catalog ───
  const localProducts = localData?.products || [];
  const liveProducts = liveData?.products || [];
  const hasSearch = !!search && search.trim().length >= 2;

  // Build set of ASINs already in live results to deduplicate
  const liveAsins = new Set<string>();
  liveProducts.forEach(lp => liveAsins.add(lp.asin));

  // Filter out live results that already exist in local catalog (by ASIN)
  const localAsins = new Set<string>();
  localProducts.forEach(p => {
    if (p.amazonAsin) localAsins.add(p.amazonAsin);
  });
  const uniqueLiveProducts = liveProducts.filter(lp => !localAsins.has(lp.asin));

  // When searching: filter local results to only show relevant ones
  // This prevents accessories from showing up when user searches "laptops i5"
  const filteredLocalProducts = (() => {
    if (!hasSearch || uniqueLiveProducts.length === 0) return localProducts;
    
    // Extract core search words (ignore short words like "de", "en", "y")
    const searchWords = search.toLowerCase().split(/\s+/).filter(w => w.length >= 2);
    if (searchWords.length === 0) return localProducts;
    
    // Score each local product by how many search words appear in its name
    const scored = localProducts
      .filter(p => !p.amazonAsin || !liveAsins.has(p.amazonAsin)) // Deduplicate vs live
      .map(p => {
        const nameLower = (p.name || "").toLowerCase();
        const matchCount = searchWords.filter(w => nameLower.includes(w)).length;
        const matchRatio = matchCount / searchWords.length;
        return { product: p, matchRatio, matchCount };
      })
      // Only keep local results where at least half the search words match in the name
      .filter(s => s.matchRatio >= 0.5)
      // Sort by relevance (more matches first)
      .sort((a, b) => b.matchRatio - a.matchRatio || b.matchCount - a.matchCount);
    
    return scored.map(s => s.product);
  })();

  // For display
  const isSearching = localLoading || (hasSearch && liveLoading);
  const totalLocal = localData?.total || 0;
  const totalCombined = (hasSearch ? filteredLocalProducts.length : totalLocal) + uniqueLiveProducts.length;
  const totalPages = Math.max(
    localData ? Math.ceil(localData.total / 24) : 0,
    hasSearch && liveProducts.length > 0 ? page + 1 : 0 // Enable next page if live results exist
  );

  const catName = CATEGORIES.find(c => c.id === category)?.name;

  // Update category filter — set state directly and reset page
  // The interval syncs from URL for external navigation (SearchDropdown),
  // but sidebar clicks set state directly which takes priority until next URL change
  const updateFilters = useCallback((newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
  }, []);

  // Import a live result into local catalog and navigate to it
  const handleImportAndView = async (liveProduct: LiveResult) => {
    setImportingAsins(prev => { const s = new Set(prev); s.add(liveProduct.asin); return s; });
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
        window.scrollTo(0, 0);
        setLocation(`/producto/${data.slug}`);
      }
    } catch (e) {
      console.error("Import error:", e);
    } finally {
      setImportingAsins(prev => { const s = new Set(prev); s.delete(liveProduct.asin); return s; });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <a href="#/" className="hover:text-copikon-red">Inicio</a> / {catName || "Catálogo"} {search && `/ "${search}"`}
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
            <h3 className="font-display font-bold text-sm mb-3">Categorías</h3>
            <div className="space-y-1">
              <button
                onClick={() => updateFilters("")}
                className={`block w-full text-left text-sm px-2 py-1.5 rounded ${!category ? "bg-copikon-red text-white" : "hover:bg-gray-100"}`}
                data-testid="filter-category-all"
              >
                Todas
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => updateFilters(cat.id)}
                  className={`block w-full text-left text-sm px-2 py-1.5 rounded ${category === cat.id ? "bg-copikon-red text-white" : "hover:bg-gray-100"}`}
                  data-testid={`filter-category-${cat.id}`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4">
              <h3 className="font-display font-bold text-sm mb-3">Valoración mínima</h3>
              <div className="space-y-1">
                {[4, 3, 2, 1].map(r => (
                  <button
                    key={r}
                    onClick={() => setMinRating(minRating === r ? 0 : r)}
                    className={`flex items-center gap-1 w-full text-sm px-2 py-1.5 rounded ${minRating === r ? "bg-yellow-50 border border-yellow-200" : "hover:bg-gray-100"}`}
                    data-testid={`filter-rating-${r}`}
                  >
                    {Array.from({length: 5}).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                    ))}
                    <span className="text-gray-500 ml-1">y más</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-1 text-sm border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50"
                data-testid="button-mobile-filters"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filtros
              </button>
              <p className="text-sm text-gray-500">
                {isSearching ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando en USA...
                  </span>
                ) : (
                  <>
                    {totalCombined} productos {search && <span>para "<strong>{search}</strong>"</span>}
                  </>
                )}
              </p>
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px] text-sm" data-testid="select-sort">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Más populares</SelectItem>
                <SelectItem value="price_asc">Menor precio</SelectItem>
                <SelectItem value="price_desc">Mayor precio</SelectItem>
                <SelectItem value="rating">Mejor valorados</SelectItem>
                <SelectItem value="name">Nombre A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile filters */}
          {showFilters && (
            <div className="lg:hidden bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm">Filtros</h3>
                <button onClick={() => setShowFilters(false)}><X className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilters("")}
                  className={`text-xs px-3 py-1.5 rounded-full ${!category ? "bg-copikon-red text-white" : "bg-gray-100"}`}
                >
                  Todas
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilters(cat.id)}
                    className={`text-xs px-3 py-1.5 rounded-full ${category === cat.id ? "bg-copikon-red text-white" : "bg-gray-100"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LOCAL Products grid */}
          {localLoading && !hasSearch ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({length: 8}).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-lg" />
              ))}
            </div>
          ) : filteredLocalProducts.length === 0 && uniqueLiveProducts.length === 0 && !liveLoading && !localLoading ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-500 text-lg">No se encontraron productos</p>
              <p className="text-gray-400 text-sm mt-2">Intenta con otros filtros o busca algo diferente</p>
            </div>
          ) : hasSearch && !category ? (
            /* ─── SEARCH MODE: Live results FIRST, then relevant local results ─── */
            <>
              {/* Live API results (primary - most relevant) */}
              {(liveLoading || uniqueLiveProducts.length > 0) && (
                <div>
                  {/* Live loading skeleton */}
                  {liveLoading && uniqueLiveProducts.length === 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Array.from({length: 8}).map((_, i) => (
                        <div key={`live-skel-${i}`} className="animate-pulse">
                          <div className="bg-gray-100 rounded-lg h-72" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Live results cards */}
                  {uniqueLiveProducts.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uniqueLiveProducts.map(lp => {
                        const isImporting = importingAsins.has(lp.asin);
                        return (
                          <div
                            key={lp.asin}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group"
                            onClick={() => !isImporting && handleImportAndView(lp)}
                            data-testid={`live-product-${lp.asin}`}
                          >
                            {/* Image */}
                            <div className="relative bg-white p-4 flex items-center justify-center h-44">
                              {lp.badge && (
                                <span className={`absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold rounded z-10 ${
                                  lp.badge === "Más vendido" ? "bg-[#C45500] text-white" : "bg-[#007185] text-white"
                                }`}>
                                  {lp.badge}
                                </span>
                              )}
                              <img
                                src={proxyImageUrl(lp.image)}
                                alt={lp.name}
                                className="max-h-36 max-w-full object-contain group-hover:scale-105 transition-transform"
                                loading="lazy"
                                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
                              />
                              {isImporting && (
                                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-2 z-10">
                                  <Loader2 className="w-6 h-6 animate-spin text-copikon-red" />
                                  <span className="text-xs text-gray-500 font-medium">Abriendo...</span>
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="px-3 pb-3">
                              <p className="text-xs text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem] font-medium">{lp.name}</p>
                              <div className="mt-2 flex items-baseline gap-1.5">
                                <span className="text-base font-bold text-copikon-red">{formatUSD(lp.totalPriceUsd)}</span>
                                <span className="text-[10px] text-gray-400">{formatBs(lp.totalPriceUsd)}</span>
                              </div>
                              {lp.rating > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="flex">
                                    {Array.from({length: 5}).map((_, i) => (
                                      <Star key={i} className={`w-3 h-3 ${i < Math.round(lp.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                                    ))}
                                  </div>
                                  <span className="text-[10px] text-gray-400">
                                    {lp.reviews >= 1000 ? `${(lp.reviews / 1000).toFixed(lp.reviews >= 10000 ? 0 : 1)}K` : lp.reviews}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Local catalog results (secondary - filtered for relevance) */}
              {filteredLocalProducts.length > 0 && (
                <div className={uniqueLiveProducts.length > 0 ? "mt-8" : ""}>
                  {/* Divider between live and local */}
                  {uniqueLiveProducts.length > 0 && (
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex-1 border-t border-gray-200" />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                        <ShoppingBag className="w-3.5 h-3.5" /> En nuestro catálogo
                      </span>
                      <div className="flex-1 border-t border-gray-200" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredLocalProducts.map(p => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ─── BROWSE MODE: just local catalog (no search) ─── */
            <>
              {localProducts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {localProducts.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                data-testid="button-prev-page"
              >
                Anterior
              </Button>
              <span className="flex items-center text-sm text-gray-600 px-3">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages && uniqueLiveProducts.length === 0}
                onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                data-testid="button-next-page"
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
