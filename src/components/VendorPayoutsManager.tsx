"use client";

import { useEffect, useState } from "react";
import { Wallet, Loader2, X, CheckCircle2, AlertCircle, Copy, DollarSign } from "lucide-react";

const BRAND_RED = "#CA3F2E";

interface Payout {
  id: string;
  vendorId: string;
  amount: string;
  currency: string;
  method: string;
  reference: string;
  note: string;
  status: string;
  requestedAt: string;
  paidAt: string | null;
  vendor: { storeName: string; email: string; bankName: string; bankAccount: string; bankAccountName: string; contactName: string } | null;
}

export default function VendorPayoutsManager() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [selected, setSelected] = useState<Payout | null>(null);
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const url = filter === "all" ? "/api/admin/vendor-payouts" : `/api/admin/vendor-payouts?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setPayouts(data.payouts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  function showNotif(type: "success" | "error", msg: string) {
    setNotif({ type, msg });
    setTimeout(() => setNotif(null), 3500);
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  async function handleAction(action: "mark_paid" | "reject") {
    if (!selected) return;
    if (action === "mark_paid" && !reference.trim()) {
      showNotif("error", "Bank reference required");
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/vendor-payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId: selected.id, action, reference, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showNotif("success", data.message);
      setSelected(null);
      setReference("");
      setNote("");
      await load();
    } catch (err) {
      showNotif("error", err instanceof Error ? err.message : "Failed");
    } finally {
      setProcessing(false);
    }
  }

  const pendingCount = payouts.filter(p => p.status === "pending").length;

  return (
    <div>
      {notif && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 ${notif.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {notif.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notif.msg}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {["pending", "paid", "rejected", "all"].map(f => {
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${active ? "text-white" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"}`} style={active ? { backgroundColor: BRAND_RED } : undefined}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "pending" && pendingCount > 0 && <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-white" style={{ color: BRAND_RED }}>{pendingCount}</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_RED }} /></div>
      ) : payouts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          No {filter !== "all" ? filter : ""} payouts
        </div>
      ) : (
        <div className="grid gap-3">
          {payouts.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between flex-wrap gap-3 hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-gray-900">{p.vendor?.storeName || "Unknown vendor"}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-xs text-gray-500">{p.vendor?.email} &middot; {new Date(p.requestedAt).toLocaleString()}</div>
                {p.note && <div className="text-xs text-gray-600 mt-1 italic">"{p.note}"</div>}
              </div>
              <div className="text-right">
                <div className="text-2xl font-black" style={{ color: BRAND_RED }}>${parseFloat(p.amount).toFixed(2)}</div>
                <button onClick={() => { setSelected(p); setReference(p.reference || ""); setNote(""); }} className="mt-2 px-4 py-2 text-white text-sm font-semibold rounded-lg" style={{ backgroundColor: BRAND_RED }}>Process</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payout request</h2>
                <div className="text-xs text-gray-500">{selected.vendor?.storeName}</div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Amount */}
              <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: "#FEF2F0" }}>
                <div className="text-xs font-bold uppercase text-gray-600 mb-1">Amount to pay</div>
                <div className="text-4xl font-black" style={{ color: BRAND_RED }}>${parseFloat(selected.amount).toFixed(2)}</div>
                <div className="text-xs text-gray-500 mt-1">{selected.currency}</div>
              </div>

              {/* Bank details with copy */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs font-bold text-gray-500 uppercase mb-3">Bank details</div>
                <div className="space-y-2">
                  <BankRow label="Bank" value={selected.vendor?.bankName || "-"} copyKey="bank" copied={copied === "bank"} onCopy={() => copyText(selected.vendor?.bankName || "", "bank")} />
                  <BankRow label="Account Number" value={selected.vendor?.bankAccount || "-"} copyKey="acct" copied={copied === "acct"} onCopy={() => copyText(selected.vendor?.bankAccount || "", "acct")} mono />
                  <BankRow label="Account Name" value={selected.vendor?.bankAccountName || "-"} copyKey="name" copied={copied === "name"} onCopy={() => copyText(selected.vendor?.bankAccountName || "", "name")} />
                </div>
              </div>

              {/* Vendor note */}
              {selected.note && (
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Vendor note</div>
                  <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selected.note}</div>
                </div>
              )}

              {selected.status === "pending" && (
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Bank reference / transaction ID *</label>
                    <input type="text" placeholder="e.g. TRX-2026-001234" value={reference} onChange={e => setReference(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Note (optional)</label>
                    <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { if (confirm("Reject this payout request?")) handleAction("reject"); }} disabled={processing} className="px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50 flex items-center justify-center gap-1"><X className="w-4 h-4" />Reject</button>
                    <button onClick={() => handleAction("mark_paid")} disabled={processing || !reference.trim()} className="px-4 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1 bg-green-600"><CheckCircle2 className="w-4 h-4" />Mark as paid</button>
                  </div>
                </div>
              )}

              {selected.status !== "pending" && (
                <div className="border-t border-gray-200 pt-4 text-sm">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Reference</div>
                  <div className="font-mono text-gray-900">{selected.reference || "-"}</div>
                  {selected.paidAt && <div className="text-xs text-gray-500 mt-2">Paid: {new Date(selected.paidAt).toLocaleString()}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BankRow({ label, value, copyKey, copied, onCopy, mono }: { label: string; value: string; copyKey: string; copied: boolean; onCopy: () => void; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className="text-xs text-gray-500 font-semibold uppercase">{label}</div>
        <div className={"text-sm font-semibold text-gray-900 truncate" + (mono ? " font-mono" : "")}>{value}</div>
      </div>
      <button onClick={onCopy} className="p-2 hover:bg-gray-200 rounded-lg text-gray-600" title="Copy">
        {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
}