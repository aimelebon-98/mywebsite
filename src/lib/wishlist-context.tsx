"use client";
import { trackEvent } from "@/components/AnalyticsTracker";
import { trackAddToWishlist as fbTrackAddToWishlist, trackCustom as fbTrackCustom } from "@/lib/fbpixel";
import { useCustomer } from "@/lib/customer-context";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

// Optional product meta passed from cards/buttons for richer Meta catalog events.
// content_ids MUST match catalog feed ids (product.id UUID).
export interface WishlistProductMeta {
  name?: string;
  priceUsd?: number;   // base USD (matches feed price)
  currency?: string;   // defaults to USD (feed currency)
  category?: string;
  brand?: string;
}

interface WishlistContextType {
  ids: string[];
  toggle: (productId: string, meta?: WishlistProductMeta) => Promise<void>;
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
  const { customer, loading: customerLoading } = useCustomer();
  const [ids, setIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [prevCustomerId, setPrevCustomerId] = useState<string | null>(null);

  const loadWishlist = useCallback(async () => {
    const vid = getVisitorId();
    if (!vid) return;
    try {
      const res = await fetch(`/api/wishlist?visitorId=${vid}`, { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data.ids)) setIds(data.ids);
    } catch { /* ignore */ }
    finally { setLoaded(true); }
  }, []);

  const mergeGuestToCustomer = useCallback(async () => {
    const vid = getVisitorId();
    if (!vid) return;
    try {
      await fetch("/api/wishlist/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ visitorId: vid }),
      });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (customerLoading) return;

    const currentCustomerId = customer?.id || null;

    if (currentCustomerId && !prevCustomerId) {
      mergeGuestToCustomer().then(() => loadWishlist());
    } else if (!currentCustomerId && prevCustomerId) {
      setIds([]);
      loadWishlist();
    } else {
      loadWishlist();
    }

    setPrevCustomerId(currentCustomerId);
  }, [customer, customerLoading, prevCustomerId, loadWishlist, mergeGuestToCustomer]);

  const toggle = useCallback(async (productId: string, meta?: WishlistProductMeta) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(10); } catch {}
    }

    const vid = getVisitorId();
    const wished = ids.includes(productId);
    if (!wished) {
      try { trackEvent({ eventType: "wishlist_add", productId }); } catch { /* ignore */ }
      try {
        // Meta AddToWishlist with catalog-matching payload (id, name, value, currency)
        // Meta uses these to render dynamic ads showing the wished product.
        fbTrackAddToWishlist({
          content_ids: [productId],
          content_type: "product",
          content_name: meta?.name,
          value: meta?.priceUsd,
          currency: meta?.currency || "USD",
        });
      } catch { /* ignore */ }
    } else {
      try {
        fbTrackCustom("WishlistRemove", {
          content_ids: [productId],
          content_type: "product",
          content_name: meta?.name,
          value: meta?.priceUsd,
          currency: meta?.currency || "USD",
        });
      } catch { /* ignore */ }
    }
    setIds(prev => wished ? prev.filter(x => x !== productId) : [...prev, productId]);
    try {
      await fetch("/api/wishlist", {
        method: wished ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ visitorId: vid, productId }),
      });
    } catch {
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