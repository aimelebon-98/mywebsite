"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import { useAccountLayout, AccountLayoutProvider } from "@/lib/account-layout-context";
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import AccountMobileBar from "@/components/AccountMobileBar";
import AccountLayoutToggle from "@/components/AccountLayoutToggle";
import Footer from "@/components/Footer";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  User,
  LifeBuoy,
  Gift,
  Star,
  Settings,
  Shield,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

interface Props {
  title: string;
  children: React.ReactNode;
}

function AccountShellContent({ title, children }: Props) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const pathname = usePathname();
  const { customer } = useCustomer();
  const { layout } = useAccountLayout();
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({ orderCount: 0, wishlistCount: 0, ticketCount: 0, totalSpent: 0 });

  useEffect(() => {
    if (!customer) return;
    fetch("/api/customer/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setStats(d);
      })
      .catch(() => {});
  }, [customer]);

  const navItems = [
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

  const initials = customer?.name
    ? customer.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "ND";

  // Mode 1: PREMIUM SAAS SIDEBAR
  if (layout === "saas") {
    return (
      <>
        <Navbar />
        <AccountSidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="min-h-screen bg-gray-50/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6 lg:pt-8 lg:pb-12">
            <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8 items-start">
              <div className="hidden lg:block">
                <AccountSidebar />
              </div>
              <div className="min-w-0">
                <AccountMobileBar title={title} onOpen={() => setMenuOpen(true)} />
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4 px-4 lg:px-0 pt-2 lg:pt-0">
                  <div className="hidden lg:block">
                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">{title}</h1>
                  </div>
                  <div className="w-full lg:w-auto flex justify-between lg:justify-end items-center gap-3">
                    <AccountLayoutToggle isFr={isFr} />
                  </div>
                </div>
                <div>{children}</div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Mode 2: HORIZONTAL TABS
  if (layout === "tabs") {
    return (
      <>
        <Navbar />
        <AccountSidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="min-h-screen bg-gray-50/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <AccountMobileBar title={title} onOpen={() => setMenuOpen(true)} />

            {/* Top Banner */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-6">
              <div className="absolute top-4 right-4 z-10">
                <AccountLayoutToggle isFr={isFr} />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-0">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#CA3F2E] flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-600/30 flex-shrink-0">
                    {initials}
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-semibold mb-1 backdrop-blur-md">
                      <Sparkles className="w-3 h-3 text-amber-400" /> {isFr ? "Membre V.I.P" : "VIP Member"}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">{customer?.name}</h2>
                    <p className="text-xs text-gray-300">{customer?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-700/60 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-center">
                    <div className="text-lg font-black text-white">{stats.orderCount}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{isFr ? "Commandes" : "Orders"}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-amber-400">{stats.wishlistCount}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{isFr ? "Favoris" : "Wishlist"}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-emerald-400">{stats.ticketCount}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{isFr ? "Tickets" : "Tickets"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Scrollable Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-gray-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href.endsWith('/account/dashboard') ? pathname === item.href : pathname.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 " +
                      (active
                        ? "bg-[#CA3F2E] text-white shadow-md shadow-red-600/20"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80")
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="min-w-0">{children}</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Mode 3: BENTO BOX GRID LAYOUT
  return (
    <>
      <Navbar />
      <AccountSidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="min-h-screen bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
          <AccountMobileBar title={title} onOpen={() => setMenuOpen(true)} />

          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#CA3F2E]">{isFr ? "Espace Client" : "Customer Portal"}</span>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">{title}</h1>
            </div>
            <AccountLayoutToggle isFr={isFr} />
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] text-white flex items-center justify-center font-black text-xl shadow-md shadow-red-600/20 flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#CA3F2E]">{isFr ? "Bienvenue" : "Welcome back"}</div>
                  <h3 className="text-lg font-bold text-gray-900 truncate">{customer?.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{customer?.email}</p>
                </div>
              </div>
              <Link href={`/${locale}/account/profile`} className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 transition text-gray-700 flex-shrink-0">
                <User className="w-5 h-5" />
              </Link>
            </div>

            <Link
              href={`/${locale}/account/orders`}
              className="group bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-gray-900">{stats.orderCount}</div>
                <div className="text-xs text-gray-500 font-medium">{isFr ? "Commandes pass\u00e9es" : "Orders placed"}</div>
              </div>
            </Link>

            <Link
              href={`/${locale}/wishlist`}
              className="group bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-pink-600 transition-colors" />
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-gray-900">{stats.wishlistCount}</div>
                <div className="text-xs text-gray-500 font-medium">{isFr ? "Articles enregistr\u00e9s" : "Saved items"}</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href.endsWith('/account/dashboard') ? pathname === item.href : pathname.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all " +
                    (active
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/60")
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="min-w-0">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function AccountShell(props: Props) {
  return (
    <AccountLayoutProvider>
      <AccountShellContent {...props} />
    </AccountLayoutProvider>
  );
}