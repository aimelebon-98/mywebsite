"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VISITOR_KEY = "solevault_visitor_id";
const INTERNAL_KEY = "solevault_internal_user";
const LAST_TRACK_KEY = "solevault_last_track";

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

function isInternalUser(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(INTERNAL_KEY) === "1";
  } catch {
    return false;
  }
}

// Helper to prevent duplicate rapid tracking (within 3 seconds of same event)
function shouldTrack(eventKey: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = window.localStorage.getItem(LAST_TRACK_KEY);
    const now = Date.now();
    if (stored) {
      const map: Record<string, number> = JSON.parse(stored);
      if (map[eventKey] && now - map[eventKey] < 3000) return false;
      map[eventKey] = now;
      // Prune old entries (>10 min)
      Object.keys(map).forEach(k => { if (now - map[k] > 600000) delete map[k]; });
      window.localStorage.setItem(LAST_TRACK_KEY, JSON.stringify(map));
    } else {
      window.localStorage.setItem(LAST_TRACK_KEY, JSON.stringify({ [eventKey]: now }));
    }
    return true;
  } catch {
    return true;
  }
}

export function trackEvent(payload: {
  eventType: string;
  path?: string;
  productId?: string;
  productName?: string;
  postId?: string;
  searchQuery?: string;
  metadata?: Record<string, unknown>;
}) {
  if (typeof window === "undefined") return;

  // Skip internal users (admin)
  if (isInternalUser()) return;

  const path = payload.path || window.location.pathname;

  // Skip admin/api paths
  if (path.startsWith("/admin") || path.startsWith("/api")) return;

  // Dedup: same event+path shouldn't fire twice in 3 seconds
  const dedupKey = `${payload.eventType}:${payload.productId || payload.postId || path}`;
  if (!shouldTrack(dedupKey)) return;

  const body = {
    ...payload,
    visitorId: getVisitorId(),
    referrer: document.referrer || "",
    path,
  };

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => {});
    }
  } catch { /* ignore */ }
}

// Helper functions for admin usage
export function markAsInternalUser() {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(INTERNAL_KEY, "1"); } catch {}
}

export function unmarkInternalUser() {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(INTERNAL_KEY); } catch {}
}

export function resetVisitorId() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(VISITOR_KEY);
    window.localStorage.removeItem(LAST_TRACK_KEY);
  } catch {}
}

export function checkInternalStatus(): boolean {
  return isInternalUser();
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string>("");

  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return;
    // Skip admin/api paths (also handled in trackEvent but early exit here)
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    lastPath.current = pathname;
    trackEvent({ eventType: "page_view", path: pathname });
  }, [pathname]);

  return null;
}
