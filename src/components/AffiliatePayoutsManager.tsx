"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Wallet,
  Download,
  CheckSquare,
  Square,
  Copy,
  CheckCheck,
} from "lucide-react";

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedWalletId, setCopiedWalletId] = useState<string | null>(null);

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

  const filtered =
    filter === "all"
      ? list
      : list.filter((r) => r.payout.status === "pending");

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((r) => r.payout.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const copyAddress = (address: string, id: string) => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopiedWalletId(id);
    setTimeout(() => setCopiedWalletId(null), 2000);
  };

  const processSingle = (payoutId: string, action: "complete" | "reject") => {
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

  const processBulk = (action: "complete" | "reject") => {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to bulk ${action} ${selectedIds.length} payout(s)?`
      )
    )
      return;

    setMsg(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/affiliates/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutIds: selectedIds,
          action,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Bulk action failed");
        return;
      }
      setMsg(`Bulk ${action} completed for ${selectedIds.length} payout(s).`);
      setSelectedIds([]);
      load();
    });
  };

  // NOWPAYMENTS MASS PAYOUTS EXACT CSV TEMPLATE FORMAT
  const exportCSV = () => {
    const itemsToExport =
      selectedIds.length > 0
        ? filtered.filter((r) => selectedIds.includes(r.payout.id))
        : filtered;

    if (itemsToExport.length === 0) return;

    const escapeCell = (val: string) => `"${val.replace(/"/g, '""')}"`;

    const headers = [
      escapeCell("Ticker check Tickers template for the right one"),
      escapeCell("Wallet Address"),
      escapeCell("ExtraId (memo, destination tag, etc.) only for some cryptos like: XRP, XLM, EOS, XMR, HBAR and more"),
      escapeCell("Amount in crypto (6 decimals only!)"),
      escapeCell("Fiat amount"),
      escapeCell("Fiat currency"),
      escapeCell("Payout description"),
    ];

    const rows = itemsToExport.map((r) => {
      const amtNum = parseFloat(r.payout.amount || "0");
      const amtCrypto = isNaN(amtNum) ? "0.000000" : amtNum.toFixed(6);
      const fiatAmt = isNaN(amtNum) ? "0.00" : amtNum.toFixed(2);
      const ticker = "usdttrc20";
      const wallet = (r.affiliate.bankAccount || "").trim();
      const desc = `Affiliate payout for ${r.affiliate.code} (${r.affiliate.email})`;

      return [
        escapeCell(ticker),
        escapeCell(wallet),
        escapeCell(""),
        escapeCell(amtCrypto),
        escapeCell(fiatAmt),
        escapeCell("USD"),
        escapeCell(desc),
      ];
    });

    // Add UTF-8 BOM (\uFEFF) so Excel opens character encoding & numbers cleanly
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `PayoutsTemplate_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#CA3F2E]" />
            Affiliate Payouts
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Process USDT (TRC20) crypto transfers for affiliate commissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold shadow-sm"
            title="Download NOWPayments Mass Payout CSV Template"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export NOWPayments CSV
          </button>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {msg}
        </div>
      )}

      {/* Filter & Bulk Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filter === "pending" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filter === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            All
          </button>
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-900"
            >
              {selectedIds.length === filtered.length ? (
                <CheckSquare className="w-4 h-4 text-[#CA3F2E]" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span>
                {selectedIds.length === filtered.length
                  ? "Deselect All"
                  : `Select All (${filtered.length})`}
              </span>
            </button>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">
                  {selectedIds.length} selected:
                </span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => processBulk("complete")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700 transition"
                >
                  Bulk Mark Paid
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => processBulk("reject")}
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition"
                >
                  Bulk Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border">
          No payout requests found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((row) => {
            const isSelected = selectedIds.includes(row.payout.id);
            const wallet = row.affiliate.bankAccount || "";
            const isCopied = copiedWalletId === row.payout.id;

            return (
              <div
                key={row.payout.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-sm ${
                  isSelected ? "border-[#CA3F2E] ring-1 ring-[#CA3F2E]/20 bg-red-50/10" : "border-gray-100"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleSelectOne(row.payout.id)}
                      className="mt-1 text-gray-400 hover:text-gray-900"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-[#CA3F2E]" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div>
                        <div className="font-bold text-lg text-gray-900">{row.affiliate.name}</div>
                        <div className="text-xs text-gray-400">
                          {row.affiliate.email} · <span className="font-mono text-[#CA3F2E] font-bold">{row.affiliate.code}</span>
                        </div>
                      </div>

                      <div className="text-2xl font-bold text-gray-900">
                        ${parseFloat(row.payout.amount).toFixed(2)}{" "}
                        <span className="text-sm font-normal text-gray-400">
                          {row.payout.currency || "USD"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 max-w-lg space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          USDT TRC20 Wallet Address
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-gray-900 font-bold break-all select-all">
                            {wallet || "Not set in settings"}
                          </span>
                          {wallet && (
                            <button
                              type="button"
                              onClick={() => copyAddress(wallet, row.payout.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 transition flex-shrink-0"
                            >
                              {isCopied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {isCopied ? "Copied!" : "Copy"}
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-400">
                        Requested{" "}
                        {row.payout.requestedAt
                          ? new Date(row.payout.requestedAt).toLocaleString()
                          : "—"}
                      </p>

                      <div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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
                    </div>
                  </div>

                  {row.payout.status === "pending" && (
                    <div className="space-y-2 w-full max-w-xs">
                      <input
                        type="text"
                        placeholder="USDT TX Hash / Reference"
                        value={refs[row.payout.id] || ""}
                        onChange={(e) =>
                          setRefs((p) => ({
                            ...p,
                            [row.payout.id]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#CA3F2E]"
                      />
                      <div className="flex gap-2">
                        <button
                          disabled={isPending}
                          onClick={() => processSingle(row.payout.id, "complete")}
                          className="flex-1 inline-flex justify-center items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50 transition"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Paid
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => processSingle(row.payout.id, "reject")}
                          className="flex-1 inline-flex justify-center items-center gap-1 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-semibold disabled:opacity-50 transition"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}