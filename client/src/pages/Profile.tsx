import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { User, Package, Heart, CreditCard, LogOut } from "lucide-react";

export default function Profile() {
  const { user, logout, updateProfile, isLoading } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", city: user?.city || "", address: user?.address || "" });

  if (!user) return <div className="text-center py-16 text-gray-500">Inicia sesión para ver tu perfil</div>;

  const handleSave = async () => {
    try {
      await updateProfile(form);
      toast({ title: "Perfil actualizado" });
      setEditing(false);
    } catch {
      toast({ title: "Error al actualizar", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-2xl font-display font-bold mb-6">Mi Perfil</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
        {editing ? (
          <div className="space-y-3">
            <div><Label>Nombre</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>Teléfono</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><Label>Ciudad</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
            <div><Label>Dirección</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isLoading} className="bg-copikon-red hover:bg-red-800">Guardar</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Nombre</span>
              <span className="font-medium text-sm">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Email</span>
              <span className="font-medium text-sm">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Teléfono</span>
              <span className="font-medium text-sm">{user.phone || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Ciudad</span>
              <span className="font-medium text-sm">{user.city || "-"}</span>
            </div>
            <Button variant="outline" onClick={() => setEditing(true)} className="mt-3 w-full">Editar Perfil</Button>
          </div>
        )}
      </div>

      <nav className="space-y-2">
        {[{ href: "/my-orders", icon: Package, label: "Mis Pedidos" }, { href: "/wishlist", icon: Heart, label: "Favoritos" }, { href: "/payment-methods", icon: CreditCard, label: "Métodos de Pago" }].map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg p-3 hover:border-gray-300 cursor-pointer">
              <Icon className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{label}</span>
            </div>
          </Link>
        ))}
        <button onClick={logout} className="flex items-center gap-3 w-full bg-white border border-gray-100 rounded-lg p-3 hover:border-red-200 hover:text-copikon-red">
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Cerrar Sesión</span>
        </button>
      </nav>
    </div>
  );
}
