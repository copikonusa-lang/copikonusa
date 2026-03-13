import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";

const CATEGORIES = [
  "Todo",
  "Electrónicos",
  "Computación",
  "Hogar",
  "Moda",
  "Deportes",
  "Belleza",
  "Juguetes",
  "Oficina",
];

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todo");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "rating" | "default">("default");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filtered = useMemo(() => {
    let result = products.filter(p => p.isActive);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    }

    if (category !== "Todo") {
      result = result.filter(p => p.category === category);
    }

    if (sortBy === "price_asc") result = [...result].sort((a, b) => a.totalPriceUsd - b.totalPriceUsd);
    else if (sortBy === "price_desc") result = [...result].sort((a, b) => b.totalPriceUsd - a.totalPriceUsd);
    else if (sortBy === "rating") result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return result;
  }, [products, search, category, sortBy]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-catalog-search"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="border border-input rounded-md px-3 py-2 text-sm bg-background"
          data-testid="select-catalog-sort"
        >
          <option value="default">Ordenar por</option>
          <option value="price_asc">Precio: Menor a Mayor</option>
          <option value="price_desc">Precio: Mayor a Menor</option>
          <option value="rating">Mejor calificados</option>
        </select>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {CATEGORIES.map(cat => (
          <Badge
            key={cat}
            variant={category === cat ? "default" : "outline"}
            className={`cursor-pointer whitespace-nowrap ${
              category === cat ? "bg-copikon-red border-copikon-red" : ""
            }`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No se encontraron productos para "{search}"</p>
          <Button variant="ghost" onClick={() => { setSearch(""); setCategory("Todo"); }} className="mt-2">
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{filtered.length} productos encontrados</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
