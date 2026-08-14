"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  title: string;
  onOpen: () => void;
}

// Sticky mobile bar for account pages
// Dynamically calculates top offset based on actual navbar height (which varies with promo bar / locale)
export default function AccountMobileBar({ title, onOpen }: Props) {
  const [topOffset, setTopOffset] = useState(56); // fallback = h-14

  useEffect(() => {
    // Find the fixed navbar element and get its actual rendered height
    const measure = () => {
      const nav = document.querySelector("nav, header nav, [class*='fixed'][class*='top-0']") as HTMLElement | null;
      if (nav) {
        const rect = nav.getBoundingClientRect();
        if (rect.height > 0) setTopOffset(rect.height);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    // Also re-measure after fonts/images load to catch layout shifts
    const t = setTimeout(measure, 500);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);

  return (
    <div className="lg:hidden bg-white border border-gray-200 rounded-xl px-3 py-2.5 flex items-center gap-2 mb-4 shadow-sm">
      <button
        onClick={onOpen}
        className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>
      <h1 className="font-bold text-gray-900 text-sm truncate flex-1 min-w-0">{title}</h1>
    </div>
  );
}