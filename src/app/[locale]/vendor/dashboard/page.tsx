"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
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

function VendorDashboardInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWizard, setShowWizard] = useState(false);

  const fetchVendor = useCallback(async () => {
    try {
      const res = await fetch("/api/vendor/me");
      if (!res.ok) throw new Error("Auth failed");
      const data = await res.json();
      setVendor(data.vendor);
      if (data.vendor?.status === "incomplete") {
        setShowWizard(true);
      } else {
        setShowWizard(false);
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
        productCount: 0, orderCount: 0, totalRevenue: 0, pendingOrders: 0,
        totalSales: 0, totalEarnings: 0, pendingPayout: 0, fulfillmentRate: 100,
      });
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("setup") === "1") {
      setShowWizard(true);
    }
    async function init() {
      await fetchVendor();
      await fetchStats();
      setLoading(false);
    }
    init();
  }, [searchParams, fetchVendor, fetchStats]);

  const handleWizardComplete = () => {
    setShowWizard(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("setup");
      window.history.replaceState({}, "", url.toString());
    }
    setLoading(true);
    fetchVendor().finally(() => setLoading(false));
  };

  // LOADING GATE
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
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-300 text-sm">{error}</div>
      </div>
    );
  }

  // WIZARD ONLY WHEN UNCOMPLETED
  if (showWizard || vendor?.status === "incomplete") {
    return (
      <VendorOnboardingModal
        locale={locale}
        onComplete={handleWizardComplete}
        onSkip={() => {
          setShowWizard(false);
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.delete("setup");
            window.history.replaceState({}, "", url.toString());
          }
        }}
      />
    );
  }

  const st = stats || {
    productCount: 0, orderCount: 0, totalRevenue: 0, pendingOrders: 0,
    totalSales: 0, totalEarnings: 0, pendingPayout: 0, fulfillmentRate: 100,
  };

  return (
    <div className="p-4 md:p-6 space-y-6 min-w-0">
      {vendor?.status === "pending" && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-900/20 border border-amber-700/50">
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: isFr ? "Produits" : "Products", value: st.productCount },
          { label: isFr ? "Commandes" : "Orders", value: st.orderCount },
          { label: isFr ? "Revenus" : "Revenue", value: "$" + st.totalRevenue.toFixed(2) },
          { label: isFr ? "En attente" : "Pending", value: st.pendingOrders },
        ].map((card, i) => (
          <div key={i} className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
            <span className="text-xs text-gray-500 uppercase tracking-wider">{card.label}</span>
            <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
          </div>
        ))}
      </div>

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
    </div>
  );
}

export default function VendorDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-[#CA3F2E]" />
        </div>
      }
    >
      <VendorDashboardInner />
    </Suspense>
  );
}
