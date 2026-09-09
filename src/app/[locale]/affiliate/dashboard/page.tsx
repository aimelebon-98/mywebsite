"use client";

import PendingApprovalBanner from "@/components/PendingApprovalBanner";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";

interface AffiliateData {
  id: string;
  status?: string;
  name: string;
  email: string;
  code: string;
  commissionRate: string;
  totalEarnings: string;
  pendingPayout: string;
  totalPaidOut: string;
  totalClicks: number;
  totalOrders: number;
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

export default function AffiliateDashboardOverview() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [copiedGeneral, setCopiedGeneral] = useState(false);
  const [deepLinkInput, setDeepLinkInput] = useState("");
  const [generatedDeepLink, setGeneratedDeepLink] = useState("");
  const [copiedDeep, setCopiedDeep] = useState(false);

  useEffect(() => {
    fetch("/api/affiliate/me")
      .then((r) => r.json())
      .then((d) => d?.affiliate && setAffiliate(d.affiliate));

    fetch("/api/affiliate/orders")
      .then((r) => r.json())
      .then((d) => d?.orders && setOrders(d.orders.slice(0, 5)));
  }, []);

  if (!affiliate) return null;

  const isPending = affiliate.status === "pending";

  const defaultRefUrl = `https://www.newdealzone.com/${locale}?ref=${affiliate.code}`;

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

  return (
    <div className="space-y-8">
      {isPending && <PendingApprovalBanner isFr={isFr} type="affiliate" />}
      {/* WELCOME BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {isFr ? `Bonjour, ${affiliate.name} 👋` : `Welcome, ${affiliate.name} 👋`}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            {isFr
              ? `Votre taux de commission actuel est de ${affiliate.commissionRate}%.`
              : isFr ? "Gagnez jusqu\u00e0 50% de commission sur le Bot SMZ IA (5% sur les produits physiques)." : "Earn up to 50% commission on SMZ AI Bot subscriptions (5% on physical products)."}
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

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Payout */}
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
            {isFr ? "Min. $20 pour retrait" : "Min. $20 to withdraw"}
          </p>
        </div>

        {/* Lifetime Earnings */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">
              {isFr ? "Gains Cumulés" : "Total Earnings"}
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

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">
              {isFr ? "Ventes Générées" : "Total Orders"}
            </span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {affiliate.totalOrders || 0}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            {isFr ? "Commandes validées" : "Completed purchases"}
          </p>
        </div>

        {/* Clicks & CVR */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">
              {isFr ? "Clics / Taux Conv." : "Clicks & CVR"}
            </span>
            <MousePointerClick className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {affiliate.totalClicks || 0}
            <span className="text-xs font-normal text-gray-400 ml-2">
              ({conversionRate}%)
            </span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            {isFr ? "30 jours de suivi cookie" : "30-day tracking window"}
          </p>
        </div>
      </div>

      {/* REFERRAL LINK TOOLS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Referral Link Card */}
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
                ? "Partagez ce lien sur vos réseaux. Tout achat réalisé sous 30 jours vous rapporte une commission."
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
                  <span>{isFr ? "Copié dans le presse-papier !" : "Copied to clipboard!"}</span>
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

        {/* Deep Link Generator */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
              <ExternalLink className="w-3.5 h-3.5" />
              {isFr ? "Générateur de Liens Produits" : "Product Deep Link Generator"}
            </div>
            <h3 className="text-lg font-bold">
              {isFr ? "Créez un lien vers un produit ou abonnement" : "Link directly to any product/subscription"}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {isFr
                ? "Collez l'URL d'une produit ou abonnement pour générer votre lien affilié dédié."
                : "Paste any product URL from our shop to create your custom tracked link."}
            </p>

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
                {isFr ? "Générer le lien affilié" : "Generate Deep Link"}
              </button>
            </form>

            {generatedDeepLink && (
              <div className="mt-4 p-3 rounded-xl bg-blue-950/40 border border-blue-500/30">
                <p className="font-mono text-xs text-blue-200 break-all select-all">
                  {generatedDeepLink}
                </p>
                <button
                  onClick={() => copyToClipboard(generatedDeepLink, true)}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  {copiedDeep ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{isFr ? "Lien copié !" : "Link copied!"}</span>
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

      {/* RECENT REFERRED ORDERS TABLE */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {isFr ? "Dernières Ventes Référencées" : "Recent Referred Orders"}
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
              ? "Aucune commande pour le moment. Partagez votre lien pour commencer à encaisser des commissions !"
              : "No referred orders yet. Share your link to start generating commissions!"}
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
                    <td className="py-3 px-2">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
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