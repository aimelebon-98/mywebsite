"use client";

import { SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

export default function MobileShopFilterButton() {
  const t = useTranslations("shop");

  const handleClick = () => {
    window.dispatchEvent(new Event("open-shop-filters"));
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(10); } catch { /* ignore */ }
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 active:scale-95 transition-all shadow-sm"
      aria-label={t("filters")}
    >
      <SlidersHorizontal className="w-4 h-4" strokeWidth={2.5} />
      <span>{t("filters")}</span>
    </button>
  );
}