"use client";
import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import {
  Home,
  ShoppingBag,
  Heart,
  User,
  LayoutGrid,
  LayoutDashboard,
  Users,
  GitFork,
  Wallet,
  Settings,
  Sparkles,
} from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import { useCustomer } from "@/lib/customer-context";

export default function MobileBottomNav() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const { count: wishlistCount } = useWishlist();
  const { customer } = useCustomer();
  const isFr = locale === "fr";

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR / first render: show a FULL visible nav skeleton
  if (!mounted) {
    const skeletonItems = [
      { Icon: Home, label: isFr ? "Accueil" : "Home" },
      { Icon: LayoutGrid, label: isFr ? "Boutique" : "Shop" },
      { Icon: Heart, label: isFr ? "Favoris" : "Wishlist" },
      { Icon: ShoppingBag, label: isFr ? "Panier" : "Cart" },
      { Icon: User, label: isFr ? "Compte" : "Account" },
    ];
    return (
      <>
        <div className="lg:hidden h-16" aria-hidden="true" />
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          aria-hidden="true"
        >
          <div className="grid grid-cols-5 h-16">
            {skeletonItems.map((item, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-0.5 text-gray-600">
                <item.Icon className="w-5 h-5" strokeWidth={2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </nav>
      </>
    );
  }

  // Hide on admin, checkout, cart, or vendor pages
  if (
    pathname.includes("/admin") ||
    pathname.includes("/checkout") ||
    pathname.includes("/cart") ||
    pathname.includes("/vendor")
  ) {
    return <div className="lg:hidden h-16" aria-hidden="true" />;
  }

  // 1. AFFILIATE DASHBOARD BOTTOM NAV (Dark themed to match dashboard)
  if (pathname.includes("/affiliate/dashboard")) {
    const isOverview = pathname === "/affiliate/dashboard" || pathname === `/${locale}/affiliate/dashboard`;
    const isTeam = pathname.includes("/affiliate/dashboard/team");
    const isGenealogy = pathname.includes("/affiliate/dashboard/genealogy");
    const isPayouts = pathname.includes("/affiliate/dashboard/payouts");
    const isSettings = pathname.includes("/affiliate/dashboard/settings");

    const affItems = [
      {
        href: "/affiliate/dashboard" as const,
        icon: LayoutDashboard,
        label: isFr ? "Aper\u00e7u" : "Overview",
        active: isOverview,
      },
      {
        href: "/affiliate/dashboard/team" as const,
        icon: Users,
        label: isFr ? "\u00c9quipe" : "Team",
        active: isTeam,
      },
      {
        href: "/affiliate/dashboard/genealogy" as const,
        icon: GitFork,
        label: isFr ? "Arbre" : "Tree",
        active: isGenealogy,
      },
      {
        href: "/affiliate/dashboard/payouts" as const,
        icon: Wallet,
        label: isFr ? "Retraits" : "Payouts",
        active: isPayouts,
      },
      {
        href: "/affiliate/dashboard/settings" as const,
        icon: Settings,
        label: isFr ? "R\u00e9glages" : "Settings",
        active: isSettings,
      },
    ];

    return (
      <>
        <div className="md:hidden h-16" aria-hidden="true" />
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212] border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
          aria-label="Affiliate navigation"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="grid grid-cols-5 h-16">
            {affItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={String(item.href)}
                  href={item.href}
                  className={[
                    "relative flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 select-none",
                    item.active
                      ? "text-[#CA3F2E]"
                      : "text-gray-400 hover:text-gray-200",
                  ].join(" ")}
                >
                  {item.active && (
                    <span
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-[#CA3F2E]"
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    className={[
                      "w-5 h-5 transition-transform",
                      item.active ? "scale-110" : "",
                    ].join(" ")}
                    strokeWidth={item.active ? 2.5 : 2}
                  />
                  <span
                    className={[
                      "text-[10px] leading-none",
                      item.active ? "font-bold" : "font-semibold",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </>
    );
  }

  // 2. PUBLIC AFFILIATE PAGES (e.g. /affiliate, /affiliate/login, /affiliate/apply)
  if (pathname.includes("/affiliate")) {
    const isAffMain = pathname === "/affiliate" || pathname === `/${locale}/affiliate`;
    const isAffLogin = pathname.includes("/affiliate/login");
    const isAffApply = pathname.includes("/affiliate/apply");

    const pubAffItems = [
      {
        href: "/" as const,
        icon: Home,
        label: isFr ? "Accueil" : "Home",
        active: false,
      },
      {
        href: "/affiliate" as const,
        icon: Sparkles,
        label: isFr ? "Affili\u00e9" : "Affiliate",
        active: isAffMain,
      },
      {
        href: "/affiliate/login" as const,
        icon: User,
        label: isFr ? "Connexion" : "Login",
        active: isAffLogin,
      },
      {
        href: "/affiliate/apply" as const,
        icon: Users,
        label: isFr ? "Postuler" : "Apply",
        active: isAffApply,
      },
    ];

    return (
      <>
        <div className="lg:hidden h-16" aria-hidden="true" />
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212] border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
          aria-label="Affiliate navigation"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="grid grid-cols-4 h-16">
            {pubAffItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={String(item.href)}
                  href={item.href}
                  className={[
                    "relative flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 select-none",
                    item.active
                      ? "text-[#CA3F2E]"
                      : "text-gray-400 hover:text-gray-200",
                  ].join(" ")}
                >
                  {item.active && (
                    <span
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-[#CA3F2E]"
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    className={[
                      "w-5 h-5 transition-transform",
                      item.active ? "scale-110" : "",
                    ].join(" ")}
                    strokeWidth={item.active ? 2.5 : 2}
                  />
                  <span
                    className={[
                      "text-[10px] leading-none",
                      item.active ? "font-bold" : "font-semibold",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </>
    );
  }

  // 3. STANDARD SHOP MOBILE BOTTOM NAV
  const isHome =
    pathname === "/" ||
    pathname === `/${locale}` ||
    pathname === `/${locale}/`;
  const isShop =
    pathname.includes("/shop") && !pathname.includes("/product");
  const isWishlist = pathname.includes("/wishlist");
  const isAccount = pathname.includes("/account");

  const items = [
    {
      href: "/" as const,
      icon: Home,
      label: isFr ? "Accueil" : "Home",
      active: isHome,
      badge: null,
    },
    {
      href: "/shop" as const,
      icon: LayoutGrid,
      label: isFr ? "Boutique" : "Shop",
      active: isShop,
      badge: null,
    },
    {
      href: "/wishlist" as const,
      icon: Heart,
      label: isFr ? "Favoris" : "Wishlist",
      active: isWishlist,
      badge: wishlistCount > 0 ? wishlistCount : null,
    },
    {
      href: (customer ? "/account/dashboard" : "/account/login") as Parameters<typeof Link>[0]["href"],
      icon: User,
      label: customer
        ? isFr ? "Compte" : "Account"
        : isFr ? "Connexion" : "Login",
      active: isAccount,
      badge: null,
    },
  ];

  return (
    <>
      <div className="lg:hidden h-16" aria-hidden="true" />
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        aria-label="Bottom navigation"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="grid grid-cols-4 h-16">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={String(item.href)}
                href={item.href}
                className={[
                  "relative flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 select-none",
                  item.active
                    ? "text-[#CA3F2E]"
                    : "text-gray-500 hover:text-gray-800",
                ].join(" ")}
              >
                {item.active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-[#CA3F2E]"
                    aria-hidden="true"
                  />
                )}
                <div className="relative">
                  <Icon
                    className={[
                      "w-5 h-5 transition-transform",
                      item.active ? "scale-110" : "",
                    ].join(" ")}
                    strokeWidth={item.active ? 2.5 : 2}
                  />
                  {item.badge !== null && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-[#CA3F2E] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white leading-none">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={[
                    "text-[10px] leading-none",
                    item.active ? "font-bold" : "font-semibold",
                  ].join(" ")}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}