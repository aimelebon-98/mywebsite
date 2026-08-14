"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// All pages use black to match unified mobile navbar
const HOME_COLOR = "#000000";
const OTHER_COLOR = "#000000";

function applyThemeColor(color: string) {
  if (typeof document === "undefined") return;

  // 1. Find ALL existing theme-color meta tags (Next.js injects multiple with media queries)
  const existing = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');

  if (existing.length === 0) {
    // No existing tag - create one
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = color;
    document.head.appendChild(meta);
    return;
  }

  // 2. Update every existing one - remove media attr so it always applies
  existing.forEach((el) => {
    el.setAttribute("content", color);
    el.removeAttribute("media");
  });
}

export default function ThemeColorSwitcher() {
  const pathname = usePathname();

  useEffect(() => {
    const isHome = /^\/(en|fr)?\/?$/.test(pathname);
    const color = isHome ? HOME_COLOR : OTHER_COLOR;

    // Apply immediately
    applyThemeColor(color);

    // Re-apply after a tick in case Next.js overrides after our first attempt
    const t1 = setTimeout(() => applyThemeColor(color), 50);
    const t2 = setTimeout(() => applyThemeColor(color), 300);

    // Watch <head> for any new theme-color meta tags that Next injects and override them
    const observer = new MutationObserver(() => {
      const currentTag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      if (currentTag && currentTag.getAttribute("content") !== color) {
        applyThemeColor(color);
      }
    });
    observer.observe(document.head, { childList: true, subtree: true, attributes: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
