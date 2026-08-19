"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, DollarSign, TrendingUp, Wallet, Clock, CheckCircle2, XCircle, Send, AlertCircle } from "lucide-react";

const BRAND_RED = "#CA3F2E";
const BRAND_RED_DARK = "#8B2A1E";

interface PayoutRow {
  id: string;
  amount: string;
  currency: string;
  method: string;
  reference: string;
  note: string;
  status: string;
  requestedAt: string;
  paidAt: string | null;
}

export default function VendorEarningsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [pendingPayout, setPendingPayout] = useState("0");
  const [totalPaidOut, setTotalPaidOut] = useState("0");
  const [totalEarnings, setTotalEarnings] = useState("0");
  const [minPayoutUsd, setMinPayoutUsd] = useState(20);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/payouts");
      const data = await res.json();
      setPayouts(data.payouts || []);
      setPendingPayout(data.pendingPayout || "0");
      setTotalPaidOut(data.totalPaidOut || "0");
      setTotalEarnings(data.totalEarnings || "0");
      setMinPayoutUsd(data.minPayoutUsd || 20);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function showNotif(type: "success" | "error", msg: string) {
    setNotif({ type, msg });
    setTimeout(() => setNotif(null), 4000);
  }

  async function handleRequest() {
    setRequesting(true);
    try {
      const res = await fetch("/api/vendor/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showNotif("success", "Payout requested");
      setAmount(""); setNote("");
      await load();
    } catch (err) {
      showNotif("error", err instanceof Error ? err.message : "Failed");
    } finally {
      setRequesting(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_RED }} /></div>;

  const pending = parseFloat(pendingPayout);
  const canRequest = pending >= minPayoutUsd;
  const hasPendingRequest = payouts.some(p => p.status === "pending");

  return (
    <div className="max-w-4xl">
      {notif && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 ${notif.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {notif.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notif.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Earnings</h1>
        <p className="text-gray-500 text-sm">Your revenue and payout history.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Total earned</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-gray-900">${parseFloat(totalEarnings).toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">All time revenue</div>
        </div>
        <div className="bg-gradient-to-br rounded-2xl p-5 text-white" style={{ backgroundImage: `linear-gradient(135deg, ${BRAND_RED} 0%, ${BRAND_RED_DARK} 100%)` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase opacity-90">Available now</span>
            <Wallet className="w-4 h-4 opacity-90" />
          </div>
          <div className="text-2xl md:text-3xl font-black">${pending.toFixed(2)}</div>
          <div className="text-xs opacity-90 mt-1">Ready to request</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Paid out</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-gray-900">${parseFloat(totalPaidOut).toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">Total sent to bank</div>
        </div>
      </div>

      {/* Request payout */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5" style={{ color: BRAND_RED }} />Request payout</h3>

        {hasPendingRequest ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            You have a pending payout request. Please wait for it to be processed before submitting another.
          </div>
        ) : !canRequest ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
            You need at least <strong>${minPayoutUsd}</strong> in your available balance to request a payout. Current balance: <strong>${pending.toFixed(2)}</strong>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-gray-600">
              Make sure your <Link href={`/${locale}/vendor/settings`} className="font-semibold underline" style={{ color: BRAND_RED }}>bank details</Link> are up to date.
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min={minPayoutUsd}
                  max={pending}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder={`Between ${minPayoutUsd} and ${pending.toFixed(2)}`}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
                />
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setAmount(pending.toFixed(2))} className="text-xs font-semibold hover:underline" style={{ color: BRAND_RED }}>Max (${pending.toFixed(2)})</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Note (optional)</label>
                <input type="text" placeholder="Any note for admin" value={note} onChange={e => setNote(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
            <button
              onClick={handleRequest}
              disabled={requesting || !amount || parseFloat(amount) < minPayoutUsd || parseFloat(amount) > pending}
              className="flex items-center gap-2 px-6 py-3 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: BRAND_RED }}
              onMouseOver={e => { if (!requesting) e.currentTarget.style.backgroundColor = BRAND_RED_DARK; }}
              onMouseOut={e => { if (!requesting) e.currentTarget.style.backgroundColor = BRAND_RED; }}
            >
              {requesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Request payout
            </button>
          </div>
        )}
      </div>

      {/* Payout history */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Payout history</h3>
        {payouts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Wallet className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            No payouts yet
          </div>
        ) : (
          <div className="space-y-3">
            {payouts.map(p => (
              <div key={p.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Requested {new Date(p.requestedAt).toLocaleDateString()}</div>
                  <div className="text-lg font-black text-gray-900">${parseFloat(p.amount).toFixed(2)}</div>
                  {p.reference && <div className="text-xs text-gray-500 font-mono mt-1">Ref: {p.reference}</div>}
                </div>
                <PayoutStatus status={p.status} paidAt={p.paidAt} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PayoutStatus({ status, paidAt }: { status: string; paidAt: string | null }) {
  if (status === "paid") {
    return (
      <div className="text-right">
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3" />
          Paid
        </span>
        {paidAt && <div className="text-xs text-gray-500 mt-1">{new Date(paidAt).toLocaleDateString()}</div>}
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-800">
        <XCircle className="w-3 h-3" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800">
      <Clock className="w-3 h-3" />
      Pending
    </span>
  );
}