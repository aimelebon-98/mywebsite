"use client";
import CurrencySelector from "./CurrencySelector";
import { useCurrency } from "@/lib/currency-context";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { ShoppingBag, Menu, X, Heart, Globe, User, LogIn } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useCustomer } from "@/lib/customer-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useState } from "react";
import SearchAutocomplete from "@/components/SearchAutocomplete";

const BRAND_RED = "#CA3F2E";
const BRAND_RED_DARK = "#8B2A1E";

export default function Navbar() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openDrawer } = useCart();
  const { customer } = useCustomer();
  const { format: fmtPrice } = useCurrency();
  const isFr = locale === "fr";
  const { count: wishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Apply brand red styling to all pages EXCEPT homepage
  const isHomepage = pathname === "/" || pathname === "";
  const isBlogPage = !isHomepage;

  const switchLocale = async (nextLocale: "en" | "fr") => {
    setLangOpen(false);

    // Read TRUE current path from browser (not next-intl cache)
    const currentPath = typeof window !== "undefined" ? window.location.pathname : pathname;
    const withoutLocale = currentPath.replace(/^\/(en|fr)(?=\/|$)/, "") || "/";

    // Handle product pages
    const productMatch = withoutLocale.match(/^\/product\/([^/?]+)\/?$/);
    if (productMatch) {
      const currentSlug = productMatch[1];
      try {
        const res = await fetch(`/api/products/${currentSlug}`);
        if (res.ok) {
          const product = await res.json();
          let targetSlug = currentSlug;
          if (nextLocale === "fr" && product.slugFr) targetSlug = product.slugFr;
          else if (nextLocale === "en" && product.slug) targetSlug = product.slug;
          window.location.href = `/${nextLocale}/product/${targetSlug}`;
          return;
        }
      } catch { /* ignore */ }
    }

    // Handle blog pages
    const blogPostMatch = withoutLocale.match(/^\/blog\/([^/?]+)\/?$/);
    if (blogPostMatch) {
      const currentSlug = blogPostMatch[1];
      try {
        const res = await fetch(`/api/blog/${currentSlug}`);
        if (res.ok) {
          const post = await res.json();
          let targetSlug = currentSlug;
          if (nextLocale === "fr" && post.slugFr) targetSlug = post.slugFr;
          else if (nextLocale === "en" && post.slug) targetSlug = post.slug;
          window.location.href = `/${nextLocale}/blog/${targetSlug}`;
          return;
        }
      } catch { /* ignore */ }
    }

    // Default: use next-intl router for regular pages
    router.replace(pathname, { locale: nextLocale });
  };

  // Dynamic classes based on isBlogPage
  const navBg = isBlogPage ? "" : "bg-white/80 border-gray-100";
  const navStyle = isBlogPage ? { backgroundColor: BRAND_RED } : undefined;

  const bannerBg = isBlogPage ? "text-white" : "bg-gray-900 text-white";
  const bannerStyle = isBlogPage ? { backgroundColor: BRAND_RED_DARK } : undefined;

  const logoText = isBlogPage ? "text-white" : "";
  const linkClass = isBlogPage
    ? "text-sm font-medium text-white/90 hover:text-white transition"
    : "text-sm font-medium text-gray-600 hover:text-gray-900 transition";

  const iconColor = isBlogPage ? "text-white" : "text-gray-600";
  const iconHoverBg = isBlogPage ? "hover:bg-white/10" : "hover:bg-gray-100";
  const localeText = isBlogPage ? "text-white" : "text-gray-700";
  const heartClass = isBlogPage
    ? wishlistCount > 0 ? "text-white fill-white" : "text-white"
    : wishlistCount > 0 ? "text-gray-900 fill-gray-900" : "text-gray-600";

  const badgeBg = isBlogPage
    ? "bg-white text-gray-900"
    : "bg-gray-900 text-white";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors ${navBg} ${isBlogPage ? "border-transparent" : ""}`}
      style={navStyle}
    >
      <div className={`text-center py-2 text-xs font-medium tracking-wide ${bannerBg}`} style={bannerStyle}>
        <span>{isFr ? `LIVRAISON GRATUITE pour les commandes de plus de ${fmtPrice(1000)}` : `FREE SHIPPING on orders over ${fmtPrice(1000)}`}</span> - <Link href="/shop" className="underline underline-offset-2">{t("shopNow")}</Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16 gap-4">
          <Link href="/" className="group flex items-center gap-2.5 flex-shrink-0">
            {/* Brand icon - stylized N monogram */}
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-lg transition-all group-hover:scale-105"
                 style={{ background: "linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%)" }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12.5 2H4a2 2 0 00-2 2v8.5a2 2 0 00.59 1.41l8.5 8.5a2 2 0 002.82 0l8.5-8.5a2 2 0 000-2.82L13.91 2.59A2 2 0 0012.5 2z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
                <circle cx="7.5" cy="7.5" r="1.6" fill="#CA3F2E"/>
              </svg>
              <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Brand wordmark - two weights + subtle underline */}
            <div className={`hidden sm:flex items-baseline gap-1.5 text-[19px] font-black tracking-tight leading-none ${logoText}`}>
              <span>NewDeal</span>
              <span className={isBlogPage ? "text-white/40 font-light text-[15px]" : "text-gray-300 font-light text-[15px]"}>|</span>
              <span className={`tracking-widest text-[15px] ${isBlogPage ? "text-white/85" : "text-[#CA3F2E]"}`}>ZONE</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-5">
            <Link href="/" className={linkClass}>{t("home")}</Link>
            <Link href="/shop" className={linkClass}>{t("shopAll")}</Link>
            <Link
              href="/blog"
              className={isBlogPage ? "text-sm font-bold text-white transition" : linkClass}
            >
              Blog
            </Link>
            <Link href="/about" className={linkClass}>{t("about")}</Link>
            <Link href="/contact" className={linkClass}>{t("contact")}</Link>
            <Link href="/faq" className={linkClass}>{t("faq")}</Link>
          </div>

          <div className="group flex items-center gap-2.5 flex-shrink-0">
            <div className="hidden md:block">
              <SearchAutocomplete
                placeholder={tCommon("search")}
                className="w-48 lg:w-56"
                inputClassName={`w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 transition placeholder-gray-400 ${
                  isBlogPage
                    ? "bg-white/20 text-white placeholder-white/60 focus:bg-white focus:text-gray-900 focus:ring-white"
                    : "bg-gray-100 focus:ring-gray-900 focus:bg-white"
                }`}
              />
            </div>

            <CurrencySelector compact={isBlogPage} dark={isBlogPage} />

            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                aria-label="Change language"
                className={`flex items-center gap-1 p-2 rounded-xl transition ${iconHoverBg}`}
              >
              <Globe className={`w-5 h-5 ${iconColor}`} />
                <span className={`text-xs font-bold uppercase ${localeText}`}>{locale}</span>
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <button
                      onClick={() => switchLocale("en")}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition flex items-center gap-2 ${locale === "en" ? "font-bold bg-gray-50" : ""}`}
                    >
                      <svg width="20" height="14" viewBox="0 0 60 42" xmlns="http://www.w3.org/2000/svg" className="rounded-sm flex-shrink-0"><rect width="60" height="42" fill="#B22234"/><rect y="3.23" width="60" height="3.23" fill="#fff"/><rect y="9.69" width="60" height="3.23" fill="#fff"/><rect y="16.15" width="60" height="3.23" fill="#fff"/><rect y="22.62" width="60" height="3.23" fill="#fff"/><rect y="29.08" width="60" height="3.23" fill="#fff"/><rect y="35.54" width="60" height="3.23" fill="#fff"/><rect width="24" height="22.62" fill="#3C3B6E"/></svg> English
                    </button>
                    <button
                      onClick={() => switchLocale("fr")}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition flex items-center gap-2 ${locale === "fr" ? "font-bold bg-gray-50" : ""}`}
                    >
                      <svg width="20" height="14" viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg" className="rounded-sm flex-shrink-0"><rect width="1" height="2" x="0" fill="#0055A4"/><rect width="1" height="2" x="1" fill="#fff"/><rect width="1" height="2" x="2" fill="#EF4135"/></svg> Francais
                    </button>
                  </div>
                </>
              )}
            </div>

            {customer ? (
              <Link href="/account/dashboard" aria-label="Account" className={`relative p-2 rounded-xl transition ${iconHoverBg}`}>
                <User className={`w-5 h-5 ${iconColor}`} />
              </Link>
            ) : (
              <Link href="/account/login" aria-label="Login" className={`relative p-2 rounded-xl transition ${iconHoverBg}`}>
                <LogIn className={`w-5 h-5 ${iconColor}`} />
              </Link>
            )}

            <Link href="/wishlist" aria-label={t("wishlist")} className={`relative p-2 rounded-xl transition ${iconHoverBg}`}>
              <Heart className={`w-5 h-5 ${heartClass}`} />
              {wishlistCount > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center ${badgeBg}`}>
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={openDrawer}
              aria-label={t("cart")}
              className={`relative p-2 rounded-xl transition ${iconHoverBg}`}
            >
              <ShoppingBag className={`w-5 h-5 ${iconColor}`} />
              {totalItems > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center ${badgeBg}`}>
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            <button onClick={() => setMenuOpen(!menuOpen)} className={`lg:hidden p-2 rounded-xl transition ${iconHoverBg}`}>
              {menuOpen ? <X className={`w-5 h-5 ${iconColor}`} /> : <Menu className={`w-5 h-5 ${iconColor}`} />}
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
              { href: "/blog", label: "Blog" },
              { href: "/about", label: t("about") },
              { href: "/contact", label: t("contact") },
              { href: "/faq", label: t("faq") },
              { href: "/wishlist", label: `${t("wishlist")}${wishlistCount > 0 ? ` (${wishlistCount})` : ""}` },
              { href: "/cart", label: t("cart") },
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
