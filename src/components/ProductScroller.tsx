"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/db/schema";
import ProductCard from "./ProductCard";

interface ProductScrollerProps {
  products: Product[];
  badge?: string;
}

export default function ProductScroller({ products, badge }: ProductScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

  return (
    <div className="relative group/scroller">
      {/* Arrows */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/3 -translate-x-2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover/scroller:opacity-100 transition hover:scale-110 border border-gray-100"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/3 translate-x-2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover/scroller:opacity-100 transition hover:scale-110 border border-gray-100"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 lg:gap-5 overflow-x-auto scrollbar-hide pb-2 px-1"
      >
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-[200px] sm:w-[220px] lg:w-[260px]">
            <ProductCard product={product} badge={badge} />
          </div>
        ))}
      </div>
    </div>
  );
}
