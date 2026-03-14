import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Product } from "@shared/schema";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotalUsd: number;
  totalWeight: number;
  shippingUsd: number;
  totalUsd: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product, qty: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + qty, 5) }
            : i
        );
      }
      return [...prev, { product, quantity: Math.min(qty, 5) }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.product.id === productId ? { ...i, quantity: Math.min(quantity, 5) } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalUsd = items.reduce((sum, i) => sum + i.product.totalPriceUsd * i.quantity, 0);
  const totalWeight = items.reduce((sum, i) => sum + i.product.weight * i.quantity, 0);
  const shippingUsd = 0; // Shipping is already included in totalPriceUsd
  const totalUsd = subtotalUsd;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotalUsd,
        totalWeight,
        shippingUsd,
        totalUsd,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
