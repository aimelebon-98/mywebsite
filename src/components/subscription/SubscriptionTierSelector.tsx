"use client";
import React from "react";
import { SUBSCRIPTION_TIERS, getTierQuote, type SubscriptionTierMonths } from "@/lib/subscription-pricing";
import { CheckCheck, Sparkles } from "lucide-react";

interface Props { monthlyPrice: number; selectedMonths: SubscriptionTierMonths; onSelectTier: (m: SubscriptionTierMonths) => void; locale?: string; }

export function SubscriptionTierSelector({ monthlyPrice, selectedMonths, onSelectTier, locale = "en" }: Props) {
  const isFr = locale === "fr";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {isFr ? "Choisir une formule" : "Select Billing Plan"}
        </label>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          {isFr ? "Pas de renouvellement auto" : "No auto-rebill"}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const q = getTierQuote(monthlyPrice, tier.months);
          const sel = selectedMonths === tier.months;
          const best = tier.months === 12;
          return (
            <button type="button" key={tier.months} onClick={() => onSelectTier(tier.months)}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all min-w-0 ${sel ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20 shadow-sm" : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700"}`}>
              {best && (
                <span className="absolute -top-2.5 right-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />{isFr ? "Meilleur Prix" : "Best Deal"}
                </span>
              )}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{isFr ? tier.labelFr : tier.labelEn}</span>
                  {sel && <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center"><CheckCheck className="w-3 h-3" /></span>}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">${q.effectiveMonthly.toFixed(2)}<span className="text-[10px]">/{isFr ? "mois" : "mo"}</span></div>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
                <div className="text-base font-extrabold text-gray-900 dark:text-white">${q.total.toFixed(2)}</div>
                {q.savings > 0
                  ? <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{isFr ? `\u00c9conomisez $${q.savings.toFixed(2)}` : `Save $${q.savings.toFixed(2)}`}</span>
                  : <span className="text-[11px] text-gray-400">{isFr ? "Tarif standard" : "Standard rate"}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}