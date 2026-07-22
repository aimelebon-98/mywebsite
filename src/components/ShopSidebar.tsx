"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Star, Tag, X, ChevronDown, ChevronUp } from "lucide-react";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface ShopSidebarProps {
  category: string;
  search: string;
  sort: string;
  minPrice: string;
  maxPrice: string;
  brand: string;
  rating: string;
  onSale: string;
  brands: string[];
}

export default function ShopSidebar(props: ShopSidebarProps) {
  const { category, search, sort, minPrice, maxPrice, brand, rating, onSale, brands } = props;
  const t = useTranslations("shop");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState(search);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [openSection, setOpenSection] = useState<Record<string, boolean>>({
    search: true,
    price: true,
    brand: true,
    rating: true,
    special: true,
  });

  const toggleSection = (key: string) =>
    setOpenSection(prev => ({ ...prev, [key]: !prev[key] }));

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
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-36 space-y-1">
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 w-full px-4 py-2.5 mb-3 text-sm font-medium text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition"
          >
            <X className="w-4 h-4" /> {t("clearAll")}
          </button>
        )}

        <FilterGroup title={t("filterSearch")} icon={<Search className="w-4 h-4" />} open={openSection.search} onToggle={() => toggleSection("search")}>
          <div className="space-y-2">
            <SearchAutocomplete
              placeholder={tc("search")}
              initialValue={localSearch}
              inputClassName="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              iconClassName="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              showClearButton
              onSubmit={(val) => router.push(buildUrl({ search: val }))}
            />
            {search && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{t("searchingFor")} &ldquo;{search}&rdquo;</span>
                <button onClick={() => { setLocalSearch(""); router.push(buildUrl({ search: "" })); }} className="text-red-500 hover:text-red-700">
                  {t("clear")}
                </button>
              </div>
            )}
          </div>
        </FilterGroup>

        <FilterGroup title={t("filterPriceRange")} icon={<span className="text-sm">$</span>} open={openSection.price} onToggle={() => toggleSection("price")}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                placeholder={t("priceMin")}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              />
              <span className="text-gray-300">-</span>
              <input
                type="number"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                placeholder={t("priceMax")}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              />
            </div>
            <button
              onClick={handleApplyPrice}
              className="w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition"
            >
              {t("apply")}
            </button>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { label: t("under100"), min: "", max: "100" },
                { label: t("100to200"), min: "100", max: "200" },
                { label: t("200to300"), min: "200", max: "300" },
                { label: t("over300"),  min: "300", max: "" },
              ].map((r) => (
                <button
                  key={r.label}
                  onClick={() => router.push(buildUrl({ minPrice: r.min, maxPrice: r.max }))}
                  className={`px-3 py-2 text-xs rounded-lg border transition text-left ${
                    minPrice === r.min && maxPrice === r.max
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </FilterGroup>

        <FilterGroup title={t("filterBrand")} icon={<Tag className="w-4 h-4" />} open={openSection.brand} onToggle={() => toggleSection("brand")}>
          <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-hide">
            <button
              onClick={() => router.push(buildUrl({ brand: "" }))}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${
                !brand ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t("allBrands")}
            </button>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => router.push(buildUrl({ brand: b }))}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition truncate ${
                  brand === b ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title={t("filterRating")} icon={<Star className="w-4 h-4 text-amber-400 fill-amber-400" />} open={openSection.rating} onToggle={() => toggleSection("rating")}>
          <div className="space-y-1.5">
            {[
              { label: "4.5 & up", value: "4.4", stars: 5 },
              { label: "4.0 & up", value: "3.9", stars: 4 },
              { label: "3.5 & up", value: "3.4", stars: 4 },
              { label: t("anyRating"), value: "", stars: 0 },
            ].map((r) => (
              <button
                key={r.label}
                onClick={() => router.push(buildUrl({ rating: r.value }))}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition ${
                  rating === r.value
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {r.stars > 0 && (
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-3 h-3 ${i <= r.stars ? (rating === r.value ? "text-amber-300 fill-amber-300" : "text-amber-400 fill-amber-400") : "text-gray-300"}`} />
                    ))}
                  </div>
                )}
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title={t("filterSpecial")} icon={<Tag className="w-4 h-4" />} open={openSection.special} onToggle={() => toggleSection("special")}>
          <button
            onClick={() => router.push(buildUrl({ onSale: onSale === "true" ? "" : "true" }))}
            className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              onSale === "true"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-orange-50"
            }`}
          >
            {t("onSaleOnly")}
          </button>
        </FilterGroup>
      </div>
    </aside>
  );
}

function FilterGroup({
  title,
  icon,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition"
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
