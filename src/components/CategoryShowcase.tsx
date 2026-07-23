"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { useLocale } from "next-intl";

interface Category {
  name: string;
  slug: string;
  imageUrl?: string;
}

interface CategoryShowcaseProps {
  categories: Category[];
  activeCategory: string;
}

// Unsplash fallback images when no product image is available
const fallbackImages: Record<string, string> = {
  sneakers: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&q=80",
  running:  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80",
  formal:   "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&q=80",
  boots:    "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&q=80",
  sandals:  "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80",
  casual:   "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80",
  all:      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&q=80",
};

export default function CategoryShowcase({ categories, activeCategory }: CategoryShowcaseProps) {
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const visibleCategories = categories.filter(c => c.slug !== "all");

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [visibleCategories.length]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (visibleCategories.length === 0) return null;

  return (
    <div className="relative w-full">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-1 py-2"
        onMouseLeave={() => setHoveredSlug(null)}
      >
        {visibleCategories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          const isHovered = hoveredSlug === cat.slug;
          const isDimmed = hoveredSlug !== null && hoveredSlug !== cat.slug;
          const bgImg = cat.imageUrl || fallbackImages[cat.slug] || fallbackImages.all;

          return (
            <Link
              key={cat.slug}
              href={`/${locale}/shop?category=${cat.slug}`}
              onMouseEnter={() => setHoveredSlug(cat.slug)}
              className={`relative flex-shrink-0 w-32 sm:w-36 lg:w-40 aspect-square rounded-2xl overflow-hidden group transition-all duration-300 ${
                isHovered ? "scale-110 shadow-2xl z-10" : ""
              } ${isDimmed ? "opacity-50 scale-95" : ""} ${
                isActive ? "ring-2 ring-gray-900 ring-offset-2" : ""
              }`}
              style={{
                backgroundImage: `url(${bgImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "#f3f4f6",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {!cat.imageUrl && !fallbackImages[cat.slug] && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
              )}

              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-bold text-sm sm:text-base drop-shadow-lg capitalize">
                  {cat.name}
                </p>
              </div>

              {isActive && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full shadow-lg" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
