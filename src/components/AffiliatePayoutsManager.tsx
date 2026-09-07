"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, RefreshCw, CheckCircle2, XCircle, Wallet } from "lucide-react";

interface PayoutRow {
  payout: {
    id: string;
    amount: string;
    currency: string | null;
    method: string | null;
    reference: string | null;
    note: string | null;
    status: string | null;
    requestedAt: string | null;
    paidAt: string | null;
  };
  affiliate: {
    id: string;
    name: string;
    email: string;
    code: string;
    bankName: string | null;
    bankAccount: string | null;
    bankAccountName: string | null;
    preferredCurrency: string | null;
  };
}

export default function AffiliatePayoutsManager() {
  const [list, setList] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [refs, setRefs] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/affiliates/payouts")
      .then((r) => r.json())
      .then((d) => {
        if (d?.payouts) setList(d.payouts);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const process = (payoutId: string, action: "complete" | "reject") => {
    setMsg(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/affiliates/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId,
          action,
          reference: refs[payoutId] || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Failed");
        return;
      }
      setMsg(
        action === "complete"
          ? "Payout marked completed"
          : "Payout rejected — balance refunded"
      );
      load();
    });
  };

  const filtered =
    filter === "all"
      ? list
      : list.filter((r) => r.payout.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#CA3F2E]" />
            Affiliate Payouts
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Process bank transfers for affiliate commissions.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {msg}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setFilter("pending")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            filter === "pending" ? "bg-gray-900 text-white" : "bg-gray-100"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            filter === "all" ? "bg-gray-900 text-white" : "bg-gray-100"
          }`}
        >
          All
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border">
          No payout requests.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((row) => (
            <div
              key={row.payout.id}
              className="bg-white rounded-2xl border border-gray-100 p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div>
                  <div className="font-bold text-lg">{row.affiliate.name}</div>
                  <div className="text-xs text-gray-400">
                    {row.affiliate.email} · {row.affiliate.code}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-gray-900">
                    ${parseFloat(row.payout.amount).toFixed(2)}{" "}
                    <span className="text-sm font-normal text-gray-400">
                      {row.payout.currency || "USD"}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 space-y-0.5">
                    <p>
                      Bank: {row.affiliate.bankName || "—"} /{" "}
                      {row.affiliate.bankAccount || "—"}
                    </p>
                    <p>Account name: {row.affiliate.bankAccountName || "—"}</p>
                    <p className="text-xs text-gray-400">
                      Requested{" "}
                      {row.payout.requestedAt
                        ? new Date(row.payout.requestedAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      row.payout.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : row.payout.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {row.payout.status}
                  </span>
                </div>

                {row.payout.status === "pending" && (
                  <div className="space-y-2 w-full max-w-xs">
                    <input
                      type="text"
                      placeholder="Bank transfer reference"
                      value={refs[row.payout.id] || ""}
                      onChange={(e) =>
                        setRefs((p) => ({
                          ...p,
                          [row.payout.id]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        disabled={isPending}
                        onClick={() => process(row.payout.id, "complete")}
                        className="flex-1 inline-flex justify-center items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Paid
                      </button>
                      <button
                        disabled={isPending}
                        onClick={() => process(row.payout.id, "reject")}
                        className="flex-1 inline-flex justify-center items-center gap-1 px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-semibold disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}