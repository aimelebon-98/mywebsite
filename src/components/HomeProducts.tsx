"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/db/schema";
import ProductCard from "./ProductCard";
import ProductScroller from "./ProductScroller";
import CountdownTimer from "./CountdownTimer";
import ReviewsSection from "./ReviewsSection";
import RecentlyViewed from "./RecentlyViewed";
import SeedButton from "./SeedButton";
import Link from "next/link";
import ProductImage from "./ProductImage";
import { ArrowRight, Flame, Sparkles, Clock, Zap, TrendingUp, Tag } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

// Localize a product based on locale
function localize(p: Product, isFr: boolean): Product {
  if (!isFr) return p;
  return {
    ...p,
    name: p.nameFr || p.name,
    description: p.descriptionFr || p.description,
    shortDescription: p.shortDescriptionFr || p.shortDescription,
    longDescription: p.longDescriptionFr || p.longDescription,
    tags: p.tagsFr || p.tags,
  };
}

export default function HomeProducts() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isFr = locale === "fr";

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = isFr ? "/api/products?locale=fr" : "/api/products";
    fetch(url)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setAllProducts(data.map(p => localize(p, isFr)));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isFr]);

  const hasTags = (p: Product, tag: string) => (p.tags || "").includes(tag);
  const hotDeals    = allProducts.filter(p => hasTags(p, "hot-deal")).slice(0, 8);
  const featured    = allProducts.filter(p => p.featured).slice(0, 8);
  const newArrivals = allProducts.filter(p => hasTags(p, "new-arrival")).slice(0, 8);
  const onSale      = allProducts.filter(p => p.comparePrice).slice(0, 8);
  const topRated    = allProducts.filter(p => parseFloat(p.rating ?? "0") > 4.5).sort((a, b) => parseFloat(b.rating ?? "0") - parseFloat(a.rating ?? "0")).slice(0, 8);
  const limitedTime = allProducts.filter(p => hasTags(p, "limited")).slice(0, 6);
  const hasProducts = allProducts.length > 0;

  if (loading) {
    return (
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-2xl mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-5 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Setup prompt (only shown when English has no products - means DB is empty)
  if (!hasProducts && !isFr) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 lg:p-12 text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl font-bold">SV</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">{t("setupTitle")}</h3>
            <p className="text-gray-500 mb-2 max-w-md mx-auto">{t("setupDesc")}</p>
            <p className="text-xs text-gray-400 mb-8">{t("setupNote")}</p>
            <div className="flex justify-center gap-4 flex-wrap items-start">
              <SeedButton />
              <Link href={`/${locale}/admin`} className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:border-gray-900 transition bg-white">
                {t("goToAdmin")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // French empty state - clean, informative
  if (!hasProducts && isFr) {
    return (
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-10 lg:p-14 text-center border border-blue-100">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Bientot disponible en francais</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Nos produits sont en cours de traduction. Consultez notre boutique en anglais en attendant.
            </p>
            <Link
              href="/en"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition"
            >
              Voir la boutique en anglais <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* HOT DEALS */}
      {hotDeals.length > 0 && (
        <section className="py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <Flame className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold">{t("hotDeals")}</h2>
                  <p className="text-gray-500 text-sm">{t("hotDealsDesc")}</p>
                </div>
              </div>
              <Link href={`/${locale}/shop`} className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-700 hover:gap-2 transition-all">
                {t("viewAll")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductScroller products={hotDeals} badge="HOT" />
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="py-14 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold">{t("featuredProducts")}</h2>
                  <p className="text-gray-500 text-sm">{t("featuredProductsDesc")}</p>
                </div>
              </div>
              <Link href={`/${locale}/shop`} className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-700 hover:gap-2 transition-all">
                {t("viewAll")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LIMITED TIME OFFER */}
      {limitedTime.length > 0 && (
        <section className="py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white">
              <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="absolute inset-0 animate-shimmer pointer-events-none" />
              <div className="relative px-6 py-10 lg:px-12 lg:py-14">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-pink-400" />
                      <span className="text-sm font-semibold text-pink-300 uppercase tracking-wider">{t("limitedTimeOffer")}</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold mb-2">{t("flashSale")}</h2>
                    <p className="text-purple-200">{t("flashSaleDesc")}</p>
                  </div>
                  <CountdownTimer />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {limitedTime.map((product) => (
                    <Link key={product.id} href={`/${locale}/product/${product.slug || product.id}`} className="group bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition">
                      <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-white/5">
                        <ProductImage src={product.imageUrl || ""} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <p className="text-xs font-semibold text-white truncate">{product.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-sm font-bold text-white">${parseFloat(product.price).toFixed(2)}</span>
                        {product.comparePrice && (
                          <span className="text-xs text-purple-300 line-through">${parseFloat(product.comparePrice).toFixed(2)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="py-14 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold">{t("newArrivals")}</h2>
                  <p className="text-gray-500 text-sm">{t("newArrivalsDesc")}</p>
                </div>
              </div>
              <Link href={`/${locale}/shop`} className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-700 hover:gap-2 transition-all">
                {t("viewAll")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductScroller products={newArrivals} badge="NEW" />
          </div>
        </section>
      )}

      {/* ON SALE NOW */}
      {onSale.length > 0 && (
        <section className="py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold">{t("onSaleNow")}</h2>
                  <p className="text-gray-500 text-sm">{t("onSaleNowDesc")}</p>
                </div>
              </div>
              <Link href={`/${locale}/shop`} className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-700 hover:gap-2 transition-all">
                {t("viewAll")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductScroller products={onSale} badge="SALE" />
          </div>
        </section>
      )}

      {/* TOP RATED */}
      {topRated.length > 0 && (
        <section className="py-14 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold">{t("topRatedSection")}</h2>
                  <p className="text-gray-500 text-sm">{t("topRatedSectionDesc")}</p>
                </div>
              </div>
              <Link href={`/${locale}/shop`} className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-700 hover:gap-2 transition-all">
                {t("viewAll")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {topRated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* REVIEWS */}
      <ReviewsSection />

      {/* RECENTLY VIEWED */}
      <RecentlyViewed />

      {/* CTA BANNER */}
      <section className="py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 text-white p-10 lg:p-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">{t("ctaTitle")}</h2>
                <p className="text-gray-300 mb-8 text-lg">{t("ctaDesc")}</p>
                <div className="flex flex-wrap gap-4">
                  <Link href={`/${locale}/shop`} className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold hover:bg-gray-100 transition">
                    {t("ctaShopNow")} <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href={`/${locale}/cart`} className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-2xl font-semibold border border-white/20 hover:bg-white/20 transition">
                    {t("ctaViewCart")}
                  </Link>
                </div>
              </div>
              {allProducts.length >= 4 && (
                <div className="hidden lg:flex justify-center">
                  <div className="grid grid-cols-2 gap-3">
                    {allProducts.slice(0, 4).map((p, i) => (
                      <div key={p.id} className={`w-36 h-36 rounded-2xl overflow-hidden bg-gray-700 ${i % 2 === 1 ? "translate-y-6" : ""}`}>
                        <ProductImage src={p.imageUrl || ""} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
