"use client";

import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

export default function MobileShopFilterButton() {
  const t = useTranslations("shop");
  const locale = useLocale();
  const isFr = locale === "fr";
  const searchParams = useSearchParams();
  const [scrolling, setScrolling] = useState(false);

  // Count active filters (category, brand, price, sale, rating) - excludes search + sort
  const activeFilters = ["category", "brand", "minPrice", "maxPrice", "rating", "onSale"]
    .filter(k => {
      const v = searchParams.get(k);
      return v && v !== "" && v !== "all" && v !== "0";
    }).length;

  const sortActive = !!searchParams.get("sort") && searchParams.get("sort") !== "featured";

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      setScrolling(true);
      clearTimeout(timer);
      timer = setTimeout(() => setScrolling(false), 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  const handleFilter = () => {
    window.dispatchEvent(new Event("open-shop-filters"));
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(10); } catch { /* ignore */ }
    }
  };

  const handleSort = () => {
    window.dispatchEvent(new Event("open-shop-sort"));
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(10); } catch { /* ignore */ }
    }
  };

  return (
    <div
      className={`lg:hidden fixed left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 transition-opacity duration-300 ${scrolling ? "opacity-40" : "opacity-100"}`}
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)" }}
    >
      <button
        onClick={handleSort}
        aria-label={isFr ? "Trier" : "Sort"}
        className="relative flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-full text-sm font-bold shadow-2xl shadow-black/40 border border-white/10 active:scale-95 transition-transform"
      >
        <ArrowUpDown className="w-4 h-4" strokeWidth={2.5} />
        <span>{isFr ? "Trier" : "Sort"}</span>
        {sortActive && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#CA3F2E] rounded-full border-2 border-gray-900" />
        )}
      </button>
      <button
        onClick={handleFilter}
        aria-label={t("filters")}
        className="relative flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-full text-sm font-bold shadow-2xl shadow-black/40 border border-white/10 active:scale-95 transition-transform"
      >
        <SlidersHorizontal className="w-4 h-4" strokeWidth={2.5} />
        <span>{isFr ? "Filtrer" : "Filter"}</span>
        {activeFilters > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-[#CA3F2E] text-white text-[10px] font-black rounded-full border-2 border-gray-900">
            {activeFilters}
          </span>
        )}
      </button>
    </div>
  );
}