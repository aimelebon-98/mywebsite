"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Package, ShoppingBag, DollarSign, Settings, LogOut, Menu, X, ExternalLink, Store, Loader2, Sparkles
} from "lucide-react";

const BRAND_RED = "#CA3F2E";

interface VendorInfo {
  id: string;
  email: string;
  storeName: string;
  storeSlug: string;
  logo: string;
  status: string;
  commissionRate: string;
  totalSales: number;
  totalEarnings: string;
  pendingPayout: string;
  totalPaidOut: string;
  fulfillmentRate: string;
  mustChangePassword: boolean;
}

export default function VendorDashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/vendor/me");
        const data = await res.json();
        if (!data.vendor) {
          router.push(`/${locale}/vendor/login`);
          return;
        }
        if (data.vendor.mustChangePassword && !pathname.includes("/change-password")) {
          router.push(`/${locale}/vendor/change-password`);
          return;
        }
        setVendor(data.vendor);
      } catch {
        router.push(`/${locale}/vendor/login`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [locale, pathname, router]);

  async function handleLogout() {
    await fetch("/api/vendor/logout", { method: "POST" });
    router.push(`/${locale}/vendor/login`);
  }

  const t = isFr ? {
    dashboard: "Tableau de bord",
    products: "Produits",
    orders: "Commandes",
    earnings: "Gains",
    settings: "Param\u00e8tres",
    concierge: "Concierge",
    logout: "D\u00e9connexion",
    viewStore: "Voir ma boutique",
    verified: "V\u00e9rifi\u00e9",
  } : {
    dashboard: "Dashboard",
    products: "Products",
    orders: "Orders",
    earnings: "Earnings",
    settings: "Settings",
    concierge: "Concierge",
    logout: "Logout",
    viewStore: "View my store",
    verified: "Verified",
  };

  const menu = [
    { href: `/${locale}/vendor/dashboard`, icon: LayoutDashboard, label: t.dashboard },
    { href: `/${locale}/vendor/products`, icon: Package, label: t.products },
    { href: `/${locale}/vendor/concierge`, icon: Sparkles, label: t.concierge },
    { href: `/${locale}/vendor/orders`, icon: ShoppingBag, label: t.orders },
    { href: `/${locale}/vendor/earnings`, icon: DollarSign, label: t.earnings },
    { href: `/${locale}/vendor/settings`, icon: Settings, label: t.settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_RED }} />
      </div>
    );
  }

  if (!vendor) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform lg:relative lg:translate-x-0 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {vendor.logo ? (
                <img src={vendor.logo} alt={vendor.storeName} className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: BRAND_RED }}>
                  <Store className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="min-w-0">
                <div className="font-bold text-sm text-gray-900 truncate">{vendor.storeName}</div>
                <div className="flex items-center gap-1 text-[10px] text-green-600">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  {t.verified}
                </div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menu.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${active ? "text-white" : "text-gray-600 hover:bg-gray-50"}`}
                style={active ? { backgroundColor: BRAND_RED } : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-2">
          <a
            href={`/${locale}/store/${vendor.storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <ExternalLink className="w-4 h-4" />
            {t.viewStore}
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4" />
            {t.logout}
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 lg:hidden flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-bold text-sm text-gray-900">{vendor.storeName}</div>
          <div className="w-9"></div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}