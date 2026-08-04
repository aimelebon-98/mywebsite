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
    <div
      className="lg:hidden sticky z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 mb-3 shadow-sm -mx-4 sm:-mx-6"
      style={{ top: `${topOffset}px` }}
    >
      <button
        onClick={onOpen}
        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>
      <h1 className="font-bold text-gray-900 text-sm truncate flex-1">{title}</h1>
    </div>
  );
}