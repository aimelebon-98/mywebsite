"use client";

import React, { useState } from "react";
import { SubscriptionCheckoutModal } from "./SubscriptionCheckoutModal";
import { Sparkles, CheckCircle2, DollarSign } from "lucide-react";

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    subscriptionConfig?: string | null;
  };
  locale?: string;
}

export function ProductSubscriptionButton({ product, locale = "en" }: Props) {
  const [open, setOpen] = useState(false);
  const isFr = locale === "fr";

  return (
    <>
      <div className="space-y-2">
        <button
          type="button"
          data-subscribe-trigger="true"
          onClick={() => setOpen(true)}
          className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-base py-3.5 sm:py-4 rounded-xl shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isFr ? "S'abonner" : "Subscribe"}
        </button>
        <div className="flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            {isFr ? "1, 3, 5 ou 12 mois" : "1, 3, 5 or 12 mos"}
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            {isFr ? "Activation auto" : "Auto-activation"}
          </span>
        </div>
      </div>
      <SubscriptionCheckoutModal
        product={product}
        isOpen={open}
        onClose={() => setOpen(false)}
        locale={locale}
      />
    </>
  );
}