"use client";

import Link from "next/link";
import { useState } from "react";
import { Package } from "lucide-react";
import { useLocale } from "next-intl";

interface Category {
  name: string;
  slug: string;
  imageUrl?: string;
}

interface CategoryShowcaseProps {
  categories: Category[];
  activeCategory: string;
  /** Seconds for one full loop. Higher = slower. Default 40s. */
  speed?: number;
}

import { CATEGORY_IMAGES, CATEGORY_IMAGE_ALL } from "@/lib/category-images";

const fallbackImages: Record<string, string> = {
  ...CATEGORY_IMAGES,
  all: CATEGORY_IMAGE_ALL,
};

export default function CategoryShowcase({ categories, activeCategory, speed = 40 }: CategoryShowcaseProps) {
  const locale = useLocale();
  const [paused, setPaused] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const visibleCategories = categories.filter(c => c.slug !== "all");
  if (visibleCategories.length === 0) return null;

  // Duplicate the list so the marquee can loop seamlessly
  const looped = [...visibleCategories, ...visibleCategories];

  const renderCard = (cat: Category, keyPrefix: string) => {
    const isActive = activeCategory === cat.slug;
    const isHovered = hoveredSlug === cat.slug;
    const isDimmed = hoveredSlug !== null && hoveredSlug !== cat.slug;
    const bgImg = cat.imageUrl || fallbackImages[cat.slug] || fallbackImages.all;

    return (
      <Link
        key={keyPrefix + "-" + cat.slug}
        href={`/${locale}/shop?category=${cat.slug}`}
        onMouseEnter={() => { setHoveredSlug(cat.slug); setPaused(true); }}
        onMouseLeave={() => { setHoveredSlug(null); setPaused(false); }}
        className={"relative flex-shrink-0 w-32 sm:w-36 lg:w-40 aspect-square rounded-2xl overflow-hidden group transition-all duration-300 border-2 " +
          (isActive
            ? "border-white shadow-[0_0_0_2px_rgba(255,255,255,0.3),0_10px_40px_-5px_rgba(255,255,255,0.4)]"
            : "border-white/70 hover:border-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)]") +
          (isHovered ? " scale-110 shadow-2xl z-10" : "") +
          (isDimmed ? " opacity-50 scale-95" : "")
        }
        style={{
          backgroundImage: `url(${bgImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#f3f4f6",
        }}
      >
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/30 pointer-events-none" />
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
          <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-white rounded-full shadow-lg ring-2 ring-white/40" />
        )}
      </Link>
    );
  };

  return (
    <div
      className="relative w-full overflow-x-hidden py-4 group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Edge fade masks - both sides fade so the loop point is invisible */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-20 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-20 bg-gradient-to-l from-black to-transparent" />

      {/* Marquee track - moves -50% forever (which is exactly one full set width) */}
      <div
        className="flex gap-3 w-max"
        style={{
          animation: `category-marquee ${speed}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {looped.map((cat, i) => renderCard(cat, i < visibleCategories.length ? "a" : "b"))}
      </div>
    </div>
  );
}
