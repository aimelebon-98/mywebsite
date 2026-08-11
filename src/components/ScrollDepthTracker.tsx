"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { trackCustom as fbTrackCustom } from "@/lib/fbpixel";

// Fires ScrollDepth25/50/75/100 events based on user scroll on each page
// Wrapped in mounted guard to avoid SSR prerender issues
export default function ScrollDepthTracker() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    firedRef.current = new Set();
  }, [mounted, pathname]);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    let ticking = false;
    const thresholds = [25, 50, 75, 100];

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) { ticking = false; return; }
        const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

        for (const t of thresholds) {
          if (scrollPercent >= t && !firedRef.current.has(t)) {
            firedRef.current.add(t);
            try {
              fbTrackCustom(`ScrollDepth${t}`, {
                page_path: pathname || "/",
                percent: t,
              });
            } catch { /* ignore */ }
          }
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted, pathname]);

  return null;
}