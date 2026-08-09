"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

const BRAND_RED = "#CA3F2E";

export default function FloatingCartPill() {
  const pathname = usePathname();
  const [activeCount, setActiveCount] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Only show on shop pages (not on individual product pages)
  const isShopPage =
    pathname !== null &&
    pathname.includes("/shop") &&
    !pathname.includes("/product/");

  // Count active filters from URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    let count = 0;
    if (params.get("minPrice")) count++;
    if (params.get("maxPrice")) count++;
    if (params.get("brand")) count++;
    if (params.get("rating")) count++;
    if (params.get("onSale") === "true") count++;
    if (params.get("search")) count++;
    setActiveCount(count);
  }, [pathname]);

  // Fade out slightly while scrolling for better content visibility
  useEffect(() => {
    if (typeof window === "undefined") return;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      setIsScrolling(true);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setIsScrolling(false), 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  const openFilters = () => {
    window.dispatchEvent(new CustomEvent("open-shop-filters"));
    const topbar = document.querySelector("[data-shop-topbar]");
    if (topbar) {
      topbar.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!isShopPage) return null;

  return (
    <button
      onClick={openFilters}
      aria-label="Open filters"
      className={`lg:hidden fixed bottom-24 right-4 z-40 group transition-all duration-300 ${
        isScrolling ? "opacity-60 scale-90" : "opacity-100 scale-100"
      }`}
    >
      <div
        className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          backgroundColor: BRAND_RED,
          boxShadow: "0 10px 30px rgba(202, 63, 46, 0.45)",
        }}
      >
        <SlidersHorizontal className="w-6 h-6" />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-[#CA3F2E] text-xs font-black rounded-full flex items-center justify-center shadow-md border-2 border-white">
            {activeCount}
          </span>
        )}
      </div>
    </button>
  );
}