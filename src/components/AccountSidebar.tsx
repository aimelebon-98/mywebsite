"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import { LayoutDashboard, Package, Heart, MapPin, User, LogOut, LifeBuoy, Gift, Star, Settings, Shield, Store, X } from "lucide-react";
import { useEffect } from "react";

interface Props {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function AccountSidebar({ mobileOpen = false, onClose }: Props) {
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

  // Close on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && onClose) onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [mobileOpen, onClose]);

  const sidebarContent = (
    <>
      {customer && (
        <div className="px-4 py-3 mb-3 bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] rounded-xl text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {customer.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{customer.name}</div>
              <div className="text-[10px] opacity-80 truncate">{customer.email}</div>
            </div>
          </div>
        </div>
      )}

      <nav className="space-y-1">
        {items.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={"flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition " + (active ? "bg-[#CA3F2E] text-white shadow-sm" : "text-gray-700 hover:bg-gray-100")}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-3 mt-3 border-t border-gray-200 space-y-1">
        <Link
          href={`/${locale}/shop`}
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
        >
          <Store className="w-4 h-4" />
          {isFr ? "Retour \u00e0 la boutique" : "Back to store"}
        </Link>
        <button
          onClick={() => { if (onClose) onClose(); logout(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4" />
          {isFr ? "Se d\u00e9connecter" : "Log out"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop / Tablet - always visible, sticky */}
      <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start bg-white border border-gray-200 rounded-2xl p-4">
        {sidebarContent}
      </aside>

      {/* Mobile - overlay drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full overflow-y-auto p-4 shadow-2xl animate-slide-in-left">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="pt-6">
              {sidebarContent}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}