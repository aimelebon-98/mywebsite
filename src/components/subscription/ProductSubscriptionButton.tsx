"use client";

import React, { useState } from "react";
import { SubscriptionCheckoutModal } from "./SubscriptionCheckoutModal";
import { BrokerClaimModal } from "./BrokerClaimModal";
import { Sparkles, CheckCircle2, DollarSign, Gift, ArrowRight } from "lucide-react";

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
  const [openSub, setOpenSub] = useState(false);
  const [openBroker, setOpenBroker] = useState(false);
  const isFr = locale === "fr";

  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          data-subscribe-trigger="true"
          onClick={() => setOpenSub(true)}
          className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-base py-3.5 sm:py-4 rounded-xl shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isFr ? "S'abonner au SMZ Bot" : "Subscribe to SMZ Bot"}
        </button>

        <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
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

        {/* BROKER PROMO TRIGGER BANNER */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-xs space-y-2">
          <div className="flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
            <Gift className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5 text-sm">
                {isFr ? "Seulement 20$ de budget ?" : "Only have $20 & can't afford the bot + deposit?"}
              </span>
              <span>
                {isFr
                  ? "Seulement 20$ en poche et vous ne pouvez pas payer le robot ET alimenter votre compte ? Pas de souci ! Inscrivez-vous chez un courtier via notre lien et obtenez 1 mois d'abonnement au robot GRATUITEMENT."
                  : "Only have $20 and can't afford the bot and fund your account? We've got you covered! Just register to any broker of your choice using our link and get a full 1 month bot subscription for FREE."}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpenBroker(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-1"
          >
            <Gift className="w-4 h-4" />
            {isFr ? "R\u00e9clamer mes 1 Mois Gratuits" : "Claim 1 Month FREE via Broker Deposit"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <SubscriptionCheckoutModal
        product={product}
        isOpen={openSub}
        onClose={() => setOpenSub(false)}
        locale={locale}
      />

      <BrokerClaimModal
        isOpen={openBroker}
        onClose={() => setOpenBroker(false)}
        locale={locale}
      />
    </>
  );
}