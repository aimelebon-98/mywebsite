"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { ShoppingBag, Menu, X, Heart, Globe } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useState } from "react";
import SearchAutocomplete from "@/components/SearchAutocomplete";

export default function Navbar() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const switchLocale = (nextLocale: "en" | "fr") => {
    router.replace(pathname, { locale: nextLocale });
    setLangOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="bg-gray-900 text-white text-center py-2 text-xs font-medium tracking-wide">
        {t("freeShipping")} <Link href="/shop" className="underline underline-offset-2">{t("shopNow")}</Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">SV</span>
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:block">SoleVault</span>
          </Link>

          <div className="hidden lg:flex items-center gap-5">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">{t("home")}</Link>
            <Link href="/shop" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">{t("shopAll")}</Link>
            <Link href="/shop?category=sneakers" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">{t("sneakers")}</Link>
            <Link href="/shop?category=running" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">{t("running")}</Link>
            <Link href="/shop?category=formal" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">{t("formal")}</Link>
            <Link href="/shop?category=boots" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">{t("boots")}</Link>
            <Link href="/shop?category=casual" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">{t("casual")}</Link>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden md:block">
              <SearchAutocomplete
                placeholder={tCommon("search")}
                className="w-48 lg:w-56"
                inputClassName="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition placeholder-gray-400"
              />
            </div>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                aria-label="Change language"
                className="flex items-center gap-1 p-2 rounded-xl hover:bg-gray-100 transition"
              >
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="text-xs font-bold uppercase text-gray-700">{locale}</span>
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <button
                      onClick={() => switchLocale("en")}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition ${locale === "en" ? "font-bold bg-gray-50" : ""}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => switchLocale("fr")}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition ${locale === "fr" ? "font-bold bg-gray-50" : ""}`}
                    >
                      Francais
                    </button>
                  </div>
                </>
              )}
            </div>

            <Link href="/wishlist" aria-label={t("wishlist")} className="relative p-2 rounded-xl hover:bg-gray-100 transition">
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? "text-red-500 fill-red-500" : "text-gray-600"}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={openDrawer}
              aria-label={t("cart")}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition"
            >
              <ShoppingBag className="w-5 h-5 text-gray-600" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-slide-in shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <div className="mb-2">
              <SearchAutocomplete
                placeholder={tCommon("search")}
                inputClassName="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                iconClassName="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              />
            </div>
            {[
              { href: "/", label: t("home") },
              { href: "/shop", label: t("shopAll") },
              { href: "/shop?category=sneakers", label: t("sneakers") },
              { href: "/shop?category=running", label: t("running") },
              { href: "/shop?category=formal", label: t("formal") },
              { href: "/shop?category=boots", label: t("boots") },
              { href: "/shop?category=sandals", label: t("sandals") },
              { href: "/shop?category=casual", label: t("casual") },
              { href: "/wishlist", label: `${t("wishlist")}${wishlistCount > 0 ? ` (${wishlistCount})` : ""}` },
              { href: "/cart", label: t("cart") },
              { href: "/faq", label: t("faq") },
            ].map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
