import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user || user.role !== "admin") {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold">Acceso Denegado</h1>
        <p className="text-muted-foreground mt-2">No tienes permisos para acceder a esta p\u00e1gina.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administraci\u00f3n</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardHeader><CardTitle>Productos</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">0</p><p className="text-muted-foreground">Total productos</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Pedidos</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">0</p><p className="text-muted-foreground">Pedidos activos</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Usuarios</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">0</p><p className="text-muted-foreground">Usuarios registrados</p></CardContent></Card>
      </div>
    </div>
  );
}
