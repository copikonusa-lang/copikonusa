import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MyOrders from "@/pages/MyOrders";
import OrderDetail from "@/pages/OrderDetail";
import Wishlist from "@/pages/Wishlist";
import Profile from "@/pages/Profile";
import FAQ from "@/pages/FAQ";
import PaymentMethods from "@/pages/PaymentMethods";
import About from "@/pages/About";
import Terms from "@/pages/Terms";
import Returns from "@/pages/Returns";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/catalogo" component={Catalog} />
      <Route path="/producto/:slug" component={ProductDetail} />
      <Route path="/carrito" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/login" component={Login} />
      <Route path="/registro" component={Register} />
      <Route path="/mis-pedidos" component={MyOrders} />
      <Route path="/pedido/:id" component={OrderDetail} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/perfil" component={Profile} />
      <Route path="/faq" component={FAQ} />
      <Route path="/metodos-de-pago" component={PaymentMethods} />
      <Route path="/sobre-nosotros" component={About} />
      <Route path="/terminos" component={Terms} />
      <Route path="/devoluciones" component={Returns} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Router hook={useHashLocation}>
              <Layout>
                <AppRouter />
              </Layout>
            </Router>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
