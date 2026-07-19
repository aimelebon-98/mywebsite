"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, ChevronDown, X, Star, Tag, Search } from "lucide-react";

interface ShopTopBarProps {
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

export default function ShopTopBar(props: ShopTopBarProps) {
  const { category, search, sort, minPrice, maxPrice, brand, rating, onSale, brands, totalResults } = props;
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = { category, search, sort, minPrice, maxPrice, brand, rating, onSale, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== "all" && v !== "") params.set(k, v);
    });
    return `/shop?${params.toString()}`;
  };

  const hasActiveFilters = minPrice || maxPrice || brand || rating || onSale === "true" || search;
  const activeCount = [minPrice, maxPrice, brand, rating, onSale === "true" ? "1" : "", search].filter(Boolean).length;

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">{totalResults} result{totalResults !== 1 ? "s" : ""}</p>

        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => router.push(buildUrl({ sort: e.target.value }))}
              className="appearance-none pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="rating">Top Rated</option>
              <option value="name-az">Name: A → Z</option>
              <option value="name-za">Name: Z → A</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className={`lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition border ${
              mobileFiltersOpen || hasActiveFilters
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-gray-50 text-gray-600 border-gray-200"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeCount > 0 && (
              <span className="w-4 h-4 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile filters panel */}
      {mobileFiltersOpen && (
        <div className="lg:hidden bg-gray-50 rounded-2xl p-5 border border-gray-200 mb-5 animate-fade-in-up space-y-5">
          {hasActiveFilters && (
            <button
              onClick={() => { router.push(`/shop${category !== "all" ? `?category=${category}` : ""}`); setMobileFiltersOpen(false); }}
              className="flex items-center gap-1.5 text-sm font-medium text-red-500"
            >
              <X className="w-4 h-4" /> Clear All
            </button>
          )}

          {/* Search */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Search</h4>
            <form onSubmit={(e) => { e.preventDefault(); router.push(buildUrl({ search: localSearch })); setMobileFiltersOpen(false); }} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
              </div>
              <button type="submit" className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Go</button>
            </form>
          </div>

          {/* Price */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Price Range</h4>
            <div className="flex items-center gap-2 mb-2">
              <input type="number" value={localMinPrice} onChange={(e) => setLocalMinPrice(e.target.value)} placeholder="Min" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
              <span className="text-gray-300">—</span>
              <input type="number" value={localMaxPrice} onChange={(e) => setLocalMaxPrice(e.target.value)} placeholder="Max" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
              <button onClick={() => { router.push(buildUrl({ minPrice: localMinPrice, maxPrice: localMaxPrice })); setMobileFiltersOpen(false); }} className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium flex-shrink-0">Go</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Under $100", min: "", max: "100" },
                { label: "$100–$200", min: "100", max: "200" },
                { label: "$200+", min: "200", max: "" },
              ].map((r) => (
                <button key={r.label} onClick={() => { router.push(buildUrl({ minPrice: r.min, maxPrice: r.max })); setMobileFiltersOpen(false); }} className={`px-2.5 py-1 text-xs rounded-lg border transition ${minPrice === r.min && maxPrice === r.max ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200"}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Brand</h4>
            <div className="relative">
              <select value={brand} onChange={(e) => { router.push(buildUrl({ brand: e.target.value })); setMobileFiltersOpen(false); }} className="w-full appearance-none px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm cursor-pointer">
                <option value="">All Brands</option>
                {brands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Rating</h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "4.5+", value: "4.4" },
                { label: "4.0+", value: "3.9" },
                { label: "3.5+", value: "3.4" },
                { label: "Any", value: "" },
              ].map((r) => (
                <button key={r.label} onClick={() => { router.push(buildUrl({ rating: r.value })); setMobileFiltersOpen(false); }} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border transition ${rating === r.value ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200"}`}>
                  {r.value && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* On Sale */}
          <button
            onClick={() => { router.push(buildUrl({ onSale: onSale === "true" ? "" : "true" })); setMobileFiltersOpen(false); }}
            className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
              onSale === "true" ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Tag className="w-4 h-4" /> On Sale Only
          </button>
        </div>
      )}
    </>
  );
}
