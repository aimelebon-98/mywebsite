"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Settings,
  LogOut,
  ExternalLink,
  Sparkles,
  Loader2,
  Menu,
  X,
} from "lucide-react";

interface AffiliateData {
  id: string;
  name: string;
  email: string;
  code: string;
  commissionRate: string;
  totalEarnings: string;
  pendingPayout: string;
  totalClicks: number;
  totalOrders: number;
}

export default function AffiliateDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/affiliate/me")
      .then((res) => {
        if (!res.ok) {
          router.push(`/${locale}/affiliate/login`);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.affiliate) {
          setAffiliate(data.affiliate);
        }
      })
      .finally(() => setLoading(false));
  }, [locale, router]);

  const handleLogout = async () => {
    await fetch("/api/affiliate/logout", { method: "POST" });
    router.push(`/${locale}/affiliate/login`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
      </div>
    );
  }

  if (!affiliate) return null;

  const navItems = [
    {
      label: isFr ? "Vue d'ensemble" : "Overview",
      href: `/${locale}/affiliate/dashboard`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: isFr ? "Commandes Liées" : "Referred Orders",
      href: `/${locale}/affiliate/dashboard/orders`,
      icon: ShoppingBag,
    },
    {
      label: isFr ? "Paiements & Retraits" : "Payouts & Balances",
      href: `/${locale}/affiliate/dashboard/payouts`,
      icon: Wallet,
    },
    {
      label: isFr ? "Paramètres & Banque" : "Settings & Bank",
      href: `/${locale}/affiliate/dashboard/settings`,
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col md:flex-row">
      {/* MOBILE TOPBAR */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#121212]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#CA3F2E] flex items-center justify-center text-white font-bold text-xs">
            NDZ
          </div>
          <span className="font-semibold text-sm">Affiliate Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 inset-x-0 bottom-0 md:inset-x-auto z-40 w-full md:w-64 bg-[#121212] border-r border-white/10 flex flex-col transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } md:h-screen`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-white font-bold text-lg"
          >
            <div className="w-7 h-7 rounded-lg bg-[#CA3F2E] flex items-center justify-center text-xs">
              ✓
            </div>
            <span>New Deal Zone</span>
          </Link>
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-400">{isFr ? "Partenaire" : "Partner"}</p>
            <p className="text-sm font-semibold truncate text-white">{affiliate.name}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#CA3F2E]">
              <Sparkles className="w-3 h-3" />
              <span className="font-mono font-bold">{affiliate.code}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#CA3F2E] text-white shadow-lg shadow-[#CA3F2E]/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href={`/${locale}?ref=${affiliate.code}`}
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{isFr ? "Tester mon lien" : "Test my link"}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isFr ? "Déconnexion" : "Log out"}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}