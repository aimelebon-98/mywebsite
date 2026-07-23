"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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

const PRICE_FLOOR = 0;
const PRICE_CEILING = 1000;
const PRICE_STEP = 10;

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

  // Slider values (numbers)
  const [sliderMin, setSliderMin] = useState<number>(
    minPrice ? Math.max(PRICE_FLOOR, Number(minPrice)) : PRICE_FLOOR
  );
  const [sliderMax, setSliderMax] = useState<number>(
    maxPrice ? Math.min(PRICE_CEILING, Number(maxPrice)) : PRICE_CEILING
  );

  // Keep slider in sync when URL params change
  useEffect(() => {
    setSliderMin(minPrice ? Math.max(PRICE_FLOOR, Number(minPrice)) : PRICE_FLOOR);
    setSliderMax(maxPrice ? Math.min(PRICE_CEILING, Number(maxPrice)) : PRICE_CEILING);
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

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
    const minVal = sliderMin > PRICE_FLOOR ? String(sliderMin) : "";
    const maxVal = sliderMax < PRICE_CEILING ? String(sliderMax) : "";
    router.push(buildUrl({ minPrice: minVal, maxPrice: maxVal }));
  };

  const clearAll = () => {
    router.push(`/${locale}/shop${category !== "all" ? `?category=${category}` : ""}`);
  };

  const handleSliderMinChange = (val: number) => {
    const clamped = Math.min(val, sliderMax - PRICE_STEP);
    const safe = Math.max(PRICE_FLOOR, clamped);
    setSliderMin(safe);
    setLocalMinPrice(safe > PRICE_FLOOR ? String(safe) : "");
  };

  const handleSliderMaxChange = (val: number) => {
    const clamped = Math.max(val, sliderMin + PRICE_STEP);
    const safe = Math.min(PRICE_CEILING, clamped);
    setSliderMax(safe);
    setLocalMaxPrice(safe < PRICE_CEILING ? String(safe) : "");
  };

  const handleInputMinChange = (v: string) => {
    setLocalMinPrice(v);
    const num = Number(v);
    if (!isNaN(num) && v !== "") {
      const safe = Math.max(PRICE_FLOOR, Math.min(num, sliderMax - PRICE_STEP));
      setSliderMin(safe);
    } else if (v === "") {
      setSliderMin(PRICE_FLOOR);
    }
  };

  const handleInputMaxChange = (v: string) => {
    setLocalMaxPrice(v);
    const num = Number(v);
    if (!isNaN(num) && v !== "") {
      const safe = Math.min(PRICE_CEILING, Math.max(num, sliderMin + PRICE_STEP));
      setSliderMax(safe);
    } else if (v === "") {
      setSliderMax(PRICE_CEILING);
    }
  };

  const minPct = ((sliderMin - PRICE_FLOOR) / (PRICE_CEILING - PRICE_FLOOR)) * 100;
  const maxPct = ((sliderMax - PRICE_FLOOR) / (PRICE_CEILING - PRICE_FLOOR)) * 100;

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
          <div className="space-y-4">
            {/* Current selected range display */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Range</span>
              <span className="font-semibold text-gray-900">
                ${sliderMin} - ${sliderMax}{sliderMax >= PRICE_CEILING ? "+" : ""}
              </span>
            </div>

            {/* Dual range slider */}
            <DualRangeSlider
              min={PRICE_FLOOR}
              max={PRICE_CEILING}
              step={PRICE_STEP}
              valueMin={sliderMin}
              valueMax={sliderMax}
              minPct={minPct}
              maxPct={maxPct}
              onMinChange={handleSliderMinChange}
              onMaxChange={handleSliderMaxChange}
            />

            {/* Min / Max inputs (still editable) */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={localMinPrice}
                onChange={(e) => handleInputMinChange(e.target.value)}
                placeholder={t("priceMin")}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              />
              <span className="text-gray-300">-</span>
              <input
                type="number"
                value={localMaxPrice}
                onChange={(e) => handleInputMaxChange(e.target.value)}
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

function DualRangeSlider({
  min, max, step, valueMin, valueMax, minPct, maxPct,
  onMinChange, onMaxChange,
}: {
  min: number; max: number; step: number;
  valueMin: number; valueMax: number;
  minPct: number; maxPct: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}) {
  return (
    <div className="relative h-6 flex items-center">
      {/* Track background */}
      <div className="absolute inset-x-0 h-1.5 bg-gray-200 rounded-full" />

      {/* Selected range fill */}
      <div
        className="absolute h-1.5 bg-gray-900 rounded-full"
        style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
      />

      {/* Min range input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={(e) => onMinChange(Number(e.target.value))}
        className="range-thumb absolute inset-0 w-full h-6 appearance-none bg-transparent pointer-events-none"
        aria-label="Minimum price"
      />

      {/* Max range input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={(e) => onMaxChange(Number(e.target.value))}
        className="range-thumb absolute inset-0 w-full h-6 appearance-none bg-transparent pointer-events-none"
        aria-label="Maximum price"
      />

      <style jsx>{`
        .range-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid #111827;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          cursor: pointer;
          margin-top: 0;
        }
        .range-thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid #111827;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          cursor: pointer;
        }
        .range-thumb::-webkit-slider-runnable-track {
          background: transparent;
          height: 6px;
        }
        .range-thumb::-moz-range-track {
          background: transparent;
          height: 6px;
        }
        .range-thumb:focus {
          outline: none;
        }
      `}</style>
    </div>
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
