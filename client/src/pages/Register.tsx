import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { BRANCHES } from "@shared/schema";
import logoImg from "@assets/logo-copikonusa.png";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register, isLoading } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", whatsapp: "", city: "", branch: "",
  });

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
      toast({ title: "¡Cuenta creada exitosamente!" });
      setLocation("/");
    } catch (err: any) {
      toast({ title: "Error en registro", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src={logoImg} alt="CopikonUSA" className="h-12 mx-auto mb-4" />
          <h1 className="font-display font-bold text-xl">Crear Cuenta</h1>
          <p className="text-sm text-gray-500 mt-1">Regístrate para empezar a comprar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-sm">Nombre completo</Label>
              <Input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Tu nombre" required data-testid="input-register-name" />
            </div>
            <div className="col-span-2">
              <Label className="text-sm">Email</Label>
              <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="tu@email.com" required data-testid="input-register-email" />
            </div>
            <div className="col-span-2">
              <Label className="text-sm">Contraseña</Label>
              <Input type="password" value={form.password} onChange={e => update("password", e.target.value)} placeholder="Mínimo 6 caracteres" required data-testid="input-register-password" />
            </div>
            <div>
              <Label className="text-sm">Teléfono</Label>
              <Input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+58 412..." required data-testid="input-register-phone" />
            </div>
            <div>
              <Label className="text-sm">WhatsApp</Label>
              <Input value={form.whatsapp} onChange={e => update("whatsapp", e.target.value)} placeholder="+58 412..." data-testid="input-register-whatsapp" />
            </div>
            <div>
              <Label className="text-sm">Ciudad</Label>
              <Input value={form.city} onChange={e => update("city", e.target.value)} placeholder="Tu ciudad" required data-testid="input-register-city" />
            </div>
            <div>
              <Label className="text-sm">Sucursal preferida</Label>
              <Select value={form.branch} onValueChange={v => update("branch", v)}>
                <SelectTrigger data-testid="select-register-branch"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full bg-copikon-red hover:bg-red-800" disabled={isLoading} data-testid="button-register-submit">
            {isLoading ? "Creando cuenta..." : "Crear Cuenta Gratis"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-copikon-red hover:underline font-medium">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
