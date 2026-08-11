"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { trackCustom as fbTrackCustom } from "@/lib/fbpixel";

// Fires LanguageChange event when user switches locale (EN <-> FR)
export default function LanguageChangeTracker() {
  const locale = useLocale();
  const prevLocale = useRef<string | null>(null);

  useEffect(() => {
    if (prevLocale.current !== null && prevLocale.current !== locale) {
      try {
        fbTrackCustom("LanguageChange", {
          from_locale: prevLocale.current,
          to_locale: locale,
        });
      } catch { /* ignore */ }
    }
    prevLocale.current = locale;
  }, [locale]);

  return null;
}