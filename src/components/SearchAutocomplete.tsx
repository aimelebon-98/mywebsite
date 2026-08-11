"use client";
import { trackEvent } from "@/components/AnalyticsTracker";
import { trackSearch as fbTrackSearch } from "@/lib/fbpixel";
import { useCurrency } from "@/lib/currency-context";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface Suggestion {
  id: string | number;
  name: string;
  nameFr?: string | null;
  slug?: string;
  slugFr?: string | null;
  imageUrl?: string | null;
  price?: string | null;
  category?: string | null;
}

interface SearchAutocompleteProps {
  placeholder?: string;
  initialValue?: string;
  onSubmit?: (value: string) => void;
  className?: string;
  inputClassName?: string;
  showClearButton?: boolean;
  iconClassName?: string;
}

export default function SearchAutocomplete({
  placeholder,
  initialValue = "",
  onSubmit,
  className = "",
  inputClassName = "",
  showClearButton = false,
  iconClassName = "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none",
}: SearchAutocompleteProps) {
  const tc = useTranslations("common");
  const locale = useLocale();
  const isFr = locale === "fr";
  const { format: formatPrice } = useCurrency();
  const resolvedPlaceholder = placeholder ?? tc("search");

  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowDropdown(true);
        try {
          if (query.trim().length >= 2) {
            trackEvent({ eventType: "search", searchQuery: query.trim() });
            try { fbTrackSearch({ search_string: query.trim() }); } catch { /* ignore */ }
          }
        } catch { /* ignore */ }
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    try { if (query && query.trim().length > 1) { trackEvent({ eventType: "search", searchQuery: query.trim() }); fbTrackSearch({ search_string: query.trim() }); } } catch {}
    e.preventDefault();
    if (!query.trim()) return;
    setShowDropdown(false);
    if (onSubmit) {
      onSubmit(query.trim());
    } else {
      router.push(`/${locale}/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const getDisplayName = (s: Suggestion) => (isFr && s.nameFr ? s.nameFr : s.name);
  const getSlug = (s: Suggestion) => (isFr && s.slugFr ? s.slugFr : s.slug);

  const handleSelectSuggestion = (s: Suggestion) => {
    try { trackEvent({ eventType: "search", searchQuery: query.trim() || getDisplayName(s) }); } catch {}
    setQuery(getDisplayName(s));
    setShowDropdown(false);
    const slug = getSlug(s);
    if (slug) {
      router.push(`/${locale}/product/${slug}`);
    } else {
      router.push(`/${locale}/shop?search=${encodeURIComponent(getDisplayName(s))}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((prev) => (prev + 1) % suggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length); }
    else if (e.key === "Enter" && activeIndex >= 0) { e.preventDefault(); handleSelectSuggestion(suggestions[activeIndex]); }
    else if (e.key === "Escape") { setShowDropdown(false); }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className={iconClassName} />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
          onFocus={() => query.length > 0 && setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={resolvedPlaceholder}
          className={inputClassName}
          autoComplete="off"
        />
        {showClearButton && query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setSuggestions([]); setShowDropdown(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {showDropdown && (suggestions.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
          {loading && suggestions.length === 0 ? (
            <div className="px-4 py-4 text-sm text-gray-400 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              {tc("searching")}
            </div>
          ) : (
            <ul className="py-1">
              {suggestions.map((s, idx) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition ${
                      activeIndex === idx ? "bg-gray-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {s.imageUrl ? (
                        <img src={s.imageUrl} alt={getDisplayName(s)} width="44" height="44" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Search className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{getDisplayName(s)}</div>
                      {s.category && (
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider truncate">{s.category}</div>
                      )}
                    </div>
                    {s.price && (
                      <div className="text-sm font-bold flex-shrink-0" style={{ color: "#CA3F2E" }}>
                        {formatPrice(parseFloat(s.price))}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
