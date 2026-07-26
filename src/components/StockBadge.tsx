"use client";

import { Flame, AlertCircle } from "lucide-react";
import { useLocale } from "next-intl";

interface StockBadgeProps {
  stock: number;
  threshold?: number;
  variant?: "compact" | "large";
  className?: string;
}

export default function StockBadge({ stock, threshold = 10, variant = "compact", className = "" }: StockBadgeProps) {
  const locale = useLocale();
  const isFr = locale === "fr";

  // Out of stock
  if (stock <= 0) {
    if (variant === "large") {
      return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl ${className}`}>
          <AlertCircle className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-bold text-gray-700">
            {isFr ? "Rupture de stock" : "Out of stock"}
          </span>
        </div>
      );
    }
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 bg-gray-500 text-white rounded-full text-[10px] font-bold ${className}`}>
        {isFr ? "Epuise" : "Sold Out"}
      </div>
    );
  }

  // Above threshold - don't show anything
  if (stock > threshold) return null;

  // Low stock - urgency badge
  const isCritical = stock <= 3;

  if (variant === "large") {
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 animate-pulse-soft ${
        isCritical
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-amber-50 border-amber-200 text-amber-700"
      } ${className}`}>
        <Flame className={`w-4 h-4 ${isCritical ? "text-red-500" : "text-amber-500"} animate-pulse`} />
        <span className="text-sm font-bold">
          {isFr
            ? `Plus que ${stock} en stock !`
            : `Only ${stock} left in stock!`}
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
      isCritical ? "bg-red-500 text-white" : "bg-amber-500 text-white"
    } ${className}`}>
      <Flame className="w-2.5 h-2.5 animate-pulse" />
      {isFr ? `Plus que ${stock}` : `Only ${stock} left`}
    </div>
  );
}
