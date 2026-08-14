"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import SearchAutocomplete from "@/components/SearchAutocomplete";

interface Props {
  initialValue?: string;
}

export default function MobileShopStickySearch({ initialValue = "" }: Props) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Pin once we scroll past 60px (roughly where navbar ends on mobile)
      setPinned(window.scrollY > 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Inline search bar (renders in-flow, visible when NOT pinned) */}
      <div className={`lg:hidden mb-3 transition-opacity duration-200 ${pinned ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <div className="w-full min-w-0 bg-white rounded-full shadow-lg shadow-black/5 border border-gray-100 flex items-center gap-3 pl-2 pr-4 py-2">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-700"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <SearchAutocomplete
              placeholder={isFr ? "Rechercher ici" : "Search here"}
              initialValue={initialValue}
              inputClassName="w-full bg-transparent border-none text-sm font-semibold text-gray-900 placeholder:text-gray-500 placeholder:font-semibold focus:outline-none p-0"
              iconClassName="hidden"
              showClearButton
            />
          </div>
        </div>
      </div>

      {/* Fixed pinned search bar (appears once scrolled) */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 bg-white/95 backdrop-blur-md shadow-md transition-transform duration-300 ${pinned ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="w-full min-w-0 bg-white rounded-full shadow-lg shadow-black/5 border border-gray-100 flex items-center gap-3 pl-2 pr-4 py-2">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-700"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <SearchAutocomplete
              placeholder={isFr ? "Rechercher ici" : "Search here"}
              initialValue={initialValue}
              inputClassName="w-full bg-transparent border-none text-sm font-semibold text-gray-900 placeholder:text-gray-500 placeholder:font-semibold focus:outline-none p-0"
              iconClassName="hidden"
              showClearButton
            />
          </div>
        </div>
      </div>
    </>
  );
}