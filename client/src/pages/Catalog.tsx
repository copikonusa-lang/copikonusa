import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Filter, SlidersHorizontal, X, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES, type Product } from "@shared/schema";

export default function Catalog() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");

  const [category, setCategory] = useState(params.get("category") || "");
  const [search, setSearch] = useState(params.get("search") || "");
  const [sort, setSort] = useState(params.get("sort") || "");
  const [page, setPage] = useState(1);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(location.split("?")[1] || "");
    setCategory(p.get("category") || "");
    setSearch(p.get("search") || "");
    setPage(1);
  }, [location]);

  const queryStr = new URLSearchParams({
    ...(category && { category }),
    ...(search && { search }),
    ...(sort && { sort }),
    ...(minRating && { minRating: String(minRating) }),
    page: String(page),
    limit: "20",
  }).toString();

  const { data, isLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: [`/api/products?${queryStr}`],
  });

  const totalPages = data ? Math.ceil(data.total / 20) : 0;
  const catName = CATEGORIES.find(c => c.id === category)?.name;

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
                onClick={() => setCategory("")}
                className={`block w-full text-left text-sm px-2 py-1.5 rounded ${!category ? "bg-copikon-red text-white" : "hover:bg-gray-100"}`}
                data-testid="filter-category-all"
              >
                Todas
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
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
                    {[...Array(5)].map((_, i) => (
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
                {data?.total || 0} productos {search && <span>para "<strong>{search}</strong>"</span>}
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
                  onClick={() => setCategory("")}
                  className={`text-xs px-3 py-1.5 rounded-full ${!category ? "bg-copikon-red text-white" : "bg-gray-100"}`}
                >
                  Todas
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`text-xs px-3 py-1.5 rounded-full ${category === cat.id ? "bg-copikon-red text-white" : "bg-gray-100"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-lg" />
              ))}
            </div>
          ) : data?.products?.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No se encontraron productos</p>
              <p className="text-gray-400 text-sm mt-2">Intenta con otros filtros o busca algo diferente</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data?.products?.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
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
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
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
