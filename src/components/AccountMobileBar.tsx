"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  title: string;
  onOpen: () => void;
}

// Fixed mobile bar - edge-to-edge, sits pinned below navbar
export default function AccountMobileBar({ title, onOpen }: Props) {
  const [topOffset, setTopOffset] = useState(56);
  const [barHeight, setBarHeight] = useState(52);

  useEffect(() => {
    const measure = () => {
      const nav = document.querySelector("nav, header nav, [class*='fixed'][class*='top-0']") as HTMLElement | null;
      if (nav) {
        const rect = nav.getBoundingClientRect();
        if (rect.height > 0) setTopOffset(rect.height);
      }
      const self = document.getElementById("account-mobile-bar");
      if (self) {
        const r = self.getBoundingClientRect();
        if (r.height > 0) setBarHeight(r.height);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 500);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);

  return (
    <>
      <div
        id="account-mobile-bar"
        className="lg:hidden fixed left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm"
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
      {/* Spacer to push content below the fixed bar - matches bar height dynamically */}
      <div className="lg:hidden" style={{ height: `${barHeight}px` }} />
    </>
  );
}