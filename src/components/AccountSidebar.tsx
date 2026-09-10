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
  variant?: "desktop" | "mobile";
}

export default function AccountSidebar({ mobileOpen = false, onClose, variant }: Props) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const pathname = usePathname();
  const { logout, customer } = useCustomer();

  const mode = variant || (onClose !== undefined ? "mobile" : "desktop");

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

  useEffect(() => {
    if (mode !== "mobile" || !mobileOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && onClose) onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [mode, mobileOpen, onClose]);

  const inner = (
    <>
      {customer && (
        <div className="px-4 py-3.5 mb-3 bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] rounded-2xl text-white flex-shrink-0 shadow-md shadow-red-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-sm flex-shrink-0 border border-white/20">
              {customer.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{customer.name}</div>
              <div className="text-[11px] opacity-85 truncate">{customer.email}</div>
            </div>
          </div>
        </div>
      )}

      <nav className="space-y-1 flex-1 min-h-0 overflow-y-auto account-sidebar-scroll pr-1 -mr-1">
        {items.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href.endsWith('/account/dashboard') ? pathname === item.href : pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={"flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 " + (active ? "bg-[#CA3F2E] text-white shadow-sm font-semibold" : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900")}
            >
              <Icon className={"w-4 h-4 flex-shrink-0 " + (active ? "text-white" : "text-gray-400")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-3 mt-3 border-t border-gray-100 space-y-1 flex-shrink-0">
        <Link
          href={`/${locale}/shop`}
          onClick={onClose}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100/80 transition"
        >
          <Store className="w-4 h-4 text-gray-400" />
          {isFr ? "Retour \u00e0 la boutique" : "Back to store"}
        </Link>
        <button
          onClick={() => { if (onClose) onClose(); logout(); }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4" />
          {isFr ? "Se d\u00e9connecter" : "Log out"}
        </button>
      </div>
    </>
  );

  if (mode === "mobile") {
    if (!mobileOpen) return null;
    return (
      <div className="lg:hidden fixed inset-0 z-50 flex">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
        <aside className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col p-4 shadow-2xl animate-slide-in-left">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition z-10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <div className="pt-2 flex flex-col flex-1 min-h-0">
            {inner}
          </div>
        </aside>
      </div>
    );
  }

  return (
    <aside
      className="sticky top-24 self-start bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-4 flex flex-col shadow-xl shadow-gray-200/50"
      style={{ maxHeight: "calc(100vh - 7rem)" }}
    >
      {inner}
    </aside>
  );
}