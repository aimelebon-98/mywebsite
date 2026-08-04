"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import {
  User, LayoutDashboard, Package, LifeBuoy, Heart, Star, Gift,
  MapPin, User as UserIcon, Settings, Shield, LogOut, ChevronRight
} from "lucide-react";

interface Props {
  iconColor: string;
  iconHoverBg: string;
}

export default function AccountHoverMenu({ iconColor, iconHoverBg }: Props) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const { customer, logout } = useCustomer();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };
  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // Not logged in: icon links directly to dashboard (which handles auth redirect)
  if (!customer) {
    return (
      <Link
        href={`/${locale}/account/dashboard`}
        aria-label={isFr ? "Compte" : "Account"}
        className={"relative hidden md:inline-flex p-2 rounded-xl transition " + iconHoverBg}
      >
        <User className={"w-5 h-5 " + iconColor} />
      </Link>
    );
  }

  const items = [
    { href: `/${locale}/account/dashboard`, icon: LayoutDashboard, label: isFr ? "Tableau de bord" : "Dashboard" },
    { href: `/${locale}/account/orders`,    icon: Package,         label: isFr ? "Mes commandes"   : "My Orders" },
    { href: `/${locale}/account/tickets`,   icon: LifeBuoy,        label: isFr ? "Support"         : "Support" },
    { href: `/${locale}/wishlist`,          icon: Heart,           label: isFr ? "Favoris"         : "Wishlist" },
    { href: `/${locale}/account/reviews`,   icon: Star,            label: isFr ? "Mes avis"        : "My Reviews" },
    { href: `/${locale}/account/rewards`,   icon: Gift,            label: isFr ? "R\u00e9compenses" : "Rewards" },
    { href: `/${locale}/account/addresses`, icon: MapPin,          label: isFr ? "Adresses"        : "Addresses" },
    { href: `/${locale}/account/profile`,   icon: UserIcon,        label: isFr ? "Profil"          : "Profile" },
    { href: `/${locale}/account/preferences`, icon: Settings,      label: isFr ? "Pr\u00e9f\u00e9rences" : "Preferences" },
    { href: `/${locale}/account/security`,  icon: Shield,          label: isFr ? "S\u00e9curit\u00e9" : "Security" },
  ];

  const initials = customer.name
    ? customer.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <div
      className="relative hidden md:block"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={`/${locale}/account/dashboard`}
        aria-label="Account"
        className={"relative inline-flex p-2 rounded-xl transition " + iconHoverBg}
      >
        <User className={"w-5 h-5 " + iconColor} />
      </Link>

      {/* Hover panel - flush to navbar, no gap, no visible seam */}
      <div
        className={"absolute right-0 top-full w-72 z-50 transition-all duration-150 origin-top-right " +
          (open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none")}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        <div className="bg-white rounded-b-2xl rounded-tl-2xl shadow-2xl border border-t-0 border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm truncate">{customer.name || "My Account"}</div>
                <div className="text-[10px] text-white/80 truncate">{customer.email}</div>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5 max-h-[calc(100vh-16rem)] overflow-y-auto account-sidebar-scroll">
            {items.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-[#CA3F2E] transition group"
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-[#CA3F2E]" />
                  <span className="flex-1 truncate font-medium">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#CA3F2E] group-hover:translate-x-0.5 transition" />
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <div className="p-1.5 border-t border-gray-100">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>{isFr ? "Se d\u00e9connecter" : "Log out"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
