"use client";

import { Gift, Sparkles } from "lucide-react";
import { useLocale } from "next-intl";
import type { Bundle } from "@/lib/bundles";

interface BundleBannerProps {
  bundle: Bundle | null;
  bundles: Bundle[];
  currentItemCount: number;
  discountAmount: number;
  currency: string;
}

export default function BundleBanner({ bundle, bundles, currentItemCount, discountAmount, currency }: BundleBannerProps) {
  const locale = useLocale();
  const isFr = locale === "fr";

  // Applied bundle - show success
  if (bundle) {
    const name = isFr && bundle.nameFr ? bundle.nameFr : bundle.name;
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 mb-4">
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-200/30 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3 h-3" />
              {isFr ? "Offre appliquee" : "Deal Applied"}
            </div>
            <div className="text-sm font-bold text-gray-900">{name}</div>
            <div className="text-xs text-emerald-700 font-semibold mt-0.5">
              -{currency}{discountAmount.toFixed(2)} ({bundle.discountPercent}% off)
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show next available bundle as motivator
  const nextBundle = bundles
    .filter(b => b.active && b.minItems > currentItemCount)
    .sort((a, b) => a.minItems - b.minItems)[0];

  if (!nextBundle) return null;

  const needed = nextBundle.minItems - currentItemCount;
  const name = isFr && nextBundle.nameFr ? nextBundle.nameFr : nextBundle.name;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-[#CA3F2E]/40 bg-gradient-to-br from-[#CA3F2E]/5 to-white p-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] flex items-center justify-center shadow-md">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-[#CA3F2E] uppercase tracking-wider mb-0.5">
            {isFr ? "Presque !" : "Almost there!"}
          </div>
          <div className="text-sm font-bold text-gray-900">
            {isFr
              ? `Ajoutez ${needed} article${needed > 1 ? "s" : ""} de plus pour ${nextBundle.discountPercent}% de reduction`
              : `Add ${needed} more item${needed > 1 ? "s" : ""} to get ${nextBundle.discountPercent}% off`}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{name}</div>
        </div>
      </div>
    </div>
  );
}
