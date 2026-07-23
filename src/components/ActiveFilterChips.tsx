"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface ActiveFilterChipsProps {
  category: string;
  search: string;
  sort: string;
  minPrice: string;
  maxPrice: string;
  brand: string;
  rating: string;
  onSale: string;
}

export default function ActiveFilterChips(props: ActiveFilterChipsProps) {
  const { category, search, sort, minPrice, maxPrice, brand, rating, onSale } = props;
  const t = useTranslations("shop");
  const locale = useLocale();
  const router = useRouter();

  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = { category, search, sort, minPrice, maxPrice, brand, rating, onSale, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== "all" && v !== "") params.set(k, v);
    });
    return `/${locale}/shop?${params.toString()}`;
  };

  const chips: { label: string; onRemove: () => void }[] = [];

  if (search) {
    chips.push({
      label: `"${search}"`,
      onRemove: () => router.push(buildUrl({ search: "" })),
    });
  }
  if (brand) {
    chips.push({
      label: brand,
      onRemove: () => router.push(buildUrl({ brand: "" })),
    });
  }
  if (minPrice || maxPrice) {
    const label = minPrice && maxPrice
      ? `$${minPrice} - $${maxPrice}`
      : minPrice
        ? `${t("priceMin")}: $${minPrice}`
        : `${t("priceMax")}: $${maxPrice}`;
    chips.push({
      label,
      onRemove: () => router.push(buildUrl({ minPrice: "", maxPrice: "" })),
    });
  }
  if (rating) {
    chips.push({
      label: `${rating}+ ${t("filterRating")}`,
      onRemove: () => router.push(buildUrl({ rating: "" })),
    });
  }
  if (onSale === "true") {
    chips.push({
      label: t("onSaleOnly"),
      onRemove: () => router.push(buildUrl({ onSale: "" })),
    });
  }

  if (chips.length === 0) return null;

  const clearAll = () => {
    router.push(`/${locale}/shop${category !== "all" ? `?category=${category}` : ""}`);
  };

  return (
    <div className="flex items-center flex-wrap gap-2 mb-5 pb-4 border-b border-gray-100">
      <span className="text-xs font-medium text-gray-500 mr-1">{t("activeFilters")}:</span>
      {chips.map((chip, idx) => (
        <button
          key={idx}
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-full hover:bg-gray-800 transition group"
        >
          <span>{chip.label}</span>
          <X className="w-3 h-3 opacity-70 group-hover:opacity-100" />
        </button>
      ))}
      <button
        onClick={clearAll}
        className="text-xs font-semibold text-red-500 hover:text-red-700 transition ml-1 underline underline-offset-2"
      >
        {t("clearAll")}
      </button>
    </div>
  );
}
