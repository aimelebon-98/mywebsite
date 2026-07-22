"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown, Star, Tag } from "lucide-react";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface ShopFiltersProps {
  category: string;
  search: string;
  sort: string;
  minPrice: string;
  maxPrice: string;
  brand: string;
  rating: string;
  onSale: string;
  brands: string[];
  totalResults: number;
}

export default function ShopFilters({
  category,
  search,
  sort,
  minPrice,
  maxPrice,
  brand,
  rating,
  onSale,
  brands,
}: ShopFiltersProps) {
  const t = useTranslations("shop");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = { category, search, sort, minPrice, maxPrice, brand, rating, onSale, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== "all" && v !== "") params.set(k, v);
    });
    return `/${locale}/shop?${params.toString()}`;
  };

  const hasActiveFilters = minPrice || maxPrice || brand || rating || onSale === "true" || search;

  const handleApplyPrice = () => {
    router.push(buildUrl({ minPrice: localMinPrice, maxPrice: localMaxPrice }));
  };

  const clearAll = () => {
    router.push(`/${locale}/shop${category !== "all" ? `?category=${category}` : ""}`);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <SearchAutocomplete
            placeholder={tc("search")}
            initialValue={localSearch}
            inputClassName="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            iconClassName="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            showClearButton
            onSubmit={(val) => { setLocalSearch(val); router.push(buildUrl({ search: val })); }}
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => router.push(buildUrl({ sort: e.target.value }))}
              className="appearance-none pl-4 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition cursor-pointer"
            >
              <option value="newest">{t("newestFirst")}</option>
              <option value="price-low">{t("sortPriceLow")}</option>
              <option value="price-high">{t("sortPriceHigh")}</option>
              <option value="rating">{t("sortRating")}</option>
              <option value="name-az">{t("sortNameAZ")}</option>
              <option value="name-za">{t("sortNameZA")}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition border ${
              filtersOpen || hasActiveFilters
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">{t("filters")}</span>
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {[minPrice, maxPrice, brand, rating, onSale === "true" ? "1" : "", search].filter(Boolean).length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition"
            >
              <X className="w-3.5 h-3.5" /> {t("clear")}
            </button>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 animate-fade-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">{t("filterPriceRange")}</h4>
              <div className="flex items-center gap-2">
                <input type="number" value={localMinPrice} onChange={(e) => setLocalMinPrice(e.target.value)} placeholder={t("priceMin")} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
                <span className="text-gray-400 text-sm">-</span>
                <input type="number" value={localMaxPrice} onChange={(e) => setLocalMaxPrice(e.target.value)} placeholder={t("priceMax")} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
                <button onClick={handleApplyPrice} className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition flex-shrink-0">
                  {t("go")}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { label: t("under100"), min: "", max: "100" },
                  { label: t("100to200"), min: "100", max: "200" },
                  { label: t("over200"),  min: "200", max: "" },
                ].map((range) => (
                  <button
                    key={range.label}
                    onClick={() => router.push(buildUrl({ minPrice: range.min, maxPrice: range.max }))}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition ${
                      minPrice === range.min && maxPrice === range.max
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">{t("filterBrand")}</h4>
              <div className="relative">
                <select value={brand} onChange={(e) => router.push(buildUrl({ brand: e.target.value }))} className="w-full appearance-none px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition cursor-pointer">
                  <option value="">{t("allBrands")}</option>
                  {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">{t("minRating")}</h4>
              <div className="space-y-1.5">
                {[
                  { label: "4.5+", value: "4.4" },
                  { label: "4.0+", value: "3.9" },
                  { label: "3.5+", value: "3.4" },
                  { label: t("anyRating"), value: "" },
                ].map((r) => (
                  <button
                    key={r.label}
                    onClick={() => router.push(buildUrl({ rating: r.value }))}
                    className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm transition ${
                      rating === r.value
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {r.value ? (
                      <>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {r.label}
                      </>
                    ) : r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">{t("filterSpecial")}</h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => router.push(buildUrl({ onSale: onSale === "true" ? "" : "true" }))}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition ${
                    onSale === "true"
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  {t("onSaleOnly")}
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 bg-white border border-gray-200 hover:bg-red-50 transition"
                >
                  <X className="w-4 h-4" />
                  {t("resetAllFilters")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
