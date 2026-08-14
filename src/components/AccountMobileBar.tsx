"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  title: string;
  onOpen: () => void;
}

export default function AccountMobileBar({ title, onOpen }: Props) {
  const [topOffset, setTopOffset] = useState(0);
  const [barHeight, setBarHeight] = useState(48);

  useEffect(() => {
    const measure = () => {
      const nav = document.querySelector('nav[data-site-navbar="true"]') as HTMLElement | null;
      if (nav) {
        const rect = nav.getBoundingClientRect();
        const top = Math.max(0, rect.bottom);
        setTopOffset(top);
      }
    };
    measure();
    const raf1 = requestAnimationFrame(measure);
    const t1 = setTimeout(measure, 100);
    const t2 = setTimeout(measure, 500);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, []);

  return (
    <>
      <div
        className="lg:hidden fixed left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm"
        style={{ top: `${topOffset}px`, height: `${barHeight}px` }}
        ref={(el) => {
          if (el && el.offsetHeight && el.offsetHeight !== barHeight) {
            setBarHeight(el.offsetHeight);
          }
        }}
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
      <div className="lg:hidden" style={{ height: `${barHeight}px`, marginBottom: "16px" }} aria-hidden="true" />
    </>
  );
}