"use client";

import { Truck, ShieldCheck, RotateCcw, Star, Headphones, Lock } from "lucide-react";
import { useLocale } from "next-intl";

interface TrustBadgesProps {
  variant?: "full" | "compact" | "row";
  className?: string;
}

export default function TrustBadges({ variant = "full", className = "" }: TrustBadgesProps) {
  const locale = useLocale();
  const isFr = locale === "fr";

  const badges = [
    {
      icon: Truck,
      title: isFr ? "Livraison gratuite" : "Free Shipping",
      desc: isFr ? "Sur les commandes +$100" : "On orders over $100",
    },
    {
      icon: ShieldCheck,
      title: isFr ? "Paiement securise" : "Secure Payment",
      desc: isFr ? "Cryptage SSL 256-bit" : "256-bit SSL encryption",
    },
    {
      icon: RotateCcw,
      title: isFr ? "Retours 14 jours" : "14-Day Returns",
      desc: isFr ? "Retour facile & gratuit" : "Easy & free returns",
    },
    {
      icon: Star,
      title: isFr ? "Avis verifies" : "Verified Reviews",
      desc: isFr ? "Note moyenne 4.8/5" : "4.8/5 average rating",
    },
    {
      icon: Headphones,
      title: isFr ? "Support 24/7" : "24/7 Support",
      desc: isFr ? "Reponse en <5 min" : "Reply in <5 min",
    },
    {
      icon: Lock,
      title: isFr ? "100% authentique" : "100% Authentic",
      desc: isFr ? "Garantie d'authenticite" : "Authenticity guaranteed",
    },
  ];

  // Compact - horizontal small row (for cart/checkout)
  if (variant === "compact") {
    return (
      <div className={`flex items-center justify-center gap-6 flex-wrap py-3 text-xs text-gray-600 ${className}`}>
        {badges.slice(0, 4).map(b => {
          const Icon = b.icon;
          return (
            <div key={b.title} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-[#CA3F2E]" />
              <span className="font-semibold">{b.title}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Row - single horizontal row of icon+text (product page)
  if (variant === "row") {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-gray-200 ${className}`}>
        {badges.slice(0, 4).map(b => {
          const Icon = b.icon;
          return (
            <div key={b.title} className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#CA3F2E]/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#CA3F2E]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-900 truncate">{b.title}</div>
                <div className="text-[10px] text-gray-500 truncate">{b.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Full - large card grid (homepage)
  return (
    <section className={`py-10 lg:py-14 bg-gray-50 border-y border-gray-100 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map(b => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="group bg-white border border-gray-200 rounded-2xl p-5 text-center hover:border-[#CA3F2E] hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#CA3F2E]/10 to-[#CA3F2E]/20 mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-[#CA3F2E]" />
                </div>
                <div className="font-bold text-sm text-gray-900 mb-0.5">{b.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{b.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
