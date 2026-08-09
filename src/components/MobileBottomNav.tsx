"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Home, Heart, User, LayoutGrid } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import { useCustomer } from "@/lib/customer-context";
import { useEffect, useState } from "react";

const BRAND_RED = "#CA3F2E";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const { count: wishlistCount } = useWishlist();
  const { customer } = useCustomer();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch - only show after mount on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Hide on admin, checkout, and cart pages
  if (
    !pathname ||
    pathname.includes("/admin") ||
    pathname.includes("/checkout") ||
    pathname.endsWith("/cart") ||
    pathname.includes(`/${locale}/cart`)
  ) {
    return null;
  }

  const localePrefix = `/${locale}`;

  // Safe pathname helpers - normalize to compare consistently
  const cleanPath = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  const isHomeActive = cleanPath === "/" || cleanPath === "";
  const isShopActive = cleanPath.startsWith("/shop") && !cleanPath.includes("/product");
  const isWishlistActive = cleanPath.startsWith("/wishlist");
  const isAccountActive = cleanPath.startsWith("/account");

  const items = [
    {
      href: `${localePrefix}`,
      icon: Home,
      label: "Home",
      active: isHomeActive,
    },
    {
      href: `${localePrefix}/shop`,
      icon: LayoutGrid,
      label: "Shop",
      active: isShopActive,
    },
    {
      href: `${localePrefix}/wishlist`,
      icon: Heart,
      label: "Wishlist",
      badge: wishlistCount > 0 ? wishlistCount : null,
      active: isWishlistActive,
    },
    {
      href: customer ? `${localePrefix}/account/dashboard` : `${localePrefix}/account/login`,
      icon: User,
      label: customer ? "Account" : "Login",
      active: isAccountActive,
    },
  ];

  return (
    <>
      {/* Spacer so content isn't hidden under fixed nav */}
      <div className="lg:hidden h-16" aria-hidden="true" />

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        aria-label="Bottom navigation"
      >
        <div className="grid grid-cols-4 h-16">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                prefetch={false}
                className={`relative flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                  item.active ? "text-[#CA3F2E]" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${item.active ? "scale-110" : ""}`}
                    strokeWidth={item.active ? 2.5 : 2}
                  />
                  {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-[#CA3F2E] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-semibold ${item.active ? "font-bold" : ""}`}>
                  {item.label}
                </span>
                {item.active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full"
                    style={{ backgroundColor: BRAND_RED }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}