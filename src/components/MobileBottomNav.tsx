"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { Home, ShoppingBag, Heart, User, LayoutGrid } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import { useCustomer } from "@/lib/customer-context";

export default function MobileBottomNav() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const { count: wishlistCount } = useWishlist();
  const { customer } = useCustomer();

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR / first render: show a FULL visible nav skeleton (no wishlist badge, no active state)
  // This prevents the "empty white bar" flash and zero-CLS on mobile page loads.
  if (!mounted) {
    const skeletonItems = [
      { Icon: Home, label: locale === "fr" ? "Accueil" : "Home" },
      { Icon: LayoutGrid, label: locale === "fr" ? "Boutique" : "Shop" },
      { Icon: Heart, label: locale === "fr" ? "Favoris" : "Wishlist" },
      { Icon: ShoppingBag, label: locale === "fr" ? "Panier" : "Cart" },
      { Icon: User, label: locale === "fr" ? "Compte" : "Account" },
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

  // Hide on admin, checkout, cart pages
  if (
    pathname.includes("/admin") ||
    pathname.includes("/checkout") ||
    pathname.includes("/cart")
  ) {
    return <div className="lg:hidden h-16" aria-hidden="true" />;
  }

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
      label: locale === "fr" ? "Accueil" : "Home",
      active: isHome,
      badge: null,
    },
    {
      href: "/shop" as const,
      icon: LayoutGrid,
      label: locale === "fr" ? "Boutique" : "Shop",
      active: isShop,
      badge: null,
    },
    {
      href: "/wishlist" as const,
      icon: Heart,
      label: locale === "fr" ? "Favoris" : "Wishlist",
      active: isWishlist,
      badge: wishlistCount > 0 ? wishlistCount : null,
    },
    {
      href: (customer ? "/account/dashboard" : "/account/login") as Parameters<typeof Link>[0]["href"],
      icon: User,
      label: customer
        ? locale === "fr" ? "Compte" : "Account"
        : locale === "fr" ? "Connexion" : "Login",
      active: isAccount,
      badge: null,
    },
  ];

  return (
    <>
      {/* Spacer so page content is not hidden behind the fixed bar */}
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
                {/* Active indicator bar at top */}
                {item.active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-[#CA3F2E]"
                    aria-hidden="true"
                  />
                )}

                {/* Icon + badge */}
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

                {/* Label */}
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