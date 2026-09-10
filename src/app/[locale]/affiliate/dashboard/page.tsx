"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import PendingApprovalBanner from "@/components/PendingApprovalBanner";
import {
  DollarSign,
  Copy,
  CheckCheck,
  MousePointerClick,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Wallet,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Calendar,
} from "lucide-react";

const AffiliateOnboardingModal = dynamic(
  () => import("@/components/AffiliateOnboardingModal"),
  { ssr: false }
);

interface AffiliateData {
  id: string;
  name: string;
  email: string;
  code: string;
  commissionRate: string;
  totalEarnings: string;
  pendingPayout: string;
  totalPaidOut: string;
  totalClicks: number;
  totalOrders: number;
  status?: string;
  bankAccount?: string | null;
  bankName?: string | null;
  isOverrideEligible?: boolean;
  subscriptionExpiresAt?: string | null;
}

interface OrderItem {
  id: string;
  orderId: string;
  subtotal: string;
  commissionAmount: string;
  currency: string;
  status: string;
  createdAt: string;
}

function AffiliateDashboardInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedGeneral, setCopiedGeneral] = useState(false);
  const [deepLinkInput, setDeepLinkInput] = useState("");
  const [generatedDeepLink, setGeneratedDeepLink] = useState("");
  const [copiedDeep, setCopiedDeep] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const fetchAffiliate = useCallback(async () => {
    try {
      const res = await fetch("/api/affiliate/me");
      const d = await res.json();
      if (d?.affiliate) {
        setAffiliate(d.affiliate);
        if (d.affiliate.status === "incomplete") {
          setShowWizard(true);
        } else {
          setShowWizard(false);
        }
      }
    } catch (e) {
      console.error("Failed to load affiliate profile:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("setup") === "1") {
      setShowWizard(true);
    }
    fetchAffiliate();
    fetch("/api/affiliate/orders")
      .then((r) => r.json())
      .then((d) => d?.orders && setOrders(d.orders.slice(0, 5)))
      .catch(() => {});
  }, [searchParams, fetchAffiliate]);

  const handleWizardComplete = () => {
    setShowWizard(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("setup");
      window.history.replaceState({}, "", url.toString());
    }
    setLoading(true);
    fetchAffiliate();
  };

  if (loading || !affiliate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
        <p className="text-xs text-gray-400">
          {isFr ? "Chargement de votre espace affili\u00e9..." : "Loading your affiliate space..."}
        </p>
      </div>
    );
  }

  if (showWizard || affiliate.status === "incomplete") {
    return (
      <AffiliateOnboardingModal
        locale={locale}
        affiliateCode={affiliate.code}
        onComplete={handleWizardComplete}
        onSkip={() => {
          setShowWizard(false);
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.delete("setup");
            window.history.replaceState({}, "", url.toString());
          }
        }}
        forceSetup={affiliate.status === "incomplete"}
      />
    );
  }

  const isPending = affiliate.status === "pending";
  const defaultRefUrl = `https://www.newdealzone.com/${locale}?ref=${affiliate.code}`;
  const isEligible = Boolean(affiliate.isOverrideEligible);
  const expiresDateStr = affiliate.subscriptionExpiresAt
    ? new Date(affiliate.subscriptionExpiresAt).toLocaleDateString(
        isFr ? "fr-FR" : "en-US",
        { year: "numeric", month: "short", day: "numeric" }
      )
    : null;

  const copyToClipboard = (text: string, isDeep = false) => {
    navigator.clipboard.writeText(text);
    if (isDeep) {
      setCopiedDeep(true);
      setTimeout(() => setCopiedDeep(false), 2000);
    } else {
      setCopiedGeneral(true);
      setTimeout(() => setCopiedGeneral(false), 2000);
    }
  };

  const handleGenerateDeepLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deepLinkInput.trim()) return;
    try {
      const url = new URL(deepLinkInput.trim());
      url.searchParams.set("ref", affiliate.code);
      setGeneratedDeepLink(url.toString());
    } catch {
      const cleanPath = deepLinkInput.trim().replace(/^\//, "");
      const full = `https://www.newdealzone.com/${cleanPath}${cleanPath.includes("?") ? "&" : "?"}ref=${affiliate.code}`;
      setGeneratedDeepLink(full);
    }
  };

  const conversionRate =
    affiliate.totalClicks > 0
      ? ((affiliate.totalOrders / affiliate.totalClicks) * 100).toFixed(1)
      : "0.0";

  const hasWallet = Boolean(affiliate.bankAccount && String(affiliate.bankAccount).trim().length > 10);

  return (
    <div className="space-y-8 min-w-0">
      {isPending && <PendingApprovalBanner isFr={isFr} type="affiliate" />}

      {/* OVERRIDE ELIGIBILITY — ALWAYS VISIBLE ON OVERVIEW */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isEligible
            ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
            : "bg-amber-950/40 border-amber-500/30 text-amber-200"
        }`}
      >
        <div className="flex items-start gap-3">
          {isEligible ? (
            <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm text-white">
                {isEligible
                  ? isFr
                    ? "Overrides L2 (10%) & L3 (5%) Actifs"
                    : "Level 2 (10%) & Level 3 (5%) Overrides Active"
                  : isFr
                  ? "Overrides L2 (10%) & L3 (5%) Verrouill\u00e9s"
                  : "Level 2 (10%) & Level 3 (5%) Overrides Locked"}
              </h3>
              {isEligible ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-500/30">
                  {isFr ? "\u00c9ligible" : "Eligible"}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase border border-amber-500/30">
                  {isFr ? "Non \u00c9ligible" : "Ineligible"}
                </span>
              )}
            </div>
            <p className="text-xs opacity-85 mt-1 leading-relaxed max-w-2xl">
              {isEligible
                ? isFr
                  ? "Votre abonnement SMZ Bot est actif. Vous gagnez les overrides sur les ventes logicielles de votre \u00e9quipe L1 et L2."
                  : "Your SMZ Bot subscription is active. You earn overrides on software sales from your L1 and L2 team."
                : isFr
                ? "Activez SMZ Bot Pro pour d\u00e9bloquer 10% (L1 team) + 5% (L2 team) d'overrides sur les ventes logicielles."
                : "Activate SMZ Bot Pro to unlock 10% (L1 team) + 5% (L2 team) overrides on software sales."}
            </p>
            {expiresDateStr && (
              <p className="text-[11px] font-mono mt-2 text-emerald-300 flex items-center gap-1.5 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                {isFr ? "Expiration :" : "Expires:"} {expiresDateStr}
              </p>
            )}
          </div>
        </div>

        {!isEligible && (
          <Link
            href={`/${locale}/product/smz-ai-trading-bot-pro`}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-md transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            {isFr ? "Activer SMZ Bot Pro" : "Activate SMZ Bot Pro"}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {!hasWallet && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <Wallet className="w-4 h-4 flex-shrink-0" />
            <span>
              {isFr
                ? "Pensez \u00e0 ajouter votre adresse portefeuille USDT (TRC20) pour recevoir vos paiements de commission."
                : "Add your USDT (TRC20) wallet address in Settings so you can receive commission payouts."}
            </span>
          </div>
          <Link
            href={`/${locale}/affiliate/dashboard/settings`}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-xs border border-amber-500/40 whitespace-nowrap transition-colors"
          >
            {isFr ? "Ajouter mon adresse USDT" : "Add USDT Address"}
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {isFr ? `Bonjour, ${affiliate.name}` : `Welcome, ${affiliate.name}`}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            {isFr
              ? "Gagnez jusqu'\u00e0 50% sur SMZ Bot (5% sur produits physiques) + overrides \u00e9quipe."
              : "Earn up to 50% on SMZ Bot (5% on physical products) + team overrides."}
          </p>
        </div>
        <Link
          href={`/${locale}/affiliate/dashboard/payouts`}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-semibold text-sm transition-all self-start sm:self-auto shadow-lg shadow-[#CA3F2E]/20"
        >
          <Wallet className="w-4 h-4" />
          <span>{isFr ? "Demander un Retrait" : "Request Payout"}</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">
              {isFr ? "Solde Retirable" : "Pending Payout"}
            </span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            ${parseFloat(affiliate.pendingPayout || "0").toFixed(2)}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            {isFr ? "Min. $20 pour retrait (USDT TRC20)" : "Min. $20 to withdraw (USDT TRC20)"}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">
              {isFr ? "Gains Cumul\u00e9s" : "Total Earnings"}
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            ${parseFloat(affiliate.totalEarnings || "0").toFixed(2)}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            {isFr ? "Depuis votre inscription" : "Lifetime affiliate revenue"}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">
              {isFr ? "Ventes G\u00e9n\u00e9r\u00e9es" : "Total Orders"}
            </span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{affiliate.totalOrders || 0}</p>
          <p className="text-[11px] text-gray-400 mt-1">
            {isFr ? "Commandes valid\u00e9es" : "Completed purchases"}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">
              {isFr ? "Clics / Taux Conv." : "Clicks & CVR"}
            </span>
            <MousePointerClick className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {affiliate.totalClicks || 0}
            <span className="text-xs font-normal text-gray-400 ml-2">({conversionRate}%)</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            {isFr ? "30 jours de suivi cookie" : "30-day tracking window"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#CA3F2E] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {isFr ? "Votre Lien Principal" : "Your Primary Referral Link"}
            </div>
            <h3 className="text-lg font-bold">
              {isFr ? "Redirige vers l'accueil de la boutique" : "Points to the homepage"}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {isFr
                ? "Partagez ce lien sur vos r\u00e9seaux. Tout achat r\u00e9alis\u00e9 sous 30 jours vous rapporte une commission."
                : "Share this link in your bios or messages. Any sale within 30 days earns you commission."}
            </p>
            <div className="mt-4 p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-gray-300 break-all select-all">
              {defaultRefUrl}
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => copyToClipboard(defaultRefUrl, false)}
              className="w-full py-3 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              {copiedGeneral ? (
                <>
                  <CheckCheck className="w-4 h-4" />
                  <span>{isFr ? "Copi\u00e9 !" : "Copied!"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{isFr ? "Copier mon lien principal" : "Copy referral link"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
              <ExternalLink className="w-3.5 h-3.5" />
              {isFr ? "G\u00e9n\u00e9rateur de Liens Produits" : "Product Deep Link Generator"}
            </div>
            <h3 className="text-lg font-bold">
              {isFr ? "Cr\u00e9ez un lien vers un produit" : "Link directly to any product"}
            </h3>
            <form onSubmit={handleGenerateDeepLink} className="mt-4 space-y-3">
              <input
                type="text"
                value={deepLinkInput}
                onChange={(e) => setDeepLinkInput(e.target.value)}
                placeholder="https://www.newdealzone.com/en/product/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-all"
              >
                {isFr ? "G\u00e9n\u00e9rer le lien affili\u00e9" : "Generate Deep Link"}
              </button>
            </form>
            {generatedDeepLink && (
              <div className="mt-4 p-3 rounded-xl bg-blue-950/40 border border-blue-500/30">
                <p className="font-mono text-xs text-blue-200 break-all select-all">{generatedDeepLink}</p>
                <button
                  onClick={() => copyToClipboard(generatedDeepLink, true)}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  {copiedDeep ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{isFr ? "Lien copi\u00e9 !" : "Link copied!"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isFr ? "Copier ce lien" : "Copy this deep link"}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {isFr ? "Derni\u00e8res Ventes R\u00e9f\u00e9renc\u00e9es" : "Recent Referred Orders"}
          </h3>
          <Link
            href={`/${locale}/affiliate/dashboard/orders`}
            className="text-xs text-[#CA3F2E] hover:underline font-semibold flex items-center gap-1"
          >
            {isFr ? "Voir tout" : "View all"}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            {isFr
              ? "Aucune commande pour le moment. Partagez votre lien !"
              : "No referred orders yet. Share your link to start earning!"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-2">Order ID</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Subtotal</th>
                  <th className="py-3 px-2">Your Earning</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {orders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="py-3 px-2 font-mono text-white">#{ord.orderId.slice(0, 8)}</td>
                    <td className="py-3 px-2">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-2">${parseFloat(ord.subtotal).toFixed(2)}</td>
                    <td className="py-3 px-2 font-semibold text-emerald-400">
                      +${parseFloat(ord.commissionAmount).toFixed(2)}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-semibold">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AffiliateDashboardOverview() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
        </div>
      }
    >
      <AffiliateDashboardInner />
    </Suspense>
  );
}