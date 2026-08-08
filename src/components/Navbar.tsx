"use client";
import CurrencySelector from "./CurrencySelector";
import { useCurrency } from "@/lib/currency-context";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { ShoppingBag, Menu, X, Heart, Globe, LogIn, LogOut, LayoutDashboard, UserPlus } from "lucide-react";
import { useCustomer } from "@/lib/customer-context";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useState, useEffect, useRef } from "react";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import dynamic from "next/dynamic";
const AccountHoverMenu = dynamic(() => import("@/components/AccountHoverMenu"));
const ShopMegaMenu = dynamic(() => import("@/components/ShopMegaMenu"));

const BRAND_RED = "#CA3F2E";
const BRAND_RED_DARK = "#8B2A1E";

export default function Navbar() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openDrawer } = useCart();
  const { format: fmtPrice } = useCurrency();
  const isFr = locale === "fr";
  const { count: wishlistCount } = useWishlist();
  const { customer, logout } = useCustomer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  // Detect scroll for shrink effect (with hysteresis to prevent bounce)
  useEffect(() => {
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setScrolled((prev) => {
          const y = window.scrollY;
          // Hysteresis: shrink at 100px, only grow back below 40px
          // This dead zone prevents flip-flop bounce at the threshold
          if (!prev && y > 100) return true;
          if (prev && y < 40) return false;
          return prev;
        });
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Publish navbar bottom position for mega menu to use
  useEffect(() => {
    const update = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        document.documentElement.style.setProperty("--navbar-bottom", `${rect.bottom}px`);
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    if (navRef.current) observer.observe(navRef.current);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, []);

  // Detect Mac for keyboard shortcut display
  useEffect(() => {
    setIsMac(typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform));
  }, []);

  // Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const input = searchInputRef.current?.querySelector("input");
        if (input) input.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const scheduleMegaClose = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    megaCloseTimer.current = setTimeout(() => setMegaOpen(false), 150);
  };
  const cancelMegaClose = () => {
    if (megaCloseTimer.current) { clearTimeout(megaCloseTimer.current); megaCloseTimer.current = null; }
  };

  const isHomepage = pathname === "/" || pathname === "";
  const isBlogPage = !isHomepage;

  const switchLocale = async (nextLocale: "en" | "fr") => {
    setLangOpen(false);

    const currentPath = typeof window !== "undefined" ? window.location.pathname : pathname;
    const withoutLocale = currentPath.replace(/^\/(en|fr)(?=\/|$)/, "") || "/";

    const productMatch = withoutLocale.match(/^\/product\/([^/?]+)\/?$/);
    if (productMatch) {
      const currentSlug = productMatch[1];
      try {
        const res = await fetch(`/api/products/${currentSlug}`).catch(() => null);
        if (res && res.ok) {
          const product = await res.json();
          let targetSlug = currentSlug;
          if (nextLocale === "fr" && product.slugFr) targetSlug = product.slugFr;
          else if (nextLocale === "en" && product.slug) targetSlug = product.slug;
          window.location.href = `/${nextLocale}/product/${targetSlug}`;
          return;
        }
      } catch {}
    }

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
      } catch {}
    }

    router.replace(pathname, { locale: nextLocale });
  };

  const navBg = isHomepage
    ? "bg-black lg:bg-black/60 lg:backdrop-blur-md border-transparent"
    : (isBlogPage
      ? "border-transparent"
      : "bg-black lg:bg-white border-transparent lg:border-gray-100");

  const navStyle = isHomepage
    ? undefined
    : (isBlogPage ? { backgroundColor: BRAND_RED } : undefined);

  const bannerBg = isBlogPage ? "text-white" : "bg-gray-900 text-white";
  const bannerStyle = isBlogPage ? { backgroundColor: BRAND_RED_DARK } : undefined;

  const logoText = (isHomepage || isBlogPage) ? "text-white" : "text-white lg:text-gray-900";
  const linkClass = (isHomepage || isBlogPage)
    ? "text-sm font-medium text-white/90 hover:text-white transition whitespace-nowrap"
    : "text-sm font-medium text-gray-600 hover:text-gray-900 transition whitespace-nowrap";

  const iconColor = (isHomepage || isBlogPage) ? "text-white" : "text-white lg:text-gray-600";
  const iconHoverBg = (isHomepage || isBlogPage) ? "hover:bg-white/10" : "hover:bg-white/10 lg:hover:bg-gray-100";
  const localeText = (isHomepage || isBlogPage) ? "text-white" : "text-white lg:text-gray-700";
  const heartClass = (isHomepage || isBlogPage)
    ? wishlistCount > 0 ? "text-white fill-white" : "text-white"
    : wishlistCount > 0
        ? "text-white fill-white lg:text-gray-900 lg:fill-gray-900"
        : "text-white lg:text-gray-600";

  const badgeBg = (isHomepage || isBlogPage)
    ? "bg-white text-gray-900"
    : "bg-white text-gray-900 lg:bg-gray-900 lg:text-white";

  return (
    <nav
      ref={navRef}
      data-site-navbar="true"
      className={`sticky top-0 left-0 right-0 z-50 border-b transition-colors ${navBg} ${isBlogPage ? "border-transparent" : ""}`}
      style={navStyle}
    >
      <div className={`text-center py-2 text-xs font-medium tracking-wide ${bannerBg}`} style={bannerStyle}>
        <span>{isFr ? `LIVRAISON GRATUITE pour les commandes de plus de ${fmtPrice(1000)}` : `FREE SHIPPING on orders over ${fmtPrice(1000)}`}</span> - <Link href="/shop" className="underline underline-offset-2">{t("shopNow")}</Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={"flex items-center justify-between gap-4 transition-all duration-300 " + (scrolled ? "h-12 lg:h-14" : "h-14 lg:h-16")}>
          <Link href="/" className="group flex items-center gap-2.5 flex-shrink-0">
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-lg transition-all group-hover:scale-105"
                 style={{ background: "linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%)" }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12.5 2H4a2 2 0 00-2 2v8.5a2 2 0 00.59 1.41l8.5 8.5a2 2 0 002.82 0l8.5-8.5a2 2 0 000-2.82L13.91 2.59A2 2 0 0012.5 2z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
                <circle cx="7.5" cy="7.5" r="1.6" fill="#CA3F2E"/>
              </svg>
              <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className={`hidden sm:flex items-baseline gap-1.5 text-[19px] font-black tracking-tight leading-none ${logoText}`}>
              <span>NewDeal</span>
              <span className={(isHomepage || isBlogPage) ? "text-white/40 font-light text-[15px]" : "text-white/40 lg:text-gray-300 font-light text-[15px]"}>|</span>
              <span className={`tracking-widest text-[15px] ${(isHomepage || isBlogPage) ? "text-white/85" : "text-white/85 lg:text-[#CA3F2E]"}`}>ZONE</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/" className={linkClass}>{t("home")}</Link>
            <div
              className="relative"
              onMouseEnter={() => { cancelMegaClose(); setMegaOpen(true); }}
              onMouseLeave={scheduleMegaClose}
            >
              <Link href="/shop" className={linkClass + " inline-flex items-center gap-1"}>
                {t("shopAll")}
                <svg className={"w-3 h-3 transition-transform " + (megaOpen ? "rotate-180" : "")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </Link>
              {megaOpen && (
                <div onMouseEnter={cancelMegaClose} onMouseLeave={scheduleMegaClose}>
                  <ShopMegaMenu onClose={() => setMegaOpen(false)} />
                </div>
              )}
            </div>
            <Link
              href="/blog"
              className={(isHomepage || isBlogPage) ? "text-sm font-bold text-white/90 hover:text-white transition whitespace-nowrap" : linkClass}
            >
              Blog
            </Link>
            <Link href="/about" className={linkClass}>{t("about")}</Link>
            <Link href="/contact" className={linkClass}>{t("contact")}</Link>
            <Link href="/faq" className={linkClass}>{t("faq")}</Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
            <div className="hidden md:block relative" ref={searchInputRef}>
              <SearchAutocomplete
                placeholder={tCommon("search")}
                className="w-56 lg:w-80"
                inputClassName={`w-full pl-9 pr-14 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition placeholder-gray-400 shadow-inner ${
                  (isHomepage || isBlogPage)
                    ? "bg-white/20 text-white placeholder-white/60 focus:bg-white focus:text-gray-900 focus:ring-white"
                    : "bg-gray-100 focus:ring-gray-900 focus:bg-white border border-gray-200/50"
                }`}
              />
              <kbd className={`absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[10px] font-semibold pointer-events-none ${
                (isHomepage || isBlogPage)
                  ? "border-white/30 text-white/70 bg-white/10"
                  : "border-gray-300 text-gray-500 bg-white"
              }`}>
                {isMac ? "\u2318" : "Ctrl"}<span>K</span>
              </kbd>
            </div>

            {(isHomepage || isBlogPage) ? (
              <CurrencySelector compact={true} dark={true} />
            ) : (
              <div className="[&_button>span]:!text-white lg:[&_button>span]:!text-inherit [&_button>svg]:!text-white lg:[&_button>svg]:!text-inherit [&_button]:hover:!bg-white/10 lg:[&_button]:hover:!bg-inherit">
                <CurrencySelector compact={isBlogPage} dark={isBlogPage} />
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                aria-label="Change language"
                className={`flex items-center gap-1 p-1.5 sm:p-2 rounded-xl transition ${iconHoverBg}`}
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
                      <svg width="20" height="14" viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg" className="rounded-sm flex-shrink-0"><rect width="1" height="2" x="0" fill="#0055A4"/><rect width="1" height="2" x="1" fill="#fff"/><rect width="1" height="2" x="2" fill="#EF4135"/></svg> Fran&#231;ais
                    </button>
                  </div>
                </>
              )}
            </div>

            <AccountHoverMenu iconColor={iconColor} iconHoverBg={iconHoverBg} />

            <Link href="/wishlist" aria-label={t("wishlist")} className={`relative p-1.5 sm:p-2 rounded-xl transition ${iconHoverBg}`}>
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
              className={`relative p-1.5 sm:p-2 rounded-xl transition ${iconHoverBg}`}
            >
              <ShoppingBag className={`w-5 h-5 ${iconColor}`} />
              {totalItems > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center ${badgeBg}`}>
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className={`lg:hidden p-1.5 sm:p-2 rounded-xl transition ${iconHoverBg}`}
            >
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
                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                {item.label}
              </Link>
            ))}

            {/* Auth section */}
            <div className="pt-2 mt-2 border-t border-gray-100 space-y-1">
              {customer ? (
                <>
                  <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {isFr ? "Connect\u00e9 en tant que" : "Signed in as"}
                  </div>
                  <div className="px-4 pb-2 text-sm font-semibold text-gray-900 truncate">
                    {customer.name || customer.email}
                  </div>
                  <Link
                    href="/account/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gray-500" />
                    {isFr ? "Tableau de bord" : "Dashboard"}
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    {isFr ? "Se d\u00e9connecter" : "Log out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/account/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <LogIn className="w-4 h-4 text-gray-500" />
                    {isFr ? "Connexion" : "Login"}
                  </Link>
                  <Link
                    href="/account/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#CA3F2E] hover:bg-red-50 transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isFr ? "S\u0027inscrire" : "Sign up"}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
