"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import { LayoutDashboard, Package, Heart, MapPin, User, LogOut, LifeBuoy, Gift, Star, Settings, Shield } from "lucide-react";

export default function AccountSidebar() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const pathname = usePathname();
  const { logout, customer } = useCustomer();

  const items = [
    { href: `/${locale}/account/dashboard`,   icon: LayoutDashboard, label: isFr ? "Tableau de bord" : "Dashboard" },
    { href: `/${locale}/account/orders`,      icon: Package,         label: isFr ? "Mes commandes"   : "My Orders" },
    { href: `/${locale}/account/tickets`,     icon: LifeBuoy,        label: isFr ? "Support"         : "Support" },
    { href: `/${locale}/wishlist`,            icon: Heart,           label: isFr ? "Favoris"         : "Wishlist" },
    { href: `/${locale}/account/reviews`,     icon: Star,            label: isFr ? "Mes avis"        : "My Reviews" },
    { href: `/${locale}/account/rewards`,     icon: Gift,            label: isFr ? "R\u00e9compenses" : "Rewards" },
    { href: `/${locale}/account/addresses`,   icon: MapPin,          label: isFr ? "Adresses"        : "Addresses" },
    { href: `/${locale}/account/profile`,     icon: User,            label: isFr ? "Profil"          : "Profile" },
    { href: `/${locale}/account/preferences`, icon: Settings,        label: isFr ? "Pr\u00e9f\u00e9rences" : "Preferences" },
    { href: `/${locale}/account/security`,    icon: Shield,          label: isFr ? "S\u00e9curit\u00e9" : "Security" },
  ];

  return (
    <div className="lg:sticky lg:top-28 space-y-1">
      {customer && (
        <div className="px-4 py-3 mb-2 bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] rounded-xl text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
              {customer.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{customer.name}</div>
              <div className="text-[10px] opacity-80 truncate">{customer.email}</div>
            </div>
          </div>
        </div>
      )}

      {items.map(item => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={"flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition " + (active ? "bg-[#CA3F2E] text-white" : "text-gray-600 hover:bg-gray-100")}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}

      <div className="pt-2 mt-2 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4" />
          {isFr ? "Se d\u00e9connecter" : "Log out"}
        </button>
      </div>
    </div>
  );
}