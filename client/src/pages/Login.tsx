import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@assets/logo-copikonusa.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast({ title: "¡Bienvenido de vuelta!" });
      setLocation("/");
    } catch (err: any) {
      toast({ title: "Credenciales inválidas", description: "Verifica tu email y contraseña", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logoImg} alt="CopikonUSA" className="h-12 mx-auto mb-4" />
          <h1 className="font-display font-bold text-xl">Iniciar Sesión</h1>
          <p className="text-sm text-gray-500 mt-1">Accede a tu cuenta CopikonUSA</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border border-gray-200 p-6">
          <div>
            <Label className="text-sm">Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required data-testid="input-login-email" />
          </div>
          <div>
            <Label className="text-sm">Contraseña</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required data-testid="input-login-password" />
          </div>
          <Button type="submit" className="w-full bg-copikon-red hover:bg-red-800" disabled={isLoading} data-testid="button-login-submit">
            {isLoading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-copikon-red hover:underline font-medium">Regístrate gratis</Link>
        </p>

        <div className="text-center text-xs text-gray-400 mt-4 bg-gray-50 rounded p-3">
          <p className="font-medium mb-1">Demo Admin:</p>
          <p>admin@copikonusa.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
