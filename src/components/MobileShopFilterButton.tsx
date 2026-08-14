"use client";

import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

export default function MobileShopFilterButton() {
  const t = useTranslations("shop");
  const searchParams = useSearchParams();
  const [scrolling, setScrolling] = useState(false);

  const activeFilters = ["category", "brand", "minPrice", "maxPrice", "rating", "onSale"]
    .filter(k => {
      const v = searchParams.get(k);
      return v && v !== "" && v !== "all" && v !== "0";
    }).length;

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

  return (
    <button
      onClick={handleFilter}
      aria-label={t("filters")}
      className={`lg:hidden fixed right-4 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-2xl shadow-black/40 border border-white/10 active:scale-95 transition-opacity duration-300 ${scrolling ? "opacity-25" : "opacity-100"}`}
    >
      <SlidersHorizontal className="w-5 h-5" strokeWidth={2.5} />
      {activeFilters > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 flex items-center justify-center bg-[#CA3F2E] text-white text-[11px] font-black rounded-full border-2 border-gray-900">
          {activeFilters}
        </span>
      )}
    </button>
  );
}