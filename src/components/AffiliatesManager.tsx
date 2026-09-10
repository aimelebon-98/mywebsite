"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Loader2,
  RefreshCw,
  Search,
  Save,
  Sparkles,
  CheckSquare,
  Square,
  GitBranch,
  Users,
  DollarSign,
  Trash2,
  Wallet,
  CreditCard,
  MousePointerClick,
  Layers,
  TrendingUp,
} from "lucide-react";
import AffiliateNetworkPanel from "@/components/AffiliateNetworkPanel";

interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string;
  commissionRate: string | null;
  status: string | null;
  totalClicks: number | null;
  totalOrders: number | null;
  totalEarnings: string | null;
  pendingPayout: string | null;
  totalPaidOut: string | null;
  country: string | null;
  phone: string | null;
  bankName: string | null;
  bankAccount: string | null;
  adminNote: string | null;
  createdAt: string | null;
}

function money(v: string | number | null | undefined) {
  const n = parseFloat(String(v || "0"));
  return isNaN(n) ? "0.00" : n.toFixed(2);
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: any;
  tone?: "default" | "amber" | "emerald" | "sky" | "violet" | "rose";
}) {
  const tones: Record<string, string> = {
    default: "text-gray-900",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    sky: "text-sky-600",
    violet: "text-violet-600",
    rose: "text-[#CA3F2E]",
  };
  const iconBg: Record<string, string> = {
    default: "bg-gray-100 text-gray-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    sky: "bg-sky-50 text-sky-600",
    violet: "bg-violet-50 text-violet-600",
    rose: "bg-red-50 text-[#CA3F2E]",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {label}
          </p>
          <p className={`mt-1.5 text-xl sm:text-2xl font-black tracking-tight truncate ${tones[tone]}`}>
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-[11px] text-gray-400 leading-snug">{hint}</p>
          )}
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg[tone]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

export default function AffiliatesManager() {
  const [list, setList] = useState<Affiliate[]>([]);
  const [stats, setStats] = useState({
    totalAffiliates: 0,
    totalEarningsAll: "0.00",
    totalPendingPayoutAll: "0.00",
    totalPaidOutAll: "0.00",
  });
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [editRates, setEditRates] = useState<Record<string, string>>({});
  const [editStatus, setEditStatus] = useState<Record<string, string>>({});

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkRate, setBulkRate] = useState("5");
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<string | null>(null);

  const load = (q?: string) => {
    setLoading(true);
    const url = q
      ? `/api/admin/affiliates?search=${encodeURIComponent(q)}`
      : "/api/admin/affiliates";
    fetch(url, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.affiliates) {
          setList(d.affiliates);
          setSelectedIds([]);
          const rates: Record<string, string> = {};
          const statuses: Record<string, string> = {};
          d.affiliates.forEach((a: Affiliate) => {
            rates[a.id] = a.commissionRate || "5.00";
            statuses[a.id] = a.status || "approved";
          });
          setEditRates(rates);
          setEditStatus(statuses);
        }
        if (d?.stats) setStats(d.stats);
      })
      .catch((e) => console.error("Failed to load affiliates:", e))
      .finally(() => {
        setLoading(false);
        fetch("/api/admin/affiliates/network", { credentials: "include" })
          .then((r) => r.json())
          .then((d) => d?.overview && setOverview(d.overview))
          .catch(() => {});
      });
  };

  useEffect(() => {
    load();
  }, []);

  const save = (id: string) => {
    setMsg(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/affiliates", {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids: [id],
            commissionRate: editRates[id],
            targetStatus: editStatus[id],
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMsg(data.error || "Update failed");
          return;
        }
        setMsg("Affiliate updated");
        load(search || undefined);
      } catch {
        setMsg("Failed to update affiliate");
      }
    });
  };

  const deleteSingle = (id: string, name: string) => {
    if (!confirm(`PERMANENTLY DELETE affiliate "${name}"? This action cannot be undone.`)) return;
    setMsg(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/affiliates", {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: [id], action: "delete" }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMsg(data.error || "Delete failed");
          return;
        }
        setMsg("Affiliate deleted");
        load(search || undefined);
      } catch {
        setMsg("Failed to delete affiliate");
      }
    });
  };

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === list.length) setSelectedIds([]);
    else setSelectedIds(list.map((a) => a.id));
  }

  const bulkUpdate = (
    payload: Record<string, unknown>,
    confirmLabel: string
  ) => {
    if (selectedIds.length === 0) return;
    const isDelete = payload.action === "delete";
    const confirmMsg = isDelete
      ? `PERMANENTLY DELETE ${selectedIds.length} affiliate${
          selectedIds.length === 1 ? "" : "s"
        }? This cannot be undone.`
      : `${confirmLabel} ${selectedIds.length} affiliate${
          selectedIds.length === 1 ? "" : "s"
        }?`;
    if (!confirm(confirmMsg)) return;

    setBulkMsg(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/affiliates", {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) {
          setBulkMsg(data.error || "Bulk update failed");
          return;
        }
        setBulkMsg(data.message || "Bulk update done");
        setSelectedIds([]);
        load(search || undefined);
      } catch {
        setBulkMsg("Bulk update failed due to network error");
      }
    });
  };

  const l1Amt = money(overview?.commissions?.level1?.amount);
  const l2Amt = money(overview?.commissions?.level2?.amount);
  const l3Amt = money(overview?.commissions?.level3?.amount);
  const l1Count = overview?.commissions?.level1?.count || 0;
  const l2Count = overview?.commissions?.level2?.count || 0;
  const l3Count = overview?.commissions?.level3?.count || 0;
  const clicks30 = overview?.clicksLast30Days || 0;
  const withParent = overview?.withParent || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#CA3F2E]/10 text-[#CA3F2E] text-[10px] font-bold uppercase tracking-wider mb-2">
            <Users className="w-3 h-3" />
            Network Ops
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Affiliates</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Monitor multi-tier performance, manage commission rates, and review payout exposure.
          </p>
        </div>
        <button
          onClick={() => load(search || undefined)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-semibold text-gray-700 shadow-sm transition self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* PRIMARY KPI STRIP */}
      <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Program Snapshot</h3>
            <p className="text-[11px] text-gray-400">Live balances across the full affiliate network</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard
            label="Affiliates"
            value={String(stats.totalAffiliates)}
            hint="Total registered accounts"
            icon={Users}
            tone="rose"
          />
          <StatCard
            label="Lifetime Earnings"
            value={`$${money(stats.totalEarningsAll)}`}
            hint="All commissions earned"
            icon={TrendingUp}
            tone="default"
          />
          <StatCard
            label="Pending Payouts"
            value={`$${money(stats.totalPendingPayoutAll)}`}
            hint="Available for withdraw"
            icon={Wallet}
            tone="amber"
          />
          <StatCard
            label="Total Paid Out"
            value={`$${money(stats.totalPaidOutAll)}`}
            hint="Admin confirmed paid"
            icon={CreditCard}
            tone="emerald"
          />
        </div>
      </div>

      {/* COMMISSION BREAKDOWN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          label="L1 Direct Commissions"
          value={`$${l1Amt}`}
          hint={`${l1Count} direct sales · 5% / 50%`}
          icon={DollarSign}
          tone="emerald"
        />
        <StatCard
          label="L2 Team Overrides"
          value={`$${l2Amt}`}
          hint={`${l2Count} overrides · 10%`}
          icon={Layers}
          tone="sky"
        />
        <StatCard
          label="L3 Deep Overrides"
          value={`$${l3Amt}`}
          hint={`${l3Count} overrides · 5%`}
          icon={GitBranch}
          tone="violet"
        />
        <StatCard
          label="Network Traffic"
          value={`${clicks30}`}
          hint={`${clicks30} clicks / 30d · ${withParent} with upline`}
          icon={MousePointerClick}
          tone="default"
        />
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          {msg}
        </div>
      )}

      {bulkMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          {bulkMsg}
        </div>
      )}

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(search)}
          placeholder="Search name, email, or code..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:border-[#CA3F2E] focus:ring-2 focus:ring-[#CA3F2E]/10"
        />
      </div>

      {/* SELECT ALL BAR */}
      {list.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              {selectedIds.length === list.length && list.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-gray-900" />
              ) : selectedIds.length > 0 ? (
                <div className="w-4 h-4 rounded border-2 border-gray-900 bg-gray-900 flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-white"></div>
                </div>
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span className="font-semibold text-gray-900">
                {selectedIds.length === list.length && list.length > 0
                  ? "Deselect all"
                  : "Select all"}
              </span>
            </button>
            <span className="text-xs text-gray-500 ml-2">
              {list.length} visible
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200 flex-wrap justify-end">
              <span className="text-xs font-bold text-gray-700 mr-1">
                {selectedIds.length} selected:
              </span>
              <button
                type="button"
                disabled={isPending}
                onClick={() => bulkUpdate({ action: "approve" }, "Approve")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-40"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => bulkUpdate({ action: "suspend" }, "Suspend")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-40"
              >
                Suspend
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => bulkUpdate({ action: "reject" }, "Reject")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-40"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  bulkUpdate({ action: "delete" }, "PERMANENTLY DELETE")
                }
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
              >
                Delete
              </button>
              <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                <input
                  type="number"
                  min={1}
                  max={50}
                  step="0.5"
                  value={bulkRate}
                  onChange={(e) => setBulkRate(e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white"
                />
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    bulkUpdate(
                      { commissionRate: bulkRate },
                      `Set commission to ${bulkRate}% for`
                    )
                  }
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40"
                >
                  Set rate
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
          No affiliates found.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-3 py-3 w-10">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-gray-400 hover:text-[#CA3F2E]"
                  >
                    {selectedIds.length === list.length && list.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#CA3F2E]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3">Affiliate</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Rate %</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Earnings</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((a) => (
                <tr
                  key={a.id}
                  className={`hover:bg-gray-50/80 transition-colors ${
                    selectedIds.includes(a.id) ? "bg-red-50/40" : ""
                  }`}
                >
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSelect(a.id)}
                      className="text-gray-400 hover:text-[#CA3F2E]"
                    >
                      {selectedIds.includes(a.id) ? (
                        <CheckSquare className="w-4 h-4 text-[#CA3F2E]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{a.name}</div>
                    <div className="text-xs text-gray-400">{a.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#CA3F2E]">
                      <Sparkles className="w-3 h-3" />
                      {a.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      step="0.5"
                      value={editRates[a.id] || "5"}
                      onChange={(e) =>
                        setEditRates((p) => ({ ...p, [a.id]: e.target.value }))
                      }
                      className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#CA3F2E]"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{a.totalClicks ?? 0}</td>
                  <td className="px-4 py-3 font-medium">{a.totalOrders ?? 0}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    ${parseFloat(a.totalEarnings || "0").toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-amber-600 font-semibold">
                    ${parseFloat(a.pendingPayout || "0").toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={editStatus[a.id] || "approved"}
                      onChange={(e) =>
                        setEditStatus((p) => ({ ...p, [a.id]: e.target.value }))
                      }
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#CA3F2E]"
                    >
                      <option value="approved">approved</option>
                      <option value="suspended">suspended</option>
                      <option value="pending">pending</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setNetworkId(a.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition"
                      title="View team, traffic & level commissions"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      Network
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={isPending}
                        onClick={() => save(a.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 disabled:opacity-50 transition"
                      >
                        {isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        Save
                      </button>

                      <button
                        disabled={isPending}
                        onClick={() => deleteSingle(a.id, a.name)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                        title="Delete affiliate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {networkId && (
        <AffiliateNetworkPanel
          affiliateId={networkId}
          onClose={() => setNetworkId(null)}
        />
      )}
    </div>
  );
}