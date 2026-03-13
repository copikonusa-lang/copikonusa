import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Truck, Shield, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div>
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Bienvenido a <span className="text-primary">CopikonUSA</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Tu tienda de confianza para productos de calidad. Env\u00edo r\u00e1pido y seguro a todo Estados Unidos.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/catalog">
              <Button size="lg" className="gap-2">Ver Cat\u00e1logo <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline">Sobre Nosotros</Button>
            </Link>
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card><CardContent className="pt-6 text-center"><Truck className="h-12 w-12 mx-auto mb-4 text-primary" /><h3 className="font-semibold text-lg mb-2">Env\u00edo R\u00e1pido</h3><p className="text-muted-foreground">Entrega en 2-5 d\u00edas h\u00e1biles</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><Shield className="h-12 w-12 mx-auto mb-4 text-primary" /><h3 className="font-semibold text-lg mb-2">Compra Segura</h3><p className="text-muted-foreground">Pago protegido y garant\u00eda</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><Star className="h-12 w-12 mx-auto mb-4 text-primary" /><h3 className="font-semibold text-lg mb-2">Calidad Premium</h3><p className="text-muted-foreground">Productos seleccionados</p></CardContent></Card>
          </div>
        </div>
      </section>
    </div>
  );
}
