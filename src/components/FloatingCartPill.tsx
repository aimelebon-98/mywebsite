"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

const BRAND_RED = "#CA3F2E";

export default function FloatingCartPill() {
  const pathname = usePathname();
  const [activeCount, setActiveCount] = useState(0);

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

  const openFilters = () => {
    // Dispatch a custom event the ShopTopBar listens for
    window.dispatchEvent(new CustomEvent("open-shop-filters"));
    // Also scroll the topbar into view so the drawer appears in viewport
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
      className="lg:hidden fixed top-1/2 -translate-y-1/2 z-40 group"
      style={{ right: "1rem" }}
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
          <span
            className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 bg-white rounded-full text-[11px] font-black flex items-center justify-center shadow-md border-2 border-white"
            style={{ color: BRAND_RED }}
          >
            {activeCount}
          </span>
        )}
      </div>

      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none">
        Filters
      </span>
    </button>
  );
}
