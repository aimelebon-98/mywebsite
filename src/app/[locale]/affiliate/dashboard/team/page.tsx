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
  const totalTeamClicks = team.reduce((s, m) => s + (m.totalClicks || 0), 0);
  const totalTeamOrders = team.reduce((s, m) => s + (m.totalOrders || 0), 0);
  const totalDownlines = team.reduce((s, m) => s + (m.downlineCount || 0), 0);

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

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            {isFr ? "Recrues directes" : "Direct Recruits"}
          </p>
          <p className="text-2xl sm:text-3xl font-bold mt-2">{data.teamSize}</p>
          <p className="text-[11px] text-gray-500 mt-1">
            {isFr ? "Niveau 2 (L2)" : "Level 2 (L2)"}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            {isFr ? "Leur \u00e9quipe (L3)" : "Their team (L3)"}
          </p>
          <p className="text-2xl sm:text-3xl font-bold mt-2">{totalDownlines}</p>
          <p className="text-[11px] text-gray-500 mt-1">
            {isFr ? "Recrues de vos recrues" : "Recruits of your recruits"}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5">
            <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
            {isFr ? "Clics \u00e9quipe" : "Team clicks"}
          </p>
          <p className="text-2xl sm:text-3xl font-bold mt-2">{totalTeamClicks}</p>
          <p className="text-[11px] text-gray-500 mt-1">
            {isFr ? "Clics g\u00e9n\u00e9r\u00e9s par L2" : "Clicks generated by L2"}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            {isFr ? "Ventes \u00e9quipe" : "Team orders"}
          </p>
          <p className="text-2xl sm:text-3xl font-bold mt-2">{totalTeamOrders}</p>
          <p className="text-[11px] text-gray-500 mt-1">
            {isFr ? "Commandes via L2" : "Orders via L2 members"}
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
              Level 1 — {isFr ? "Ventes directes" : "Direct sales"}
            </p>
            <p className="text-2xl font-black text-white mt-1">
              ${data.commissions.level1.amount}
            </p>
            <p className="text-xs text-emerald-300/80 mt-1">
              {data.commissions.level1.count}{" "}
              {isFr ? "ventes" : "sales"} · {data.affiliate?.commissionRate || "5"}%
            </p>
          </div>
          <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/25">
            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
              Level 2 — {isFr ? "Override \u00e9quipe" : "Team override"}
            </p>
            <p className="text-2xl font-black text-white mt-1">
              ${data.commissions.level2.amount}
            </p>
            <p className="text-xs text-sky-300/80 mt-1">
              {data.commissions.level2.count}{" "}
              {isFr ? "overrides" : "overrides"} · ~10%
            </p>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25">
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Level 3 — {isFr ? "Override profond" : "Deep override"}
            </p>
            <p className="text-2xl font-black text-white mt-1">
              ${data.commissions.level3.amount}
            </p>
            <p className="text-xs text-purple-300/80 mt-1">
              {data.commissions.level3.count}{" "}
              {isFr ? "overrides" : "overrides"} · ~5%
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

      {/* Your traffic snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-[#CA3F2E]" />
            {isFr ? "Votre trafic (L1)" : "Your traffic (L1)"}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
              <p className="text-xl font-bold">{data.traffic.total}</p>
              <p className="text-[10px] text-gray-500 uppercase mt-0.5">{isFr ? "Total" : "Total"}</p>
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
                    <span className="w-10 text-xs font-mono font-bold text-gray-300">
                      {c.country}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#CA3F2E]"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-12 text-right">
                      {c.count} ({pct}%)
                    </span>
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
              {isFr ? "Comment fonctionnent les niveaux ?" : "How do levels work?"}
            </p>
            <p>
              {isFr
                ? "L1 = clients qui ach\u00e8tent via votre lien. L2 = affili\u00e9s que vous recrutez (et leurs ventes). L3 = affili\u00e9s recrut\u00e9s par votre \u00e9quipe. Vous gagnez des overrides sur L2 et L3."
                : "L1 = customers who buy via your link. L2 = affiliates you recruit (and their sales). L3 = affiliates recruited by your team. You earn overrides on L2 and L3."}
            </p>
          </div>
        </div>
      </div>

      {/* Team table */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">
            {isFr
              ? `Recrues directes (${data.teamSize})`
              : `Direct recruits (${data.teamSize})`}
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
                ? "Aucune recrue pour le moment. Partagez votre lien d'inscription affili\u00e9 !"
                : "No recruits yet. Share your affiliate signup link!"}
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
                  <th className="py-3 px-2">{isFr ? "Membre" : "Member"}</th>
                  <th className="py-3 px-2">Code</th>
                  <th className="py-3 px-2">{isFr ? "Statut" : "Status"}</th>
                  <th className="py-3 px-2">{isFr ? "Clics" : "Clicks"}</th>
                  <th className="py-3 px-2">{isFr ? "Ventes" : "Orders"}</th>
                  <th className="py-3 px-2">{isFr ? "Leurs gains" : "Their earnings"}</th>
                  <th className="py-3 px-2">{isFr ? "Leur \u00e9quipe" : "Their team"}</th>
                  <th className="py-3 px-2">{isFr ? "Inscrit" : "Joined"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {team.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-2">
                      <div className="font-semibold text-white">{m.name}</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[160px]">
                        {m.email}
                      </div>
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
                        {m.downlineCount}{" "}
                        <span className="text-gray-500">
                          {isFr ? "L3" : "L3"}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-500">
                      {m.createdAt
                        ? new Date(m.createdAt).toLocaleDateString(
                            isFr ? "fr-FR" : "en-US"
                          )
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
