"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface Suggestion {
  id: string | number;
  name: string;
  slug?: string;
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
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);
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
    e.preventDefault();
    if (!query.trim()) return;
    setShowDropdown(false);
    if (onSubmit) {
      onSubmit(query.trim());
    } else {
      router.push(`/${locale}/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectSuggestion = (s: Suggestion) => {
    setQuery(s.name);
    setShowDropdown(false);
    if (s.slug) {
      router.push(`/${locale}/product/${s.slug}`);
    } else {
      router.push(`/${locale}/shop?search=${encodeURIComponent(s.name)}`);
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
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {loading && suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">{tc("searching")}</div>
          ) : (
            <ul>
              {suggestions.map((s, idx) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition ${
                      activeIndex === idx ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{s.name}</span>
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
