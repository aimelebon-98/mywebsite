"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VISITOR_KEY = "solevault_visitor_id";

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
  const body = {
    ...payload,
    visitorId: getVisitorId(),
    referrer: document.referrer || "",
    path: payload.path || window.location.pathname,
  };
  // Fire and forget - use sendBeacon if available for reliability
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

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string>("");

  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return;
    // Ignore admin/api paths
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    lastPath.current = pathname;
    trackEvent({ eventType: "page_view", path: pathname });
  }, [pathname]);

  return null;
}
