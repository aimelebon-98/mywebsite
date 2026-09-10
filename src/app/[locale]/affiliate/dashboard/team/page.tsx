"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  Loader2,
  Sparkles,
  Globe,
  ShoppingBag,
  Copy,
  CheckCheck,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  code: string;
  status: string | null;
  totalClicks: number | null;
  totalOrders: number | null;
  totalEarnings: string | null;
  downlineCount: number;
  createdAt: string | null;
}

interface NetworkData {
  success: boolean;
  team: TeamMember[];
  teamSize: number;
  hierarchy?: {
    l1Count: number;
    l2Count: number;
    l3Count: number;
    teamClicks: number;
    teamOrders: number;
  };
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
  affiliate: {
    code: string;
    commissionRate: string;
    isOverrideEligible: boolean;
    subscriptionExpiresAt: string | null;
  };
}

export default function AffiliateTeamPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [data, setData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/affiliate/network")
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) setData(d);
        else setError(d?.error || "Failed to load team");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
        <p className="text-xs text-gray-400">
          {isFr ? "Chargement de votre \u00e9quipe..." : "Loading your team..."}
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
        {error || "Failed to load team data"}
      </div>
    );
  }

  const recruitUrl = `https://www.newdealzone.com/${locale}/affiliate/apply?ref=${data.affiliate?.code || ""}`;

  const copyRecruit = () => {
    navigator.clipboard.writeText(recruitUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const team = data.team || [];
  const l1Count = data.hierarchy?.l1Count ?? data.teamSize ?? team.length;
  const l2Count = data.hierarchy?.l2Count ?? team.reduce((s, m) => s + (m.downlineCount || 0), 0);
  const l3Count = data.hierarchy?.l3Count ?? 0;
  const totalTeamClicks = data.hierarchy?.teamClicks ?? team.reduce((s, m) => s + (m.totalClicks || 0), 0);
  const totalTeamOrders = data.hierarchy?.teamOrders ?? team.reduce((s, m) => s + (m.totalOrders || 0), 0);

  const isEligible = data.affiliate?.isOverrideEligible;
  const expiresDateStr = data.affiliate?.subscriptionExpiresAt
    ? new Date(data.affiliate.subscriptionExpiresAt).toLocaleDateString(
        isFr ? "fr-FR" : "en-US",
        { year: "numeric", month: "short", day: "numeric" }
      )
    : null;

  return (
    <div className="space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Users className="w-7 h-7 text-[#CA3F2E]" />
            {isFr ? "Mon \u00c9quipe" : "My Team"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isFr
              ? "Suivez vos recrutements multi-niveaux, clics downline et overrides de commission."
              : "Track multi-level recruits, downline clicks, and commission overrides."}
          </p>
        </div>
        <button
          type="button"
          onClick={copyRecruit}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white text-sm font-semibold shadow-lg shadow-[#CA3F2E]/20 self-start"
        >
          {copied ? <CheckCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {copied
            ? isFr
              ? "Lien copi\u00e9 !"
              : "Link copied!"
            : isFr
            ? "Copier lien recrutement"
            : "Copy recruit link"}
        </button>
      </div>

      {/* OVERRIDE ELIGIBILITY BANNER */}
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
                  ? "Votre abonnement SMZ Bot est actif. Vous recevez les overrides sur les ventes logicielles de votre \u00e9quipe."
                  : "Your SMZ Bot subscription is active. You receive multi-level overrides on team software sales."
                : isFr
                ? "Un abonnement actif au SMZ Bot Pro est requis pour d\u00e9bloquer les overrides L2 (10%) et L3 (5%)."
                : "An active SMZ Bot Pro subscription is required to unlock Level 2 (10%) and Level 3 (5%) team overrides."}
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

      {/* KPI cards - CORRECT HIERARCHY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            {isFr ? "Recrues directes" : "Direct Recruits"}
          </p>
          <p className="text-2xl sm:text-3xl font-bold mt-2">{l1Count}</p>
          <p className="text-[11px] text-gray-500 mt-1">
            {isFr ? "Niveau 1 (L1) — vos affili\u00e9s" : "Level 1 (L1) — your affiliates"}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            {isFr ? "Leur \u00e9quipe (L2)" : "Their Team (L2)"}
          </p>
          <p className="text-2xl sm:text-3xl font-bold mt-2">{l2Count}</p>
          <p className="text-[11px] text-gray-500 mt-1">
            {isFr ? "Recrues de vos L1" : "Recruits of your L1"}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-violet-400" />
            {isFr ? "Niveau 3 (L3)" : "Level 3 (L3)"}
          </p>
          <p className="text-2xl sm:text-3xl font-bold mt-2">{l3Count}</p>
          <p className="text-[11px] text-gray-500 mt-1">
            {isFr ? "Recrues de vos L2" : "Recruits of your L2"}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5">
            <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
            {isFr ? "Clics / Ventes L1" : "L1 Clicks / Orders"}
          </p>
          <p className="text-2xl sm:text-3xl font-bold mt-2">
            {totalTeamClicks}
            <span className="text-base text-gray-500 font-medium"> / {totalTeamOrders}</span>
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            {isFr ? "Activit\u00e9 de vos recrues L1" : "Activity from your L1 recruits"}
          </p>
        </div>
      </div>

      {/* Commission levels */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#CA3F2E]" />
          {isFr ? "Commissions par niveau" : "Commissions by Level"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {isFr ? "Ventes clients (direct)" : "Customer sales (direct)"}
            </p>
            <p className="text-2xl font-black text-white mt-1">
              ${data.commissions.level1.amount}
            </p>
            <p className="text-xs text-emerald-300/80 mt-1">
              {data.commissions.level1.count}{" "}
              {isFr ? "ventes" : "sales"} · 5% (Physique) / 50% (SMZ)
            </p>
          </div>
          <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/25">
            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center justify-between">
              <span>{isFr ? "Override \u00e9quipe L1" : "L1 Team Override"} · 10%</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isEligible ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                {isEligible ? "ACTIVE" : "LOCKED"}
              </span>
            </p>
            <p className="text-2xl font-black text-white mt-1">
              ${data.commissions.level2.amount}
            </p>
            <p className="text-xs text-sky-300/80 mt-1">
              {data.commissions.level2.count}{" "}
              {isFr ? "overrides" : "overrides"} · {isFr ? "ventes SMZ de vos L1" : "SMZ sales by your L1"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25">
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center justify-between">
              <span>{isFr ? "Override \u00e9quipe L2" : "L2 Team Override"} · 5%</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isEligible ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                {isEligible ? "ACTIVE" : "LOCKED"}
              </span>
            </p>
            <p className="text-2xl font-black text-white mt-1">
              ${data.commissions.level3.amount}
            </p>
            <p className="text-xs text-purple-300/80 mt-1">
              {data.commissions.level3.count}{" "}
              {isFr ? "overrides" : "overrides"} · {isFr ? "ventes SMZ de vos L2" : "SMZ sales by your L2"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            {isFr ? "Total commissions multi-niveaux" : "Total multi-tier commissions"}
          </span>
          <span className="text-lg font-bold text-white">${data.commissions.total}</span>
        </div>
      </div>

      {/* Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-[#CA3F2E]" />
            {isFr ? "Votre trafic personnel" : "Your personal traffic"}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
              <p className="text-xl font-bold">{data.traffic.total}</p>
              <p className="text-[10px] text-gray-500 uppercase mt-0.5">Total</p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
              <p className="text-xl font-bold">{data.traffic.last7Days}</p>
              <p className="text-[10px] text-gray-500 uppercase mt-0.5">7d</p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
              <p className="text-xl font-bold">{data.traffic.last30Days}</p>
              <p className="text-[10px] text-gray-500 uppercase mt-0.5">30d</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#CA3F2E]" />
            {isFr ? "Top pays (vos clics)" : "Top countries (your clicks)"}
          </h2>
          {data.traffic.topCountries.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">
              {isFr ? "Pas encore de donn\u00e9es g\u00e9o." : "No geo data yet."}
            </p>
          ) : (
            <div className="space-y-2">
              {data.traffic.topCountries.map((c) => {
                const pct =
                  data.traffic.total > 0
                    ? Math.round((c.count / data.traffic.total) * 100)
                    : 0;
                return (
                  <div key={c.country} className="flex items-center gap-3">
                    <span className="w-10 text-xs font-mono font-bold text-gray-300">{c.country}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-[#CA3F2E]" style={{ width: `${Math.max(pct, 4)}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-12 text-right">{c.count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* How levels work */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#CA3F2E]/10 to-transparent border border-[#CA3F2E]/20">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#CA3F2E] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-300 leading-relaxed space-y-1">
            <p className="font-semibold text-white">
              {isFr ? "Hi\u00e9rarchie de l'\u00e9quipe" : "Team hierarchy"}
            </p>
            <p>
              {isFr
                ? "L1 = affili\u00e9s que VOUS recrutez. L2 = affili\u00e9s recrut\u00e9s par vos L1. L3 = affili\u00e9s recrut\u00e9s par vos L2. Sur SMZ Bot : 50% vente client directe, +10% override sur ventes de vos L1, +5% override sur ventes de vos L2 (abonnement SMZ actif requis pour les overrides)."
                : "L1 = affiliates YOU recruit. L2 = affiliates recruited by your L1. L3 = affiliates recruited by your L2. On SMZ Bot: 50% direct customer sale, +10% override on your L1 sales, +5% override on your L2 sales (active SMZ subscription required for overrides)."}
            </p>
          </div>
        </div>
      </div>

      {/* Team table - L1 Direct Recruits */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">
            {isFr
              ? `Recrues directes L1 (${l1Count})`
              : `Direct Recruits L1 (${l1Count})`}
          </h2>
          <Link
            href={`/${locale}/affiliate/dashboard`}
            className="text-xs text-[#CA3F2E] hover:underline font-semibold"
          >
            {isFr ? "Retour overview" : "Back to overview"}
          </Link>
        </div>

        {team.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Users className="w-10 h-10 text-gray-600 mx-auto" />
            <p className="text-sm text-gray-400">
              {isFr
                ? "Aucune recrue L1 pour le moment. Partagez votre lien d'inscription affili\u00e9 !"
                : "No L1 recruits yet. Share your affiliate signup link!"}
            </p>
            <div className="max-w-md mx-auto p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-[11px] text-gray-400 break-all">
              {recruitUrl}
            </div>
            <button
              type="button"
              onClick={copyRecruit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {isFr ? "Copier le lien" : "Copy link"}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-2">{isFr ? "Membre L1" : "L1 Member"}</th>
                  <th className="py-3 px-2">Code</th>
                  <th className="py-3 px-2">{isFr ? "Statut" : "Status"}</th>
                  <th className="py-3 px-2">{isFr ? "Clics" : "Clicks"}</th>
                  <th className="py-3 px-2">{isFr ? "Ventes" : "Orders"}</th>
                  <th className="py-3 px-2">{isFr ? "Leurs gains" : "Their earnings"}</th>
                  <th className="py-3 px-2">{isFr ? "Leur L2" : "Their L2"}</th>
                  <th className="py-3 px-2">{isFr ? "Inscrit" : "Joined"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {team.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-2">
                      <div className="font-semibold text-white">{m.name}</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[160px]">{m.email}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-mono font-bold text-[#CA3F2E]">{m.code}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                          m.status === "approved"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : m.status === "pending" || m.status === "incomplete"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-gray-500/10 border-gray-500/30 text-gray-400"
                        }`}
                      >
                        {m.status || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-medium">{m.totalClicks ?? 0}</td>
                    <td className="py-3 px-2 font-medium">{m.totalOrders ?? 0}</td>
                    <td className="py-3 px-2 font-semibold text-emerald-400">
                      ${parseFloat(m.totalEarnings || "0").toFixed(2)}
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-500" />
                        {m.downlineCount}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-500">
                      {m.createdAt
                        ? new Date(m.createdAt).toLocaleDateString(isFr ? "fr-FR" : "en-US")
                        : "—"}
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