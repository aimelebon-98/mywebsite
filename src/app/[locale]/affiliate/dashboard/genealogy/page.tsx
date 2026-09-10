"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  GitFork,
  Users,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  CheckCheck,
  Copy,
} from "lucide-react";

interface NodeMember {
  id: string;
  name: string;
  email: string;
  code: string;
  status: string | null;
  level: number;
  totalEarnings: string;
  totalOrders: number;
  isOverrideEligible: boolean;
  createdAt: string | null;
  children: NodeMember[];
}

interface TreeData {
  success: boolean;
  tree: NodeMember;
  stats: {
    l1Count: number;
    l2Count: number;
    l3Count: number;
    totalNetworkSize: number;
  };
}

function TreeNode({ node, isRoot = false }: { node: NodeMember; isRoot?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const initials = node.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const levelBadge = isRoot
    ? "bg-[#CA3F2E] text-white border-red-500/50"
    : node.level === 1
    ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
    : node.level === 2
    ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
    : "bg-amber-500/20 text-amber-300 border-amber-500/40";

  const levelLabel = isRoot
    ? "YOU (ROOT)"
    : node.level === 1
    ? "L1 DIRECT"
    : node.level === 2
    ? "L2 TEAM"
    : "L3 DEEP";

  return (
    <div className="flex flex-col items-center relative">
      {/* Member Node Card */}
      <div
        className={`relative z-10 w-64 p-4 rounded-2xl border transition-all shadow-xl backdrop-blur-md ${
          isRoot
            ? "bg-gradient-to-br from-gray-900 via-gray-900 to-red-950/80 border-[#CA3F2E] ring-2 ring-[#CA3F2E]/30"
            : "bg-white/[0.04] hover:bg-white/[0.07] border-white/10"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md ${
                isRoot
                  ? "bg-[#CA3F2E] text-white"
                  : "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-200 border border-white/10"
              }`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-white truncate">{node.name}</h4>
              <p className="font-mono text-[10px] text-[#CA3F2E] font-semibold">{node.code}</p>
            </div>
          </div>
          {hasChildren && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
          <span className={`px-2 py-0.5 rounded-full font-extrabold uppercase border text-[9px] ${levelBadge}`}>
            {levelLabel}
          </span>
          <div className="flex items-center gap-1.5 font-semibold">
            {node.isOverrideEligible ? (
              <span className="text-emerald-400 flex items-center gap-1" title="Active Subscription (Overrides Unlocked)">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Eligible</span>
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1" title="No Active Subscription">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Locked</span>
              </span>
            )}
          </div>
        </div>

        <div className="mt-2 text-[10px] text-gray-400 flex items-center justify-between">
          <span>Orders: <strong className="text-white">{node.totalOrders}</strong></span>
          <span>Earned: <strong className="text-emerald-400">${parseFloat(node.totalEarnings).toFixed(2)}</strong></span>
        </div>
      </div>

      {/* Downline Connectors */}
      {hasChildren && !collapsed && (
        <div className="flex flex-col items-center mt-2 w-full">
          {/* Vertical line down from parent */}
          <div className="w-0.5 h-6 bg-gradient-to-b from-red-600/80 to-gray-700" />

          {/* Horizontal line across children if > 1 child */}
          {node.children.length > 1 && (
            <div className="w-full relative h-0.5 bg-gray-700/80 my-1">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
            </div>
          )}

          {/* Children container */}
          <div className="flex flex-wrap justify-center gap-8 pt-2 w-full">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical line down to each child */}
                <div className="w-0.5 h-4 bg-gray-700 -mt-2 mb-2" />
                <TreeNode node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AffiliateGenealogyPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [data, setData] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/affiliate/genealogy")
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) setData(d);
        else setError(d?.error || "Failed to load genealogy tree");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
        <p className="text-xs text-gray-400">
          {isFr ? "Chargement de la g\u00e9n\u00e9alogie..." : "Loading genealogy tree..."}
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
        {error || "Failed to load genealogy data"}
      </div>
    );
  }

  const recruitUrl = `https://www.newdealzone.com/${locale}/affiliate/apply?ref=${data.tree?.code || ""}`;

  const copyRecruit = () => {
    navigator.clipboard.writeText(recruitUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <GitFork className="w-7 h-7 text-[#CA3F2E]" />
            {isFr ? "Arbre G\u00e9n\u00e9alogique" : "Genealogy Tree"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isFr
              ? "Visualisez la structure hi\u00e9rarchique de votre r\u00e9seau (L1 Direct, L2 Equipe, L3 Profond)."
              : "Visual interactive network tree of your distributor organization (L1, L2, L3)."}
          </p>
        </div>
        <button
          type="button"
          onClick={copyRecruit}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white text-sm font-semibold shadow-lg shadow-[#CA3F2E]/20 self-start"
        >
          {copied ? <CheckCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {copied ? (isFr ? "Copi\u00e9 !" : "Copied!") : isFr ? "Lien Recrutement" : "Copy Recruit Link"}
        </button>
      </div>

      {/* Network Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <p className="text-[10px] uppercase font-bold text-gray-400">{isFr ? "Taille du R\u00e9seau" : "Total Network Size"}</p>
          <p className="text-2xl font-black text-white mt-1">{data.stats.totalNetworkSize}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <p className="text-[10px] uppercase font-bold text-purple-400">Level 1 (Direct)</p>
          <p className="text-2xl font-black text-white mt-1">{data.stats.l1Count}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <p className="text-[10px] uppercase font-bold text-sky-400">Level 2 (Team)</p>
          <p className="text-2xl font-black text-white mt-1">{data.stats.l2Count}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <p className="text-[10px] uppercase font-bold text-amber-400">Level 3 (Deep)</p>
          <p className="text-2xl font-black text-white mt-1">{data.stats.l3Count}</p>
        </div>
      </div>

      {/* Tree Canvas Box */}
      <div className="p-8 rounded-3xl bg-[#09090b] border border-white/10 shadow-2xl overflow-x-auto min-h-[500px] flex justify-center">
        {data.tree.children.length === 0 ? (
          <div className="text-center py-16 space-y-4 max-w-md mx-auto">
            <Users className="w-12 h-12 text-gray-600 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">
              {isFr ? "Aucun membre dans votre r\u00e9seau" : "No recruits in your network tree yet"}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {isFr
                ? "Partagez votre lien de parrainage. Dès qu'un utilisateur s'inscrit ou souscrit à un abonnement, il apparaîtra ici dans votre arbre g\u00e9n\u00e9alogique !"
                : "Share your recruit link. As soon as anyone registers or subscribes, they will visually appear in your genealogy tree!"}
            </p>
            <button
              onClick={copyRecruit}
              className="px-5 py-2.5 rounded-xl bg-[#CA3F2E] text-white text-xs font-bold shadow-lg"
            >
              {isFr ? "Copier mon lien de recrutement" : "Copy Recruit Link"}
            </button>
          </div>
        ) : (
          <div className="py-4">
            <TreeNode node={data.tree} isRoot={true} />
          </div>
        )}
      </div>
    </div>
  );
}