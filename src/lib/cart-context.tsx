"use client";
import { trackEvent } from "@/components/AnalyticsTracker";
import { trackAddToCart as fbTrackAddToCart } from "@/lib/fbpixel";

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

type DrawerMode = "closed" | "zoom" | "normal";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalQuantity: number;
  totalPrice: number;
  drawerOpen: boolean;
  drawerMode: DrawerMode;
  openDrawer: () => void;   // manual open (normal slide-in)
  closeDrawer: () => void;
  lastAddedAt: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("closed");
  const [lastAddedAt, setLastAddedAt] = useState(0);

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
    // Haptic feedback on mobile devices
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(15); } catch { /* ignore */ }
    }

    try {
      trackEvent({
        eventType: "add_to_cart",
        productId: (newItem as unknown as { productId?: string; id?: string }).productId || (newItem as unknown as { id?: string }).id,
        productName: (newItem as unknown as { name?: string }).name,
        metadata: { quantity: (newItem as unknown as { quantity?: number }).quantity || 1 },
      });
    } catch { /* ignore */ }

    try {
      fbTrackAddToCart({
        content_ids: [newItem.id],
        content_name: newItem.name,
        value: newItem.price * newItem.quantity,
        currency: "USD",
        contents: [{ id: newItem.id, quantity: newItem.quantity, item_price: newItem.price }],
      });
    } catch { /* ignore fb */ }

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
    setLastAddedAt(Date.now());
    // Do NOT auto-open the drawer - just let the badge/pill pulse to acknowledge
  }, []);

  const removeItem = useCallback((id: string, size: string, color: string) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size && i.color === color)));
  }, []);

  const updateQuantity = useCallback((id: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => !(i.id === id && i.size === size && i.color === color)));
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.id === id && i.size === size && i.color === color
          ? { ...i, quantity }
          : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openDrawer = useCallback(() => setDrawerMode("normal"), []);
  const closeDrawer = useCallback(() => setDrawerMode("closed"), []);

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const drawerOpen = drawerMode !== "closed";

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      totalItems, totalQuantity, totalPrice,
      drawerOpen, drawerMode, openDrawer, closeDrawer, lastAddedAt
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
