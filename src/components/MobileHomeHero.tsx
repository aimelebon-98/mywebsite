"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { useCurrency } from "@/lib/currency-context";
import { Phone, MessageCircle, ChevronRight, Flame, Sparkles, Zap, Tag } from "lucide-react";
import SearchAutocomplete from "@/components/SearchAutocomplete";

interface Product {
  id: string;
  name: string;
  nameFr?: string | null;
  slug: string;
  slugFr?: string | null;
  imageUrl: string;
  price: string;
  comparePrice?: string | null;
  category: string;
  featured?: boolean | null;
}

interface CategoryLite {
  slug: string;
  nameEn: string;
  nameFr?: string | null;
}

const FALLBACK_CATS: CategoryLite[] = [
  { slug: "sneakers", nameEn: "Sneakers",     nameFr: "Baskets" },
  { slug: "running",  nameEn: "Running",      nameFr: "Course" },
  { slug: "formal",   nameEn: "Formal",       nameFr: "Habill\u00e9" },
  { slug: "boots",    nameEn: "Boots",        nameFr: "Bottes" },
  { slug: "sandals",  nameEn: "Sandals",      nameFr: "Sandales" },
  { slug: "casual",   nameEn: "Casual",       nameFr: "D\u00e9contract\u00e9" },
];

const CAT_IMAGES: Record<string, string> = {
  sneakers: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80",
  running:  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&q=80",
  formal:   "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=300&q=80",
  boots:    "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=300&q=80",
  sandals:  "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=300&q=80",
  casual:   "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&q=80",
};

export default function MobileHomeHero() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const { format: formatPrice } = useCurrency();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryLite[]>(FALLBACK_CATS);
  const [whatsapp, setWhatsapp] = useState("");
  const [slideIdx, setSlideIdx] = useState(0);

  // Fetch products, categories, settings
  useEffect(() => {
    const url = isFr ? "/api/products?locale=fr" : "/api/products";
    fetch(url).then(r => r.ok ? r.json() : []).then(data => {
      if (Array.isArray(data)) setProducts(data);
    }).catch(() => {});

    fetch("/api/categories").then(r => r.ok ? r.json() : null).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data.map((c: { slug: string; nameEn: string; nameFr?: string }) => ({
          slug: c.slug, nameEn: c.nameEn, nameFr: c.nameFr,
        })));
      }
    }).catch(() => {});

    fetch("/api/settings").then(r => r.ok ? r.json() : null).then(data => {
      if (data?.whatsappNumber) setWhatsapp(data.whatsappNumber);
    }).catch(() => {});
  }, [isFr]);

  // Hero carousel slides (dynamic based on categories)
  const slides = [
    {
      badge: isFr ? "M\u00c9GA VENTE" : "MEGA SALE",
      title: isFr ? "Jusqu\u0027\u00e0 50% de r\u00e9duction" : "Up to 50% OFF",
      subtitle: isFr ? "Sur toutes les baskets" : "On All Sneakers",
      cta: isFr ? "Acheter" : "Shop Now",
      href: `/${locale}/shop?category=sneakers`,
      bg: "linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%)",
      image: CAT_IMAGES.sneakers,
    },
    {
      badge: isFr ? "NOUVEAU" : "NEW IN",
      title: isFr ? "Collection Course" : "Running Collection",
      subtitle: isFr ? "Livraison gratuite dispo" : "Free shipping available",
      cta: isFr ? "D\u00e9couvrir" : "Discover",
      href: `/${locale}/shop?category=running`,
      bg: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      image: CAT_IMAGES.running,
    },
    {
      badge: isFr ? "OFFRES CHAUDES" : "HOT DEALS",
      title: isFr ? "Chaussures habill\u00e9es" : "Formal Shoes",
      subtitle: isFr ? "Style intemporel" : "Timeless style",
      cta: isFr ? "Voir tout" : "See All",
      href: `/${locale}/shop?category=formal`,
      bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      image: CAT_IMAGES.formal,
    },
  ];

  // Auto-advance carousel
  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  const dealsProducts = products.filter(p => p.comparePrice).slice(0, 10);
  const waPhone = whatsapp.replace(/\D/g, "");

  // Quick action tiles - shoe-themed with fun labels
  const tiles = [
    { label: isFr ? "SAVE MORE"    : "SAVE MORE",    sub: isFr ? "Bonnes affaires" : "Best deals",   href: `/${locale}/shop?onSale=1`,        bg: "bg-gradient-to-br from-yellow-400 to-amber-500", icon: Tag },
    { label: isFr ? "HOT DEALS"    : "HOT DEALS",    sub: isFr ? "Offres chaudes"  : "Hot offers",   href: `/${locale}/shop?sort=newest`,     bg: "bg-gradient-to-br from-red-500 to-orange-600",   icon: Flame },
    { label: isFr ? "NEW ARRIVALS" : "NEW ARRIVALS", sub: isFr ? "Nouveaut\u00e9s" : "Just landed",  href: `/${locale}/shop?sort=newest`,     bg: "bg-gradient-to-br from-emerald-400 to-teal-600", icon: Sparkles },
    { label: isFr ? "MEGA VALUE"   : "MEGA VALUE",   sub: isFr ? "Grande valeur"   : "Great value",  href: `/${locale}/shop`,                 bg: "bg-gradient-to-br from-purple-500 to-fuchsia-600", icon: Zap },
  ];

  return (
    <div className="lg:hidden bg-gray-50">
      {/* SEARCH BAR - full width */}
      <div className="bg-white px-3 py-3 shadow-sm">
        <SearchAutocomplete
          placeholder={isFr ? "Rechercher produits, marques..." : "Search for products, brands..."}
          inputClassName="w-full pl-10 pr-10 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] focus:border-transparent transition"
          iconClassName="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
          showClearButton
        />
      </div>

      {/* CATEGORY PILLS - horizontal scroll */}
      <div className="bg-white border-t border-gray-100">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 px-3 py-2 min-w-max">
            <Link
              href={`/${locale}/shop`}
              className="px-4 py-2 rounded-full text-xs font-bold text-white whitespace-nowrap"
              style={{ backgroundColor: "#CA3F2E" }}
            >
              {isFr ? "Accueil" : "Home"}
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/${locale}/shop?category=${cat.slug}`}
                className="px-4 py-2 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-100 whitespace-nowrap transition"
              >
                {isFr && cat.nameFr ? cat.nameFr : cat.nameEn}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CALL TO ORDER STRIP */}
      {(whatsapp || true) && (
        <div className="bg-gray-900 text-white px-3 py-2 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3" style={{ color: "#CA3F2E" }} />
            <span className="font-bold">{isFr ? "COMMANDEZ:" : "CALL TO ORDER:"}</span>
            {waPhone && (
              <a href={`tel:+${waPhone}`} className="hover:underline truncate max-w-[100px]">+{waPhone}</a>
            )}
          </div>
          {waPhone && (
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 bg-green-600 rounded-md px-2 py-1 hover:bg-green-700 transition"
            >
              <MessageCircle className="w-3 h-3" />
              <span className="font-semibold">WhatsApp</span>
            </a>
          )}
        </div>
      )}

      {/* HERO CAROUSEL */}
      <div className="px-3 py-3">
        <div className="relative rounded-2xl overflow-hidden shadow-md" style={{ background: slides[slideIdx].bg }}>
          <Link href={slides[slideIdx].href} className="block relative h-40">
            <div className="absolute inset-0 flex items-center">
              <div className="flex-1 pl-4 pr-2 py-4 text-white z-10">
                <div className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur rounded text-[9px] font-black tracking-widest mb-2">
                  {slides[slideIdx].badge}
                </div>
                <h3 className="text-lg font-black leading-tight mb-1 drop-shadow">{slides[slideIdx].title}</h3>
                <p className="text-[11px] opacity-90 mb-3">{slides[slideIdx].subtitle}</p>
                <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-xs font-bold" style={{ color: "#CA3F2E" }}>
                  {slides[slideIdx].cta}
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
              <div className="w-32 h-32 relative flex-shrink-0 mr-2 rounded-2xl overflow-hidden shadow-lg">
                <Image src={slides[slideIdx].image} alt="" fill sizes="128px" className="object-cover" />
              </div>
            </div>
          </Link>

          {/* Dots indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className={"h-1.5 rounded-full transition-all " + (i === slideIdx ? "w-4 bg-white" : "w-1.5 bg-white/50")}
              />
            ))}
          </div>
        </div>
      </div>

      {/* QUICK ACTION TILES */}
      <div className="px-3 pb-3 grid grid-cols-4 gap-2">
        {tiles.map((tile, i) => {
          const Icon = tile.icon;
          return (
            <Link
              key={i}
              href={tile.href}
              className={"relative rounded-xl overflow-hidden p-2.5 aspect-square flex flex-col items-center justify-center text-white shadow-md active:scale-95 transition " + tile.bg}
            >
              <Icon className="w-6 h-6 mb-1 drop-shadow" />
              <div className="text-[9px] font-black leading-tight text-center drop-shadow">{tile.label}</div>
              <div className="text-[8px] opacity-90 leading-tight text-center mt-0.5">{tile.sub}</div>
            </Link>
          );
        })}
      </div>

      {/* TODAY'S DEALS - horizontal scroll */}
      {dealsProducts.length > 0 && (
        <div className="bg-white pt-4 pb-3">
          <div className="flex items-center justify-between px-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 rounded" style={{ backgroundColor: "#CA3F2E" }}>
                <span className="text-white text-[10px] font-black tracking-wide">{isFr ? "OFFRES DU JOUR" : "TODAY\u0027S DEALS"}</span>
              </div>
              <span className="text-xs font-bold text-gray-900">{isFr ? "Prix imbattables" : "Unbeatable Prices"}</span>
            </div>
            <Link href={`/${locale}/shop?onSale=1`} className="text-xs font-semibold text-gray-500 hover:text-[#CA3F2E] flex items-center gap-0.5">
              {isFr ? "Voir tout" : "See all"}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 px-3 pb-1 min-w-max">
              {dealsProducts.map(p => {
                const displayName = (isFr && p.nameFr) ? p.nameFr : p.name;
                const displaySlug = (isFr && p.slugFr) ? p.slugFr : p.slug;
                const price = parseFloat(p.price);
                const comparePrice = p.comparePrice ? parseFloat(p.comparePrice) : null;
                const discount = comparePrice && comparePrice > price
                  ? Math.round(((comparePrice - price) / comparePrice) * 100)
                  : 0;
                return (
                  <Link
                    key={p.id}
                    href={`/${locale}/product/${displaySlug}`}
                    className="w-32 flex-shrink-0 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    <div className="relative aspect-square bg-gray-50">
                      {p.imageUrl && (
                        <Image src={p.imageUrl} alt={displayName} fill sizes="128px" className="object-cover" />
                      )}
                      {discount > 0 && (
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded">
                          -{discount}%
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="text-[11px] font-semibold text-gray-900 line-clamp-2 leading-tight mb-1 h-8">
                        {displayName}
                      </div>
                      <div className="text-xs font-black" style={{ color: "#CA3F2E" }}>{formatPrice(price)}</div>
                      {comparePrice && comparePrice > price && (
                        <div className="text-[9px] text-gray-400 line-through">{formatPrice(comparePrice)}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
