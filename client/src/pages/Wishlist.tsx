import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Wishlist() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["/api/wishlist"],
    queryFn: async () => {
      const res = await fetch("/api/wishlist", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!token,
  });

  const remove = useMutation({
    mutationFn: async (productId: number) => {
      await fetch(`/api/wishlist/${productId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({ title: "Eliminado de favoritos" });
    },
  });

  if (!user) return (
    <div className="text-center py-16">
      <p className="text-gray-500">Debes <Link href="/login" className="text-copikon-red">iniciar sesión</Link> para ver tus favoritos</p>
    </div>
  );

  if (isLoading) return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-display font-bold mb-6">Mis Favoritos</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No tienes productos en favoritos</p>
          <Link href="/catalog"><Button>Explorar catálogo</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item: any) => (
            <div key={item.id} className="relative">
              <ProductCard product={item.product} />
              <button
                onClick={() => remove.mutate(item.productId)}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
