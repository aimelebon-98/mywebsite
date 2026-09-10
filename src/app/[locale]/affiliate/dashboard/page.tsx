"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  DollarSign,
  Copy,
  CheckCheck,
  MousePointerClick,
  Sparkles,
  Users,
  TrendingUp,
} from "lucide-react";
import PendingApprovalBanner from "@/components/PendingApprovalBanner";

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
  country?: string | null;
}

interface NetworkStats {
  team: Array<{
    id: string;
    name: string;
    email: string;
    code: string;
    status: string;
    totalClicks: number;
    totalOrders: number;
    totalEarnings: string;
    downlineCount: number;
  }>;
  teamSize: number;
  traffic: {
    total: number;
    last7Days: number;
    last30Days: number;
    topCountries: Array<{ country: string; count: number }>;
  };
  commissions: {
    level1: { label: string; count: number; amount: string };
    level2: { label: string; count: number; amount: string };
    level3: { label: string; count: number; amount: string };
    total: string;
  };
}

export default function AffiliateDashboardOverview() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [network, setNetwork] = useState<NetworkStats | null>(null);
  const [copiedGeneral, setCopiedGeneral] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const fetchAffiliate = useCallback(async () => {
    try {
      const res = await fetch("/api/affiliate/me");
      const d = await res.json();
      if (d?.affiliate) {
        setAffiliate(d.affiliate);
        if (d.affiliate.status === "incomplete") {
          setShowWizard(true);
        }
      }
    } catch (e) {
      console.error("Failed to load affiliate me:", e);
    }
  }, []);

  const fetchNetwork = useCallback(async () => {
    try {
      const res = await fetch("/api/affiliate/network");
      const d = await res.json();
      if (d?.success) setNetwork(d);
    } catch (e) {
      console.error("Failed to load affiliate network:", e);
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("setup") === "1") {
      setShowWizard(true);
    }
    fetchAffiliate();
    fetchNetwork();
  }, [searchParams, fetchAffiliate, fetchNetwork]);

  if (!affiliate) return null;

  const isPending = affiliate.status === "pending";
  const defaultRefUrl = `https://www.newdealzone.com/${locale}?ref=${affiliate.code}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedGeneral(true);
    setTimeout(() => setCopiedGeneral(false), 2000);
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    fetchAffiliate();
    if (searchParams.get("setup") === "1") {
      router.replace(`/${locale}/affiliate/dashboard`);
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      {isPending && <PendingApprovalBanner isFr={isFr} type="affiliate" />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isFr ? `Bienvenue, ${affiliate.name}` : `Welcome back, ${affiliate.name}`}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isFr
              ? "Suivez vos ventes, votre \u00e9quipe et vos commissions multi-niveaux."
              : "Track your sales, recruit team, and multi-tier commissions in real time."}
          </p>
        </div>

        {affiliate.status === "incomplete" && !showWizard && (
          <button
            onClick={() => setShowWizard(true)}
            className="px-4 py-2 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white text-xs font-semibold self-start"
          >
            {isFr ? "Compl\u00e9ter le profil" : "Complete Profile"}
          </button>
        )}
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs uppercase text-gray-400 font-semibold flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-[#CA3F2E]" />
            {isFr ? "Gains totaux" : "Total Earnings"}
          </p>
          <p className="text-2xl font-black mt-2 text-gray-900">
            ${parseFloat(affiliate.totalEarnings || "0").toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isFr ? "Commissions cumul\u00e9es" : "Lifetime commissions"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs uppercase text-gray-400 font-semibold flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-amber-500" />
            {isFr ? "En attente de retrait" : "Pending Payout"}
          </p>
          <p className="text-2xl font-black mt-2 text-amber-600">
            ${parseFloat(affiliate.pendingPayout || "0").toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isFr ? "Disponible pour retrait" : "Available to withdraw"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs uppercase text-gray-400 font-semibold flex items-center gap-1.5">
            <MousePointerClick className="w-4 h-4 text-sky-500" />
            {isFr ? "Clics totaux" : "Total Clicks"}
          </p>
          <p className="text-2xl font-black mt-2 text-gray-900">
            {network?.traffic.total || affiliate.totalClicks || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {network ? `${network.traffic.last30Days} ${isFr ? "ce mois" : "in 30 days"}` : "Traffic"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs uppercase text-gray-400 font-semibold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-500" />
            {isFr ? "Mon \u00c9quipe" : "Direct Recruits"}
          </p>
          <p className="text-2xl font-black mt-2 text-gray-900">
            {network?.teamSize || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isFr ? "Affili\u00e9s niveau 2" : "Level-2 team members"}
          </p>
        </div>
      </div>

      {/* Multi-Level Commission Breakdowns */}
      {network && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#CA3F2E]" />
            {isFr ? "Revenus par niveau de commission" : "Commission Split by Tier"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs font-bold uppercase text-emerald-800 tracking-wider">
                Level 1 — Direct Sales
              </p>
              <p className="text-2xl font-black text-emerald-900 mt-1">
                ${network.commissions.level1.amount}
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                {network.commissions.level1.count} {isFr ? "ventes directes" : "direct sales"} ({affiliate.commissionRate}%)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
              <p className="text-xs font-bold uppercase text-sky-800 tracking-wider">
                Level 2 — Team Override
              </p>
              <p className="text-2xl font-black text-sky-900 mt-1">
                ${network.commissions.level2.amount}
              </p>
              <p className="text-xs text-sky-700 mt-1">
                {network.commissions.level2.count} {isFr ? "overrides d'\u00e9quipe (10%)" : "team overrides (10%)"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
              <p className="text-xs font-bold uppercase text-purple-800 tracking-wider">
                Level 3 — Deep Override
              </p>
              <p className="text-2xl font-black text-purple-900 mt-1">
                ${network.commissions.level3.amount}
              </p>
              <p className="text-xs text-purple-700 mt-1">
                {network.commissions.level3.count} {isFr ? "overrides profonds (5%)" : "deep overrides (5%)"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Referral Link Box */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#CA3F2E]">
          <Sparkles className="w-4 h-4" />
          {isFr ? "Votre Lien de Parrainage & Code" : "Your Referral Link & Code"}
        </div>
        <p className="text-sm text-gray-300">
          {isFr
            ? "Partagez ce lien. Tout client passant commande ou tout partenaire s'inscrivant via votre lien sera attribu\u00e9 \u00e0 votre \u00e9quipe !"
            : "Share this link with customers and potential affiliates. Every order or recruit referred will earn you commissions!"}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            readOnly
            value={defaultRefUrl}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none"
          />
          <button
            onClick={() => copyToClipboard(defaultRefUrl)}
            className="px-6 py-3 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] font-bold text-sm transition-all flex items-center justify-center gap-2 text-white shadow-lg"
          >
            {copiedGeneral ? (
              <>
                <CheckCheck className="w-4 h-4" />
                {isFr ? "Copi\u00e9 !" : "Copied!"}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                {isFr ? "Copier le lien" : "Copy Link"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recruits Team Table */}
      {network && network.team.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-700" />
            {isFr ? `Votre \u00c9quipe d'Affili\u00e9s (${network.teamSize})` : `Your Sub-Affiliate Team (${network.teamSize})`}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">{isFr ? "Nom" : "Member"}</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">{isFr ? "Clics" : "Clicks"}</th>
                  <th className="px-4 py-3">{isFr ? "Ventes" : "Orders"}</th>
                  <th className="px-4 py-3">{isFr ? "Leur \u00e9quipe" : "Their Team"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {network.team.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#CA3F2E] font-bold">
                      {member.code}
                    </td>
                    <td className="px-4 py-3">{member.totalClicks || 0}</td>
                    <td className="px-4 py-3">{member.totalOrders || 0}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {member.downlineCount} {isFr ? "membres" : "recruits"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Affiliate Onboarding Wizard */}
      {showWizard && (
        <AffiliateOnboardingModal
          locale={locale}
          affiliateCode={affiliate.code}
          onComplete={handleWizardComplete}
          onSkip={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}
