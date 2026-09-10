"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const VendorOnboardingModal = dynamic(
  () => import("@/components/VendorOnboardingModal"),
  { ssr: false }
);

interface VendorData {
  id: string;
  email: string;
  contactName: string;
  storeName: string;
  storeSlug: string;
  status: string;
  totalSales: number;
  totalEarnings: number;
  pendingPayout: number;
  fulfillmentRate: number;
  conciergeDebt: number;
  preferredCurrency: string;
  mustChangePassword: boolean;
}

interface StatsData {
  productCount: number;
  orderCount: number;
  totalRevenue: number;
  pendingOrders: number;
  totalSales: number;
  totalEarnings: number;
  pendingPayout: number;
  fulfillmentRate: number;
}

export default function VendorDashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [mounted, setMounted] = useState(false);
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [wizardDismissed, setWizardDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchVendor = useCallback(async () => {
    try {
      const res = await fetch("/api/vendor/me");
      if (!res.ok) throw new Error("Auth failed");
      const data = await res.json();
      setVendor(data.vendor);
      if (data.vendor?.status === "incomplete") {
        setShowWizard(true);
      }
    } catch {
      setError(isFr ? "Impossible de charger le profil" : "Failed to load profile");
    }
  }, [isFr]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/vendor/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch {
      setStats({
        productCount: 0,
        orderCount: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        totalSales: 0,
        totalEarnings: 0,
        pendingPayout: 0,
        fulfillmentRate: 100,
      });
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (searchParams.get("setup") === "1") {
      setShowWizard(true);
    }
    async function init() {
      await fetchVendor();
      await fetchStats();
      setLoading(false);
    }
    init();
  }, [mounted, searchParams, fetchVendor, fetchStats]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-[#CA3F2E]" />
      </div>
    );
  }

  if (error && !vendor) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
          {error}
        </div>
      </div>
    );
  }

  const st = stats || {
    productCount: 0,
    orderCount: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalSales: 0,
    totalEarnings: 0,
    pendingPayout: 0,
    fulfillmentRate: 100,
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    fetchVendor();
    if (searchParams.get("setup") === "1") {
      router.replace(`/${locale}/vendor/dashboard`);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 min-w-0">
      {/* Pending status banner */}
      {vendor?.status === "pending" && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-900/20 border border-amber-700/50">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <p className="text-amber-300 font-semibold text-sm">
              {isFr ? "V\u00e9rification en attente" : "Pending Admin Verification"}
            </p>
            <p className="text-amber-400/70 text-xs">
              {isFr
                ? "Votre demande a \u00e9t\u00e9 soumise. Nous vous notifierons d\u00e8s validation."
                : "Your application has been submitted. We will notify you once approved."}
            </p>
          </div>
        </div>
      )}

      {/* Incomplete profile banner */}
      {vendor?.status === "incomplete" && !showWizard && !wizardDismissed && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-900/20 border border-blue-700/50">
          <div>
            <p className="text-blue-300 font-semibold text-sm">
              {isFr ? "Profil incomplet" : "Incomplete Profile"}
            </p>
            <p className="text-blue-400/70 text-xs">
              {isFr
                ? "Compl\u00e9tez les d\u00e9tails de votre boutique pour commencer \u00e0 vendre."
                : "Complete your store profile to start selling on New Deal Zone."}
            </p>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#CA3F2E" }}
          >
            {isFr ? "Compl\u00e9ter" : "Complete Profile"}
          </button>
        </div>
      )}

      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {isFr ? "Bonjour" : "Welcome"},{" "}
          <span style={{ color: "#CA3F2E" }}>
            {vendor?.storeName || vendor?.contactName || "Vendor"}
          </span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {isFr ? "Voici un aper\u00e7u de votre boutique." : "Here is an overview of your store."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: isFr ? "Produits" : "Products",
            value: st.productCount,
            icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
          },
          {
            label: isFr ? "Commandes" : "Orders",
            value: st.orderCount,
            icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
          },
          {
            label: isFr ? "Revenus" : "Revenue",
            value: "$" + st.totalRevenue.toFixed(2),
            icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          },
          {
            label: isFr ? "En attente" : "Pending",
            value: st.pendingOrders,
            icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
          },
        ].map((card, i) => (
          <div key={i} className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">{card.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={card.icon} />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <h2 className="text-base font-semibold text-white mb-4">
          {isFr ? "Actions rapides" : "Quick Actions"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/" + locale + "/vendor/products/add", label: isFr ? "Ajouter un produit" : "Add Product", color: "#CA3F2E" },
            { href: "/" + locale + "/vendor/products", label: isFr ? "Mes produits" : "My Products", color: "#3B82F6" },
            { href: "/" + locale + "/vendor/orders", label: isFr ? "Commandes" : "Orders", color: "#10B981" },
            { href: "/" + locale + "/vendor/earnings", label: isFr ? "Gains" : "Earnings", color: "#F59E0B" },
          ].map((action, i) => (
            <a
              key={i}
              href={action.href}
              className="flex items-center justify-center py-3 px-4 rounded-xl text-xs font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: action.color }}
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>

      {/* Onboarding Wizard Modal */}
      {showWizard && (
        <VendorOnboardingModal
          locale={locale}
          onComplete={handleWizardComplete}
          onSkip={() => {
            setShowWizard(false);
            setWizardDismissed(true);
          }}
        />
      )}
    </div>
  );
}
