"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalQuantity: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("solevault-cart");
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch { /* ignore */ }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("solevault-cart", JSON.stringify(items));
    }
  }, [items, loaded]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(
        i => i.id === newItem.id && i.size === newItem.size && i.color === newItem.color
      );
      if (existing) {
        return prev.map(i =>
          i.id === newItem.id && i.size === newItem.size && i.color === newItem.color
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((id: string, size: string, color: string) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size && i.color === color)));
  }, []);

  const updateQuantity = useCallback((id: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, size, color);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.id === id && i.size === size && i.color === color
          ? { ...i, quantity }
          : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  // ✅ Unique products (for cart icon badge)
  const totalItems = items.length;
  // ✅ Total units (useful for cart page summary)
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalQuantity, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
