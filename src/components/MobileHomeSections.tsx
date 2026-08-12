"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useCurrency } from "@/lib/currency-context";
import { ChevronRight, Heart } from "lucide-react";

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
  brand?: string | null;
  featured?: boolean | null;
  rating?: string | null;
  tags?: string | null;
}

interface CategoryItem {
  slug: string;
  nameEn: string;
  nameFr?: string | null;
  imageUrl?: string;
}

interface Props {
  products: Product[];
  categories: CategoryItem[];
}

const CAT_TINTS: Record<string, string> = {
  sneakers: "bg-blue-50",
  running:  "bg-emerald-50",
  formal:   "bg-amber-50",
  boots:    "bg-orange-50",
  sandals:  "bg-cyan-50",
  casual:   "bg-purple-50",
};

function ProductScroll({ products, title, badge, badgeColor, locale, isFr, formatPrice, viewAllHref }: {
  products: Product[]; title: string; badge?: string; badgeColor?: string;
  locale: string; isFr: boolean; formatPrice: (n: number) => string; viewAllHref: string;
}) {
  if (products.length === 0) return null;
  return (
    <div className="bg-white pt-3 pb-3 border-t-4 border-gray-100">
      <div className="flex items-center justify-between px-3 mb-3">
        <div className="flex items-center gap-2">
          {badge && (
            <div className="px-2 py-1 rounded" style={{ backgroundColor: badgeColor || "#CA3F2E" }}>
              <span className="text-white text-[10px] font-black tracking-wide">{badge}</span>
            </div>
          )}
          <span className="text-sm font-bold text-gray-900">{title}</span>
        </div>
        <Link prefetch={false} href={viewAllHref} className="text-xs font-semibold text-gray-500 hover:text-[#CA3F2E] flex items-center gap-0.5">
          {isFr ? "Voir tout" : "See all"}
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-3 pb-1 min-w-max">
          {products.map(p => {
            const displayName = (isFr && p.nameFr) ? p.nameFr : p.name;
            const displaySlug = (isFr && p.slugFr) ? p.slugFr : p.slug;
            const price = parseFloat(p.price);
            const comparePrice = p.comparePrice ? parseFloat(p.comparePrice) : null;
            const discount = comparePrice && comparePrice > price
              ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
            const rating = parseFloat(p.rating || "0");
            return (
              <Link prefetch={false} key={p.id} href={`/${locale}/product/${displaySlug}`}
                className="w-[110px] flex-shrink-0 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm active:scale-95 transition">
                <div className="relative aspect-square bg-gray-50">
                  {p.imageUrl && <Image src={p.imageUrl} alt={displayName} fill sizes="130px" quality={75} className="object-cover" />}
                  {discount > 0 && (
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded">-{discount}%</div>
                  )}
                </div>
                <div className="p-1.5">
                  <div className="text-[10px] font-semibold text-gray-900 line-clamp-2 leading-tight mb-1 h-7">{displayName}</div>
                  <div className="text-xs font-black" style={{ color: "#CA3F2E" }}>{formatPrice(price)}</div>
                  {comparePrice && comparePrice > price && (
                    <div className="text-[9px] text-gray-400 line-through leading-tight">{formatPrice(comparePrice)}</div>
                  )}
                  {rating > 0 && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={"text-[9px] " + (i <= Math.round(rating) ? "text-amber-400" : "text-gray-200")}>*</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProductGrid({ products, title, locale, isFr, formatPrice, viewAllHref, bgTint }: {
  products: Product[]; title: string; locale: string; isFr: boolean;
  formatPrice: (n: number) => string; viewAllHref: string; bgTint?: string;
}) {
  if (products.length === 0) return null;
  return (
    <div className={"pt-4 pb-4 border-t-4 border-gray-100 " + (bgTint || "bg-white")}>
      <div className="flex items-center justify-between px-3 mb-3">
        <span className="text-sm font-bold text-gray-900">{title}</span>
        <Link prefetch={false} href={viewAllHref} className="text-xs font-semibold text-gray-500 hover:text-[#CA3F2E] flex items-center gap-0.5">
          {isFr ? "Voir tout" : "See all"}
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 px-3">
        {products.slice(0, 6).map(p => {
          const displayName = (isFr && p.nameFr) ? p.nameFr : p.name;
          const displaySlug = (isFr && p.slugFr) ? p.slugFr : p.slug;
          const price = parseFloat(p.price);
          const comparePrice = p.comparePrice ? parseFloat(p.comparePrice) : null;
          const discount = comparePrice && comparePrice > price
            ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
          return (
            <Link prefetch={false} key={p.id} href={`/${locale}/product/${displaySlug}`}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm active:scale-95 transition">
              <div className="relative aspect-square bg-gray-50">
                {p.imageUrl && <Image src={p.imageUrl} alt={displayName} fill sizes="(max-width: 640px) 50vw, 300px" quality={80} className="object-cover" />}
                {discount > 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded">-{discount}%</div>
                )}
                <button className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow"
                  aria-label="Wishlist" onClick={(e) => e.preventDefault()}>
                  <Heart className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
              <div className="p-2">
                <div className="text-[11px] font-semibold text-gray-900 line-clamp-2 leading-tight mb-1 h-8">{displayName}</div>
                <div className="text-sm font-black" style={{ color: "#CA3F2E" }}>{formatPrice(price)}</div>
                {comparePrice && comparePrice > price && (
                  <div className="text-[10px] text-gray-400 line-through leading-tight">{formatPrice(comparePrice)}</div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function MobileHomeSections({ products, categories }: Props) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const { format: formatPrice, visitorCountry } = useCurrency();

  const featured    = products.filter(p => p.featured).slice(0, 10);
  const newArrivals = products.filter(p => (p.tags || "").includes("new-arrival")).slice(0, 10);
  if (newArrivals.length < 4) newArrivals.push(...products.slice(0, 10 - newArrivals.length));
  const onSale      = products.filter(p => p.comparePrice).slice(0, 10);
  const topRated    = products.filter(p => parseFloat(p.rating ?? "0") > 4.0)
    .sort((a, b) => parseFloat(b.rating ?? "0") - parseFloat(a.rating ?? "0")).slice(0, 10);
  if (topRated.length < 4) topRated.push(...products.slice(0, 10 - topRated.length));

  const brands = [
    { name: "Nike",       tagline: isFr ? "Just Do It" : "Just Do It" },
    { name: "Adidas",     tagline: isFr ? "Impossible n\u0027est rien" : "Impossible is Nothing" },
    { name: "Puma",       tagline: isFr ? "Forever Faster" : "Forever Faster" },
    { name: "New Balance",tagline: isFr ? "Fearlessly Independent" : "Fearlessly Independent" },
    { name: "Reebok",     tagline: isFr ? "Sois toi-m\u00eame" : "Be More Human" },
    { name: "Converse",   tagline: isFr ? "Cr\u00e9\u00e9 par toi" : "Made by You" },
  ];

  return (
    <div className="lg:hidden">
      <ProductScroll products={featured} title={isFr ? "Produits vedettes" : "Featured Products"}
        badge={isFr ? "VEDETTE" : "FEATURED"} badgeColor="#f59e0b"
        locale={locale} isFr={isFr} formatPrice={formatPrice} viewAllHref={`/${locale}/shop`} />

      <div className="bg-white pt-3 pb-3">
        <Link prefetch={false} href={`/${locale}/shop?onSale=1`} className="block mx-3">
          <div className="relative rounded-2xl overflow-hidden h-24 shadow-md" style={{ background: "linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%)" }}>
            <div className="absolute inset-0 flex items-center justify-between px-4 text-white">
              <div>
                <div className="text-[10px] font-black tracking-widest opacity-90">{isFr ? "GRANDE VENTE" : "MEGA SALE"}</div>
                <div className="text-xl font-black leading-tight">{isFr ? "Jusqu\u0027\u00e0 -50%" : "Up to 50% OFF"}</div>
                <div className="text-[11px] opacity-90 mt-0.5">{isFr ? "Livraison gratuite +$1000" : "Free shipping over $1000"}</div>
              </div>
              <div className="text-4xl font-black opacity-30">%</div>
            </div>
          </div>
        </Link>
      </div>

      {categories.length > 0 && (
        <div className="bg-white pt-4 pb-4 border-t-4 border-gray-100">
          <div className="px-3 mb-3">
            <span className="text-sm font-bold text-gray-900">{isFr ? "Acheter par cat\u00e9gorie" : "Shop by Category"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 px-3">
            {categories.map(cat => (
              <Link prefetch={false} key={cat.slug} href={`/${locale}/shop?category=${cat.slug}`}
                className={"relative rounded-xl overflow-hidden aspect-[4/3] shadow-sm active:scale-95 transition " + (CAT_TINTS[cat.slug] || "bg-gray-100")}>
                {cat.imageUrl && (
                  <Image src={cat.imageUrl} alt={cat.nameEn} fill sizes="(max-width: 640px) 50vw, 200px" quality={75} className="object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <div className="text-white text-xs font-black uppercase tracking-wide drop-shadow">
                    {isFr && cat.nameFr ? cat.nameFr : cat.nameEn}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <ProductScroll products={newArrivals} title={isFr ? "Nouveaut\u00e9s" : "New Arrivals"}
        badge={isFr ? "NOUVEAU" : "NEW"} badgeColor="#10b981"
        locale={locale} isFr={isFr} formatPrice={formatPrice} viewAllHref={`/${locale}/shop?sort=newest`} />

      <div className="bg-white pt-3 pb-3">
        <Link prefetch={false} href={`/${locale}/blog`} className="block mx-3">
          <div className="relative rounded-2xl overflow-hidden h-24 shadow-md bg-gradient-to-r from-gray-900 to-gray-700">
            <div className="absolute inset-0 flex items-center justify-between px-4 text-white">
              <div>
                <div className="text-[10px] font-black tracking-widest opacity-90 text-amber-300">{isFr ? "GUIDE STYLE" : "STYLE GUIDE"}</div>
                <div className="text-base font-black leading-tight">{isFr ? "Conseils d\u0027experts" : "Expert Tips"}</div>
                <div className="text-[11px] opacity-90 mt-0.5">{isFr ? "Lisez notre blog" : "Read our blog"}</div>
              </div>
              <ChevronRight className="w-8 h-8 opacity-60" />
            </div>
          </div>
        </Link>
      </div>

      <ProductGrid products={onSale} title={isFr ? "En solde" : "On Sale"}
        locale={locale} isFr={isFr} formatPrice={formatPrice}
        viewAllHref={`/${locale}/shop?onSale=1`} bgTint="bg-red-50/30" />

      <ProductScroll products={topRated} title={isFr ? "Meilleures ventes" : "Best Selling Products"}
        badge={isFr ? "TOP" : "TOP"} badgeColor="#ec4899"
        locale={locale} isFr={isFr} formatPrice={formatPrice} viewAllHref={`/${locale}/shop?sort=rating`} />

      <div className="bg-white pt-4 pb-6 border-t-4 border-gray-100">
        <div className="flex items-center justify-between px-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded bg-amber-400">
              <span className="text-gray-900 text-[10px] font-black tracking-wide">{isFr ? "MARQUES OFFICIELLES" : "OFFICIAL BRANDS"}</span>
            </div>
          </div>
          <Link prefetch={false} href={`/${locale}/shop`} className="text-xs font-semibold text-gray-500 hover:text-[#CA3F2E] flex items-center gap-0.5">
            {isFr ? "Voir tout" : "See all"}
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2 px-3">
          {brands.map((brand) => (
            <Link prefetch={false} key={brand.name} href={`/${locale}/shop?brand=${encodeURIComponent(brand.name)}`}
              className="aspect-square bg-gray-900 rounded-xl flex flex-col items-center justify-center p-2 shadow-sm active:scale-95 transition group border border-gray-800 hover:border-amber-400">
              <span className="text-white text-sm font-black text-center leading-tight tracking-wide group-hover:text-amber-400 transition">{brand.name}</span>
              <span className="text-[8px] text-gray-400 mt-1 text-center leading-tight line-clamp-1 group-hover:text-gray-300 transition">{brand.tagline}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white pt-4 pb-6">
        <Link prefetch={false} href={`/${locale}/shop`} className="block mx-3">
          <div className="relative rounded-2xl overflow-hidden p-5 shadow-md" style={{ background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)" }}>
            <div className="text-center text-white">
              <div className="text-[10px] font-black tracking-widest text-amber-400 mb-1">{isFr ? "PARCOURIR TOUT" : "BROWSE ALL"}</div>
              <div className="text-lg font-black mb-2">{isFr ? "D\u00e9couvrez notre collection compl\u00e8te" : "Explore Our Full Collection"}</div>
              <div className="inline-flex items-center gap-1 px-4 py-2 bg-white rounded-full text-xs font-bold" style={{ color: "#CA3F2E" }}>
                {isFr ? "Voir tous les produits" : "See All Products"}
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
