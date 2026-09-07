"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Loader2,
  RefreshCw,
  Search,
  Save,
  Sparkles,
} from "lucide-react";

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

export default function AffiliatesManager() {
  const [list, setList] = useState<Affiliate[]>([]);
  const [stats, setStats] = useState({
    totalAffiliates: 0,
    totalEarningsAll: "0.00",
    totalPendingPayoutAll: "0.00",
    totalPaidOutAll: "0.00",
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [editRates, setEditRates] = useState<Record<string, string>>({});
  const [editStatus, setEditStatus] = useState<Record<string, string>>({});

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
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const save = (id: string) => {
    setMsg(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/affiliates", {
        credentials: "include",
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateId: id,
          commissionRate: editRates[id],
          status: editStatus[id],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Update failed");
        return;
      }
      setMsg("Affiliate updated");
      load(search || undefined);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Affiliates</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage codes, commission rates (1–50%), and status.
          </p>
        </div>
        <button
          onClick={() => load(search || undefined)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs uppercase text-gray-400 font-semibold">Affiliates</p>
          <p className="text-2xl font-bold mt-1">{stats.totalAffiliates}</p>
          <p className="text-[11px] text-gray-400 mt-1">Approved accounts</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs uppercase text-gray-400 font-semibold">Lifetime earnings</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">
            ${stats.totalEarningsAll}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">All commissions ever earned</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs uppercase text-gray-400 font-semibold">Pending payouts</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">
            ${stats.totalPendingPayoutAll}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Available for withdraw</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs uppercase text-gray-400 font-semibold">Total paid out</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">
            ${stats.totalPaidOutAll}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Admin confirmed paid</p>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {msg}
        </div>
      )}

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(search)}
          placeholder="Search name, email, or code..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border">
          No affiliates yet. Approve an application first.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Affiliate</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Rate %</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Earnings</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/80">
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
                      className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">{a.totalClicks ?? 0}</td>
                  <td className="px-4 py-3">{a.totalOrders ?? 0}</td>
                  <td className="px-4 py-3 font-medium">
                    ${parseFloat(a.totalEarnings || "0").toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-amber-600 font-medium">
                    ${parseFloat(a.pendingPayout || "0").toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-emerald-600 font-medium">
                    ${parseFloat(a.totalPaidOut || "0").toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={editStatus[a.id] || "approved"}
                      onChange={(e) =>
                        setEditStatus((p) => ({ ...p, [a.id]: e.target.value }))
                      }
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
                    >
                      <option value="approved">approved</option>
                      <option value="suspended">suspended</option>
                      <option value="pending">pending</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={isPending}
                      onClick={() => save(a.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 disabled:opacity-50"
                    >
                      {isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}