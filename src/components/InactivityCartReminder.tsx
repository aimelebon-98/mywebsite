"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

// Best-practice cart abandonment recovery:
// - Exit intent (desktop) = primary trigger
// - Tab visibility change (mobile) = fallback
// - 3 min idle = last-resort fallback
// - Once per session
// - 24h cooldown after manual close
// - Skip product pages (don't interrupt purchase decision)

const IDLE_FALLBACK_MS = 3 * 60_000;              // 3 minutes idle
const REOPEN_COOLDOWN_MS = 24 * 60 * 60_000;      // 24 hours after manual close
const MANUAL_CLOSE_KEY = "sv_cart_last_manual_close";
const SESSION_SHOWN_KEY = "sv_cart_reminder_shown";

export default function InactivityCartReminder() {
  const pathname = usePathname();
  const { items, drawerOpen, openDrawer } = useCart();
  const idleTimerRef = useRef<number | null>(null);
  const firedRef = useRef<boolean>(false);

  // Strip locale prefix (/en, /fr) for matching
  const normalizedPath = (pathname || "").replace(/^\/(en|fr)/, "") || "/";

  // Only trigger on browse/discovery pages - NEVER on product pages
  // (don't interrupt users making a purchase decision)
  const canReopen =
    normalizedPath === "/" ||
    normalizedPath === "/shop" ||
    normalizedPath.startsWith("/shop/") ||
    normalizedPath === "/wishlist";

  useEffect(() => {
    if (!canReopen) return;
    if (items.length === 0) return;
    if (drawerOpen) return;

    // Check "once per session" gate
    try {
      if (sessionStorage.getItem(SESSION_SHOWN_KEY) === "1") {
        firedRef.current = true;
        return;
      }
    } catch { /* ignore */ }

    // Check 24h cooldown after manual close
    const isBlockedByCooldown = (): boolean => {
      try {
        const lastManualClose = parseInt(localStorage.getItem(MANUAL_CLOSE_KEY) || "0");
        return Date.now() - lastManualClose < REOPEN_COOLDOWN_MS;
      } catch {
        return false;
      }
    };

    const triggerReminder = () => {
      if (firedRef.current) return;
      if (drawerOpen) return;
      if (items.length === 0) return;
      if (isBlockedByCooldown()) return;

      firedRef.current = true;
      try { sessionStorage.setItem(SESSION_SHOWN_KEY, "1"); } catch { /* ignore */ }
      openDrawer();
    };

    // --- 1. EXIT INTENT (desktop) ---
    // Fires when the mouse moves toward the top of the viewport (tab bar / close button)
    const handleMouseLeave = (e: MouseEvent) => {
      // Only fire when cursor exits through the TOP edge
      if (e.clientY <= 0 && e.relatedTarget === null) {
        triggerReminder();
      }
    };

    // --- 2. TAB VISIBILITY (mobile + desktop) ---
    // Fires when user switches tabs / minimizes / locks phone and comes back
    let hiddenAt = 0;
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
      } else if (document.visibilityState === "visible" && hiddenAt > 0) {
        // Only fire if they were away for at least 20 seconds (real tab switch, not accidental)
        if (Date.now() - hiddenAt > 20_000) {
          triggerReminder();
        }
        hiddenAt = 0;
      }
    };

    // --- 3. IDLE FALLBACK (3 minutes of no activity) ---
    const resetIdleTimer = () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(triggerReminder, IDLE_FALLBACK_MS);
    };

    const activityEvents = ["click", "keydown", "scroll", "mousemove", "touchstart"];
    activityEvents.forEach(evt =>
      window.addEventListener(evt, resetIdleTimer, { passive: true })
    );

    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    resetIdleTimer();

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, resetIdleTimer));
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, [items.length, drawerOpen, openDrawer, canReopen]);

  return null;
}
