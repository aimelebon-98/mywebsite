"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface WishlistContextType {
  ids: string[];
  toggle: (productId: string) => Promise<void>;
  isWished: (productId: string) => boolean;
  count: number;
  loaded: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let vid = localStorage.getItem("solevault-visitor-id");
  if (!vid) {
    vid = crypto.randomUUID();
    localStorage.setItem("solevault-visitor-id", vid);
  }
  return vid;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const vid = getVisitorId();
    if (!vid) return;
    fetch(`/api/wishlist?visitorId=${vid}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.ids)) setIds(data.ids);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const toggle = useCallback(async (productId: string) => {
    const vid = getVisitorId();
    const wished = ids.includes(productId);
    // optimistic update
    setIds(prev => wished ? prev.filter(x => x !== productId) : [...prev, productId]);
    try {
      await fetch("/api/wishlist", {
        method: wished ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: vid, productId }),
      });
    } catch {
      // revert on failure
      setIds(prev => wished ? [...prev, productId] : prev.filter(x => x !== productId));
    }
  }, [ids]);

  const isWished = useCallback((productId: string) => ids.includes(productId), [ids]);

  return (
    <WishlistContext.Provider value={{ ids, toggle, isWished, count: ids.length, loaded }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
