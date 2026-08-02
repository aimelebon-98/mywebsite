"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import { LayoutDashboard, Package, Heart, MapPin, User, LogOut } from "lucide-react";

export default function AccountSidebar() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const pathname = usePathname();
  const { logout } = useCustomer();

  const items = [
    { href: `/${locale}/account/dashboard`, icon: LayoutDashboard, label: isFr ? "Tableau de bord" : "Dashboard" },
    { href: `/${locale}/account/orders`,    icon: Package,         label: isFr ? "Mes commandes" : "My Orders" },
    { href: `/${locale}/wishlist`,          icon: Heart,           label: isFr ? "Favoris" : "Wishlist" },
    { href: `/${locale}/account/addresses`, icon: MapPin,          label: isFr ? "Adresses" : "Addresses" },
    { href: `/${locale}/account/profile`,   icon: User,            label: isFr ? "Profil" : "Profile" },
  ];

  return (
    <div className="lg:sticky lg:top-28 space-y-1">
      {items.map(item => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              active
                ? "bg-[#CA3F2E] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={logout}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
      >
        <LogOut className="w-4 h-4" />
        {isFr ? "Se d\u00e9connecter" : "Log out"}
      </button>
    </div>
  );
}
