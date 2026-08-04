"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Star, Truck, Shield, RotateCcw, Headphones, Search } from "lucide-react";
import SearchAutocomplete from "@/components/SearchAutocomplete";

const HERO_IMAGE = "https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?w=800&q=80";

export default function MobileHomeHero() {
  const locale = useLocale();
  const isFr = locale === "fr";

  const features = [
    { icon: Truck,      title: isFr ? "Livraison gratuite"  : "Free Shipping",   sub: isFr ? "Commandes 1000$+"      : "On orders over $1000" },
    { icon: Shield,     title: isFr ? "Paiement s\u00e9curis\u00e9" : "Secure Payment",  sub: isFr ? "100% prot\u00e9g\u00e9"          : "100% protected" },
    { icon: RotateCcw,  title: isFr ? "Retours faciles"     : "Easy Returns",    sub: isFr ? "14 jours"              : "14-day return policy" },
    { icon: Headphones, title: isFr ? "Support 24/7"        : "24/7 Support",    sub: isFr ? "Via WhatsApp"          : "Via WhatsApp" },
  ];

  return (
    <section className="lg:hidden bg-white">
      {/* Social proof strip */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-1.5">
            {["bg-blue-500","bg-pink-500","bg-green-500","bg-purple-500","bg-amber-500"].map((c, i) => (
              <div key={i} className={`w-6 h-6 ${c} rounded-full border-2 border-white flex items-center justify-center shadow-sm`}>
                <span className="text-white text-[8px] font-bold">{["JW","SC","MT","EP","AK"][i]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
            </div>
            <span className="text-xs font-semibold text-gray-700">2,400+ {isFr ? "clients satisfaits" : "happy customers"}</span>
          </div>
        </div>
      </div>

      {/* Search bar with autocomplete */}
      <div className="px-4 pb-3">
        <SearchAutocomplete
          placeholder={isFr ? "Rechercher des chaussures..." : "Search shoes..."}
          inputClassName="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] focus:border-transparent transition"
          iconClassName="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          showClearButton
        />
      </div>

      {/* Product image card */}
      <div className="px-4 pb-4">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 aspect-[3/4] shadow-lg">
          <Image
            src={HERO_IMAGE}
            alt="Featured shoe"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          {/* Top Rated badge - top right */}
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-lg">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] font-bold text-gray-900">{isFr ? "Mieux not\u00e9" : "Top Rated"}</div>
              <div className="text-[9px] text-gray-500">4.8/5 Stars</div>
            </div>
          </div>

          {/* Free Shipping pill - bottom left */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-lg">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] font-bold text-gray-900">{isFr ? "Livraison gratuite" : "Free Shipping"}</div>
              <div className="text-[9px] text-gray-500">{isFr ? "Commandes 1000$+" : "On orders over $1000"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature strip - dark card with 4 icons */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-px bg-gray-800 rounded-2xl overflow-hidden">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-gray-900 p-3.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-white leading-tight truncate">{f.title}</div>
                  <div className="text-[9px] text-gray-400 leading-tight truncate">{f.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
