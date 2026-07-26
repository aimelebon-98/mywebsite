"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

const INACTIVITY_MS = 60_000;        // 1 minute idle
const REOPEN_COOLDOWN_MS = 5 * 60_000; // 5 min cooldown after manual close
const MANUAL_CLOSE_KEY = "sv_cart_last_manual_close";

export default function InactivityCartReminder() {
  const pathname = usePathname();
  const { items, drawerOpen, openDrawer } = useCart();
  const timerRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Skip on cart, checkout, product detail pages, and admin
  const shouldSkip =
    pathname === null ||
    pathname.includes("/cart") ||
    pathname.includes("/checkout") ||
    pathname.includes("/product/") ||
    pathname.includes("/admin");

  useEffect(() => {
    if (shouldSkip) return;

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      if (timerRef.current) window.clearTimeout(timerRef.current);

      timerRef.current = window.setTimeout(() => {
        // Skip if drawer already open
        if (drawerOpen) return;

        // Skip if cart empty
        if (items.length === 0) return;

        // Skip if user manually closed drawer recently
        try {
          const lastManualClose = parseInt(localStorage.getItem(MANUAL_CLOSE_KEY) || "0");
          if (Date.now() - lastManualClose < REOPEN_COOLDOWN_MS) return;
        } catch { /* ignore */ }

        openDrawer();
      }, INACTIVITY_MS);
    };

    // Track activity: clicks, scrolls, keys, mouse movement
    const events = ["click", "keydown", "scroll", "mousemove", "touchstart"];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));

    resetTimer(); // start the initial timer

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [items.length, drawerOpen, openDrawer, shouldSkip]);

  return null;
}
