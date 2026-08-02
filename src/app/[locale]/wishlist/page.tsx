"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/db/schema";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/lib/wishlist-context";
import { useTranslations, useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import AccountMobileBar from "@/components/AccountMobileBar";

export default function WishlistPage() {
  const t = useTranslations("wishlist");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { customer } = useCustomer();

  const { ids, loaded } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    const vid = localStorage.getItem("solevault-visitor-id");
    if (!vid && !customer) { setLoading(false); return; }
    fetch("/api/wishlist/products?visitorId=" + (vid || ""))
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [loaded, ids.length, customer]);

  const savedLabel = loading
    ? tc("loading")
    : products.length === 1
      ? t("itemSaved")
      : t("itemsSaved", { count: products.length });

  const content = (
    <>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-500">{savedLabel}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t("empty")}</h2>
          <p className="text-gray-500 mb-6">{t("emptyDesc")}</p>
          <Link
            href={`/${locale}/shop`}
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition"
          >
            {t("browseProducts")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      <Navbar />
      {customer && <AccountSidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />}
      <main className="min-h-screen bg-gray-50 pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          {customer ? (
            <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
              <div className="hidden lg:block"><AccountSidebar /></div>
              <div>
                <AccountMobileBar title={t("title")} onOpen={() => setMenuOpen(true)} />
                {content}
              </div>
            </div>
          ) : (
            content
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}