"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Colors match Navbar.tsx promo bar
const HOME_COLOR = "#111827";      // gray-900 (homepage promo bar)
const OTHER_COLOR = "#8B2A1E";     // BRAND_RED_DARK (all non-home pages promo bar)

function setThemeColor(color: string) {
  if (typeof document === "undefined") return;
  // Remove any dynamic meta first to avoid duplicates
  document.querySelectorAll('meta[name="theme-color"]').forEach((el) => {
    if (el.hasAttribute("data-dynamic")) el.remove();
  });
  const meta = document.createElement("meta");
  meta.name = "theme-color";
  meta.content = color;
  meta.setAttribute("data-dynamic", "true");
  document.head.appendChild(meta);
}

export default function ThemeColorSwitcher() {
  const pathname = usePathname();

  useEffect(() => {
    // Homepage = /, /en, /fr (with or without trailing slash)
    const isHome = /^\/(en|fr)?\/?$/.test(pathname);
    setThemeColor(isHome ? HOME_COLOR : OTHER_COLOR);
  }, [pathname]);

  return null;
}
