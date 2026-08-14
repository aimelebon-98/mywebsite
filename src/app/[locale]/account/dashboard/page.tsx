"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import { useCurrency } from "@/lib/currency-context";
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import AccountMobileBar from "@/components/AccountMobileBar";
import Footer from "@/components/Footer";
import { User, Package, Heart, MapPin, Loader2, LifeBuoy, Gift, Star, ShoppingBag, TrendingUp } from "lucide-react";

interface Stats {
  orderCount: number;
  wishlistCount: number;
  ticketCount: number;
  totalSpent: number;
}

export default function DashboardPage() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const { customer, loading } = useCustomer();
  const { format: formatPrice } = useCurrency();
  const [stats, setStats] = useState<Stats>({ orderCount: 0, wishlistCount: 0, ticketCount: 0, totalSpent: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !customer) router.push(`/${locale}/account/login`);
  }, [loading, customer, locale, router]);

  useEffect(() => {
    if (!customer) return;
    fetch("/api/customer/stats").then(r => r.json()).then(d => {
      if (d && !d.error) setStats(d);
    }).catch(() => {});
  }, [customer]);

  if (loading || !customer) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" /></div>;
  }

  const quickCards = [
    { icon: Package, label: isFr ? "Mes commandes" : "My Orders", href: `/${locale}/account/orders`, color: "bg-blue-500" },
    { icon: LifeBuoy, label: isFr ? "Support" : "Support", href: `/${locale}/account/tickets`, color: "bg-cyan-500" },
    { icon: Heart, label: isFr ? "Favoris" : "Wishlist", href: `/${locale}/wishlist`, color: "bg-pink-500" },
    { icon: Star, label: isFr ? "Mes avis" : "My Reviews", href: `/${locale}/account/reviews`, color: "bg-amber-500" },
    { icon: Gift, label: isFr ? "R\u00e9compenses" : "Rewards", href: `/${locale}/account/rewards`, color: "bg-violet-500" },
    { icon: MapPin, label: isFr ? "Adresses" : "Addresses", href: `/${locale}/account/addresses`, color: "bg-emerald-500" },
    { icon: User, label: isFr ? "Profil" : "Profile", href: `/${locale}/account/profile`, color: "bg-purple-500" },
    { icon: ShoppingBag, label: isFr ? "Continuer" : "Continue Shopping", href: `/${locale}/shop`, color: "bg-gray-700" },
  ];

  return (
    <>
      <Navbar />
      <AccountSidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4 lg:pt-8 lg:pb-8">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
            <div className="hidden lg:block"><AccountSidebar /></div>
            <div>
              <AccountMobileBar title={isFr ? "Tableau de bord" : "Dashboard"} onOpen={() => setMenuOpen(true)} />

              <div className="mb-6 scroll-mt-40">
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 scroll-mt-40">
                  {isFr ? "Bonjour, " : "Hi, "}{customer.name.split(" ")[0]}
                </h1>
                <p className="text-gray-500 mt-1 text-sm">{isFr ? "Bienvenue dans votre espace client" : "Welcome to your account"}</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase mb-2"><Package className="w-3.5 h-3.5" /> {isFr ? "Commandes" : "Orders"}</div>
                  <div className="text-2xl font-black text-gray-900">{stats.orderCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase mb-2"><Heart className="w-3.5 h-3.5" /> {isFr ? "Favoris" : "Wishlist"}</div>
                  <div className="text-2xl font-black text-gray-900">{stats.wishlistCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase mb-2"><LifeBuoy className="w-3.5 h-3.5" /> {isFr ? "Tickets" : "Tickets"}</div>
                  <div className="text-2xl font-black text-gray-900">{stats.ticketCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase mb-2"><TrendingUp className="w-3.5 h-3.5" /> {isFr ? "D\u00e9pens\u00e9" : "Spent"}</div>
                  <div className="text-2xl font-black text-gray-900">{formatPrice(stats.totalSpent)}</div>
                </div>
              </div>

              <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3">{isFr ? "Acc\u00e8s rapide" : "Quick access"}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {quickCards.map(c => (
                  <Link key={c.href} href={c.href}
                    className="group bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 hover:shadow-md transition-all">
                    <div className={"w-10 h-10 " + c.color + " rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition"}>
                      <c.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="font-bold text-gray-900 text-sm">{c.label}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}