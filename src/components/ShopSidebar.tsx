"use client";
import { useCurrency } from "@/lib/currency-context";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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

// USD ceiling for internal storage (URL params always in USD)
const USD_FLOOR = 0;
const USD_CEILING = 500;
const USD_STEP = 5;

export default function ShopSidebar(props: ShopSidebarProps) {
  const { category, search, sort, minPrice, maxPrice, brand, rating, onSale, brands } = props;
  const { format: fmtPrice, convert, currency } = useCurrency();
  const t = useTranslations("shop");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  // Extract just the currency symbol (e.g., "L", "N", "CFA", "$") from a formatted price
  const currencySymbol = fmtPrice(0).replace(/[0-9,.\s]/g, "").trim() || currency;

  // Convert USD ceiling to display currency for slider display
  const displayCeiling = Math.round(convert(USD_CEILING));
  const displayFloor = 0;
  // Round step to nice increment in display currency
  const displayStep = (() => {
    const rawStep = convert(USD_STEP);
    if (rawStep >= 1000) return Math.round(rawStep / 1000) * 1000;
    if (rawStep >= 100) return Math.round(rawStep / 100) * 100;
    if (rawStep >= 10) return Math.round(rawStep / 10) * 10;
    return Math.max(1, Math.round(rawStep));
  })();

  const [localSearch, setLocalSearch] = useState(search);

  // Slider values are stored in DISPLAY currency
  // URL params are always USD (source of truth)
  const usdMinToDisplay = (usd: string) => usd ? Math.round(convert(Number(usd))) : displayFloor;
  const usdMaxToDisplay = (usd: string) => usd ? Math.round(convert(Number(usd))) : displayCeiling;

  const [sliderMin, setSliderMin] = useState<number>(usdMinToDisplay(minPrice));
  const [sliderMax, setSliderMax] = useState<number>(usdMaxToDisplay(maxPrice));
  const [localMinPrice, setLocalMinPrice] = useState<string>(minPrice ? String(Math.round(convert(Number(minPrice)))) : "");
  const [localMaxPrice, setLocalMaxPrice] = useState<string>(maxPrice ? String(Math.round(convert(Number(maxPrice)))) : "");

  const [openSection, setOpenSection] = useState<Record<string, boolean>>({
    search: true,
    price: true,
    brand: true,
    rating: true,
    special: true,
  });

  // Re-sync when currency OR URL params change
  useEffect(() => {
    setSliderMin(usdMinToDisplay(minPrice));
    setSliderMax(usdMaxToDisplay(maxPrice));
    setLocalMinPrice(minPrice ? String(Math.round(convert(Number(minPrice)))) : "");
    setLocalMaxPrice(maxPrice ? String(Math.round(convert(Number(maxPrice)))) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice, currency]);

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

  // Convert display value back to USD before pushing to URL
  const displayToUsd = (display: number): string => {
    if (display <= displayFloor) return "";
    const usd = display / convert(1); // reverse conversion
    return String(Math.round(usd * 100) / 100); // 2 decimals for USD
  };

  const handleApplyPrice = () => {
    const minVal = sliderMin > displayFloor ? displayToUsd(sliderMin) : "";
    const maxVal = sliderMax < displayCeiling ? displayToUsd(sliderMax) : "";
    router.push(buildUrl({ minPrice: minVal, maxPrice: maxVal }));
  };

  const clearAll = () => {
    router.push(`/${locale}/shop${category !== "all" ? `?category=${category}` : ""}`);
  };

  const handleSliderMinChange = (val: number) => {
    const clamped = Math.min(val, sliderMax - displayStep);
    const safe = Math.max(displayFloor, clamped);
    setSliderMin(safe);
    setLocalMinPrice(safe > displayFloor ? String(safe) : "");
  };

  const handleSliderMaxChange = (val: number) => {
    const clamped = Math.max(val, sliderMin + displayStep);
    const safe = Math.min(displayCeiling, clamped);
    setSliderMax(safe);
    setLocalMaxPrice(safe < displayCeiling ? String(safe) : "");
  };

  const handleInputMinChange = (v: string) => {
    setLocalMinPrice(v);
    const num = Number(v);
    if (!isNaN(num) && v !== "") {
      const safe = Math.max(displayFloor, Math.min(num, sliderMax - displayStep));
      setSliderMin(safe);
    } else if (v === "") {
      setSliderMin(displayFloor);
    }
  };

  const handleInputMaxChange = (v: string) => {
    setLocalMaxPrice(v);
    const num = Number(v);
    if (!isNaN(num) && v !== "") {
      const safe = Math.min(displayCeiling, Math.max(num, sliderMin + displayStep));
      setSliderMax(safe);
    } else if (v === "") {
      setSliderMax(displayCeiling);
    }
  };

  const minPct = ((sliderMin - displayFloor) / (displayCeiling - displayFloor)) * 100;
  const maxPct = ((sliderMax - displayFloor) / (displayCeiling - displayFloor)) * 100;

  // Preset ranges in USD (converted to display for button labels)
  const presets = [
    { label: `${t("under")} ${fmtPrice(50)}`,             usdMin: "",    usdMax: "50"  },
    { label: `${fmtPrice(50)} - ${fmtPrice(100)}`,        usdMin: "50",  usdMax: "100" },
    { label: `${fmtPrice(100)} - ${fmtPrice(200)}`,       usdMin: "100", usdMax: "200" },
    { label: `${fmtPrice(200)}+`,                          usdMin: "200", usdMax: ""    },
  ];

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 self-start sticky top-24 h-fit">
      <div className="space-y-1 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
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

        <FilterGroup title={t("filterPriceRange")} icon={<span className="text-sm font-bold">{currencySymbol}</span>} open={openSection.price} onToggle={() => toggleSection("price")}>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Range</span>
              <span className="font-semibold text-gray-900">
                {sliderMin === displayFloor && sliderMax >= displayCeiling
                  ? "Any"
                  : `${fmtPrice(sliderMin / convert(1))} - ${fmtPrice(sliderMax / convert(1))}${sliderMax >= displayCeiling ? "+" : ""}`}
              </span>
            </div>

            <DualRangeSlider
              min={displayFloor}
              max={displayCeiling}
              step={displayStep}
              valueMin={sliderMin}
              valueMax={sliderMax}
              minPct={minPct}
              maxPct={maxPct}
              onMinChange={handleSliderMinChange}
              onMaxChange={handleSliderMaxChange}
            />

            <div className="flex items-center gap-2">
              <input
                type="number"
                value={localMinPrice}
                onChange={(e) => handleInputMinChange(e.target.value)}
                placeholder={`${t("priceMin")} (${currencySymbol})`}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition min-w-0"
              />
              <span className="text-gray-300">-</span>
              <input
                type="number"
                value={localMaxPrice}
                onChange={(e) => handleInputMaxChange(e.target.value)}
                placeholder={`${t("priceMax")} (${currencySymbol})`}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition min-w-0"
              />
            </div>

            <button
              onClick={handleApplyPrice}
              className="w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition"
            >
              {t("apply")}
            </button>

            <div className="grid grid-cols-1 gap-1.5">
              {presets.map((r) => (
                <button
                  key={r.usdMin + "-" + r.usdMax}
                  onClick={() => router.push(buildUrl({ minPrice: r.usdMin, maxPrice: r.usdMax }))}
                  className={`px-3 py-2 text-xs rounded-lg border transition text-left ${
                    minPrice === r.usdMin && maxPrice === r.usdMax
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
          <div className="space-y-1">
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
    <div className="relative w-full h-5 my-2">
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-gray-200 rounded-full" />
      <div
        className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-gray-900 rounded-full"
        style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={(e) => onMinChange(Number(e.target.value))}
        className="range-thumb absolute left-0 right-0 top-0 w-full h-5 appearance-none bg-transparent m-0 p-0"
        aria-label="Minimum price"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={(e) => onMaxChange(Number(e.target.value))}
        className="range-thumb absolute left-0 right-0 top-0 w-full h-5 appearance-none bg-transparent m-0 p-0"
        aria-label="Maximum price"
      />
      <style jsx>{`
        .range-thumb {
          pointer-events: none;
        }
        .range-thumb::-webkit-slider-runnable-track {
          background: transparent;
          height: 20px;
          border: none;
        }
        .range-thumb::-moz-range-track {
          background: transparent;
          height: 20px;
          border: none;
        }
        .range-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid #111827;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
          margin-top: 1px;
          position: relative;
          z-index: 3;
        }
        .range-thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid #111827;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
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