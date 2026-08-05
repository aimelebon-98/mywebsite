"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useCurrency } from "@/lib/currency-context";
import { ArrowRight, Truck, Sparkles, Zap, Tag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  nameFr?: string | null;
  slug: string;
  slugFr?: string | null;
  imageUrl: string;
  price: string;
  comparePrice?: string | null;
  featured?: boolean | null;
}

interface CategoryItem {
  slug: string;
  nameEn: string;
  nameFr?: string | null;
}

const FALLBACK_CATS: CategoryItem[] = [
  { slug: "sneakers", nameEn: "Sneakers", nameFr: "Baskets" },
  { slug: "running",  nameEn: "Running",  nameFr: "Course" },
  { slug: "formal",   nameEn: "Formal",   nameFr: "Habill\u00e9" },
  { slug: "boots",    nameEn: "Boots",    nameFr: "Bottes" },
  { slug: "sandals",  nameEn: "Sandals",  nameFr: "Sandales" },
  { slug: "casual",   nameEn: "Casual",   nameFr: "D\u00e9contract\u00e9" },
];

const CAT_ICONS: Record<string, string> = {
  sneakers: "\ud83d\udc5f",  // sneaker
  running:  "\ud83c\udfc3",  // runner
  formal:   "\ud83d\udc54",  // suit
  boots:    "\ud83e\udd7e",  // boot
  sandals:  "\ud83e\ude74",  // sandal
  casual:   "\ud83d\udc5f",
};

export default function ShopMegaMenu({ onClose }: { onClose: () => void }) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const { format: formatPrice } = useCurrency();

  const [categories, setCategories] = useState<CategoryItem[]>(FALLBACK_CATS);
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/categories").then(r => r.ok ? r.json() : null).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data.map((c: { slug: string; nameEn: string; nameFr?: string }) => ({
          slug: c.slug, nameEn: c.nameEn, nameFr: c.nameFr,
        })));
      }
    }).catch(() => {});

    const url = isFr ? "/api/products?locale=fr" : "/api/products";
    fetch(url).then(r => r.ok ? r.json() : []).then(data => {
      if (Array.isArray(data)) {
        const feat = data.filter((p: Product) => p.featured).slice(0, 3);
        if (feat.length < 3) {
          feat.push(...data.slice(0, 3 - feat.length));
        }
        setFeatured(feat.slice(0, 3));
      }
    }).catch(() => {});
  }, [isFr]);

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[min(1100px,calc(100vw-2rem))] z-50"
      onMouseLeave={onClose}
    >
      {/* Caret */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-[240px_1fr_280px]">

          {/* LEFT: Categories */}
          <div className="p-5 border-r border-gray-100 bg-gray-50/50">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
              {isFr ? "Cat\u00e9gories" : "Categories"}
            </div>
            <div className="space-y-0.5">
              {categories.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/${locale}/shop?category=${cat.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:text-[#CA3F2E] hover:shadow-sm transition group"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">{CAT_ICONS[cat.slug] || "\u2b50"}</span>
                    {isFr && cat.nameFr ? cat.nameFr : cat.nameEn}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </Link>
              ))}
              <Link
                href={`/${locale}/shop`}
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2.5 mt-2 rounded-lg text-sm font-bold text-white shadow-md transition"
                style={{ backgroundColor: "#CA3F2E" }}
              >
                <span>{isFr ? "Voir tout" : "Shop All"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* MIDDLE: Featured Products */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  {isFr ? "Produits vedettes" : "Featured Products"}
                </span>
              </div>
              <Link href={`/${locale}/shop`} onClick={onClose} className="text-xs font-semibold text-gray-400 hover:text-[#CA3F2E] transition">
                {isFr ? "Voir plus" : "See more"}
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {featured.map(p => {
                const displayName = (isFr && p.nameFr) ? p.nameFr : p.name;
                const displaySlug = (isFr && p.slugFr) ? p.slugFr : p.slug;
                const price = parseFloat(p.price);
                const comparePrice = p.comparePrice ? parseFloat(p.comparePrice) : null;
                const discount = comparePrice && comparePrice > price
                  ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
                return (
                  <Link
                    key={p.id}
                    href={`/${locale}/product/${displaySlug}`}
                    onClick={onClose}
                    className="group block"
                  >
                    <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2">
                      {p.imageUrl && (
                        <Image src={p.imageUrl} alt={displayName} fill sizes="150px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
                      {discount > 0 && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded">
                          -{discount}%
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-gray-900 line-clamp-1 group-hover:text-[#CA3F2E] transition">{displayName}</div>
                    <div className="text-sm font-black mt-0.5" style={{ color: "#CA3F2E" }}>{formatPrice(price)}</div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Promo Panel */}
          <div className="relative p-5 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%)" }}>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/20 backdrop-blur rounded text-[9px] font-black tracking-widest mb-3">
                <Zap className="w-3 h-3" />
                {isFr ? "M\u00c9GA VENTE" : "MEGA SALE"}
              </div>
              <h3 className="text-2xl font-black leading-tight mb-2">
                {isFr ? "Jusqu\u0027\u00e0 50% de r\u00e9duction" : "Up to 50% OFF"}
              </h3>
              <p className="text-xs opacity-90 mb-4">
                {isFr ? "Sur les produits s\u00e9lectionn\u00e9s. Livraison gratuite offerte." : "On selected items. Free shipping included."}
              </p>
              <div className="flex items-center gap-2 mb-4 text-[11px]">
                <Truck className="w-4 h-4" />
                <span>{isFr ? "Livraison gratuite +$1000" : "Free shipping over $1000"}</span>
              </div>
              <Link
                href={`/${locale}/shop?onSale=1`}
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white rounded-full text-xs font-black hover:scale-105 transition"
                style={{ color: "#CA3F2E" }}
              >
                {isFr ? "Voir les offres" : "Shop Deals"}
                <Tag className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
