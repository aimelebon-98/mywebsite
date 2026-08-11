"use client";

import { useEffect, useRef, useState } from "react";
import { trackCustom as fbTrackCustom } from "@/lib/fbpixel";

// Fires LanguageChange event when user switches locale (EN <-> FR)
// Reads locale from URL pathname (not useLocale hook) to avoid SSR prerender crash
export default function LanguageChangeTracker() {
  const [mounted, setMounted] = useState(false);
  const prevLocale = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const detectLocale = (): string => {
      const path = window.location.pathname;
      const match = path.match(/^\/(en|fr)(\/|$)/);
      return match ? match[1] : "en";
    };

    const currentLocale = detectLocale();

    if (prevLocale.current !== null && prevLocale.current !== currentLocale) {
      try {
        fbTrackCustom("LanguageChange", {
          from_locale: prevLocale.current,
          to_locale: currentLocale,
        });
      } catch { /* ignore */ }
    }
    prevLocale.current = currentLocale;

    // Also listen for URL changes (SPA navigation)
    const observer = () => {
      const newLocale = detectLocale();
      if (prevLocale.current !== null && prevLocale.current !== newLocale) {
        try {
          fbTrackCustom("LanguageChange", {
            from_locale: prevLocale.current,
            to_locale: newLocale,
          });
        } catch { /* ignore */ }
      }
      prevLocale.current = newLocale;
    };

    window.addEventListener("popstate", observer);
    return () => window.removeEventListener("popstate", observer);
  }, [mounted]);

  return null;
}