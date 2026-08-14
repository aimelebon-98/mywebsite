"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  title: string;
  onOpen: () => void;
}

// Sticky mobile bar - measures actual navbar height to sit right below it
export default function AccountMobileBar({ title, onOpen }: Props) {
  const [topOffset, setTopOffset] = useState(105);

  useEffect(() => {
    const measure = () => {
      const nav = document.querySelector('nav[data-site-navbar="true"]') as HTMLElement | null;
      if (nav) {
        const rect = nav.getBoundingClientRect();
        if (rect.height > 0) setTopOffset(rect.height);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    const t = setTimeout(measure, 500);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      clearTimeout(t);
    };
  }, []);

  return (
    <div
      className="lg:hidden sticky z-30 -mx-4 sm:-mx-6 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm mb-4"
      style={{ top: `${topOffset}px` }}
    >
      <button
        onClick={onOpen}
        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>
      <h1 className="font-bold text-gray-900 text-sm truncate flex-1 min-w-0">{title}</h1>
    </div>
  );
}