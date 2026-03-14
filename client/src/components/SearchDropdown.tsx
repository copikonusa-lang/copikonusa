import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Search, Star, Loader2, Package } from "lucide-react";
import { formatUSD, formatBs } from "@/lib/utils";
import { useCart } from "@/lib/cart";

interface AmazonResult {
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
    default: return "bg-[#C45500] text-white";
  }
}

export default function SearchDropdown() {
  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AmazonResult[]>([]);
  const [localResults, setLocalResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<"local" | "amazon">("local");
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

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

  // Debounced search
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
        // First: search local products (fast)
        const localRes = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`);
        const localData = await localRes.json();
        setLocalResults(localData.products || []);

        // Then: search Amazon (may take a moment)
        const amazonRes = await fetch(`/api/search/amazon?q=${encodeURIComponent(query)}`);
        const amazonData = await amazonRes.json();
        setResults(amazonData.products || []);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setLoading(false);
      }
    }, 400);

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

  const handleResultClick = (product: AmazonResult) => {
    // Navigate to a special Amazon product view or add to cart
    setOpen(false);
    setQuery("");
    // For now, redirect to catalog search
    setLocation(`/catalogo?search=${encodeURIComponent(product.name.split(" ").slice(0, 4).join(" "))}`);
  };

  const addAmazonToCart = (product: AmazonResult, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: 0, // Temporary ID for Amazon products
      name: product.name,
      slug: product.asin,
      category: "amazon",
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

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl">
      <form onSubmit={handleSubmit} className="flex w-full">
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (query.trim().length >= 2 && (results.length > 0 || localResults.length > 0)) setOpen(true); }}
          placeholder="Buscar cualquier producto de EE.UU..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-copikon-red text-sm"
          data-testid="input-search"
        />
        <button
          type="submit"
          className="bg-copikon-red text-white px-4 rounded-r-lg hover:bg-red-800 transition flex items-center"
          data-testid="button-search"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </form>

      {/* Dropdown results */}
      {open && (query.trim().length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] max-h-[70vh] overflow-y-auto">
          {/* Local results from CopikonUSA catalog */}
          {localResults.length > 0 && (
            <div>
              <div className="px-3 py-2 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> En nuestro catálogo
              </div>
              {localResults.map((p: any) => (
                <a
                  key={p.id}
                  href={`#/producto/${p.slug}`}
                  onClick={() => { setOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition border-b border-gray-100"
                >
                  <img
                    src={`/api/img?url=${encodeURIComponent(p.image)}`}
                    alt={p.name}
                    className="w-10 h-10 object-contain rounded"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{p.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-copikon-red">{formatUSD(p.totalPriceUsd)}</span>
                      <span className="text-xs text-gray-400">{formatBs(p.totalPriceUsd)}</span>
                    </div>
                  </div>
                  {p.badge && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${getBadgeStyle(p.badge)}`}>
                      {p.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}

          {/* Amazon results */}
          {loading && results.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              Buscando productos en EE.UU...
            </div>
          )}

          {results.length > 0 && (
            <div>
              <div className="px-3 py-2 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> Más resultados ({results.length})
              </div>
              {results.slice(0, 12).map((p) => (
                <div
                  key={p.asin}
                  onClick={() => handleResultClick(p)}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50 transition border-b border-gray-100 cursor-pointer"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-12 h-12 object-contain rounded"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-1">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-copikon-red">{formatUSD(p.totalPriceUsd)}</span>
                      <span className="text-xs text-gray-400">{formatBs(p.totalPriceUsd)}</span>
                      {p.isPrime && <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded font-medium">Envío rápido</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-2.5 h-2.5 ${i < Math.round(p.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400">({p.reviews.toLocaleString()})</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {p.badge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${getBadgeStyle(p.badge)}`}>
                        {p.badge}
                      </span>
                    )}
                    <button
                      onClick={(e) => addAmazonToCart(p, e)}
                      className="text-[10px] bg-copikon-red text-white px-2 py-1 rounded hover:bg-red-800 transition font-medium"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length === 0 && localResults.length === 0 && query.trim().length >= 2 && (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              No se encontraron productos para "{query}"
            </div>
          )}

          {/* Footer */}
          {(results.length > 0 || localResults.length > 0) && (
            <button
              onClick={handleSubmit}
              className="w-full px-4 py-2.5 text-center text-sm text-copikon-red hover:bg-red-50 transition font-medium border-t"
            >
              Ver todos los resultados para "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
