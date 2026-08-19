"use client";

import { useEffect, useState } from "react";
import { Store, Loader2, Mail, Phone, MapPin, Ban, Play, Edit2, DollarSign, X, Percent, CheckCircle2, AlertCircle, ExternalLink, Wallet, Package } from "lucide-react";

const BRAND_RED = "#CA3F2E";

interface Vendor {
  id: string;
  email: string;
  storeName: string;
  storeSlug: string;
  contactName: string;
  phone: string;
  country: string;
  city: string;
  status: string;
  commissionRate: string;
  totalSales: number;
  totalEarnings: string;
  pendingPayout: string;
  totalPaidOut: string;
  fulfillmentRate: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  adminNote: string;
  approvedAt: string | null;
  createdAt: string;
  conciergeDebt?: string;
  conciergePaidTotal?: string;
}

export default function VendorsManager() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [editCommission, setEditCommission] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [settleAmount, setSettleAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const url = filter === "all" ? "/api/admin/vendors" : `/api/admin/vendors?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setVendors(data.vendors || []);
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

  async function doAction(action: string, payload: Record<string, unknown> = {}) {
    if (!selected) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: selected.id, action, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showNotif("success", data.message || "Updated");
      await load();
      // Refresh selected vendor
      const [fresh] = (await fetch("/api/admin/vendors").then(r => r.json())).vendors.filter((v: Vendor) => v.id === selected.id);
      if (fresh) setSelected(fresh);
    } catch (err) {
      showNotif("error", err instanceof Error ? err.message : "Failed");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div>
      {notif && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 ${notif.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {notif.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notif.msg}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "approved", "suspended", "rejected"].map(f => {
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${active ? "text-white" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"}`} style={active ? { backgroundColor: BRAND_RED } : undefined}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_RED }} /></div>
      ) : vendors.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500">
          <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          No {filter !== "all" ? filter : ""} vendors
        </div>
      ) : (
        <div className="grid gap-3">
          {vendors.map(v => (
            <div key={v.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between flex-wrap gap-3 hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{v.storeName}</h3>
                  <StatusBadge status={v.status} />
                  <span className="text-xs text-gray-500">{v.commissionRate}% commission</span>
                  {parseFloat(v.conciergeDebt || "0") > 0 && (
                    <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                      ${parseFloat(v.conciergeDebt || "0").toFixed(2)} concierge debt
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-2">by {v.contactName || v.email}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1"><DollarSign className="w-3 h-3" /><span>{v.totalSales} sales</span></div>
                  <div className="flex items-center gap-1"><Wallet className="w-3 h-3" /><span>${parseFloat(v.pendingPayout || "0").toFixed(2)} pending</span></div>
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{v.city || "-"}, {v.country}</div>
                  <div className="flex items-center gap-1"><Mail className="w-3 h-3" /><span className="truncate">{v.email}</span></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/en/store/${v.storeSlug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="View store"><ExternalLink className="w-4 h-4" /></a>
                <button onClick={() => { setSelected(v); setEditCommission(v.commissionRate); setAdminNote(v.adminNote || ""); setSettleAmount(""); }} className="px-4 py-2 text-white text-sm font-semibold rounded-lg" style={{ backgroundColor: BRAND_RED }}>Manage</button>
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
                <h2 className="text-xl font-bold text-gray-900">{selected.storeName}</h2>
                <div className="text-xs text-gray-500 mt-0.5">/{selected.storeSlug}</div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <InfoItem label="Status"><StatusBadge status={selected.status} /></InfoItem>
                <InfoItem label="Contact">{selected.contactName || "-"}</InfoItem>
                <InfoItem label="Email"><span className="break-all text-xs">{selected.email}</span></InfoItem>
                <InfoItem label="Phone">{selected.phone || "-"}</InfoItem>
                <InfoItem label="Country">{selected.country}</InfoItem>
                <InfoItem label="City">{selected.city || "-"}</InfoItem>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-xs font-bold text-blue-800 uppercase">Sales</div>
                  <div className="text-xl font-black text-blue-900 mt-1">{selected.totalSales}</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "#FEF2F0" }}>
                  <div className="text-xs font-bold uppercase" style={{ color: BRAND_RED }}>Earnings</div>
                  <div className="text-xl font-black mt-1" style={{ color: BRAND_RED }}>${parseFloat(selected.totalEarnings || "0").toFixed(2)}</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <div className="text-xs font-bold text-orange-800 uppercase">Pending Payout</div>
                  <div className="text-xl font-black text-orange-900 mt-1">${parseFloat(selected.pendingPayout || "0").toFixed(2)}</div>
                </div>
              </div>

              {/* Bank details */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs font-bold text-gray-500 uppercase mb-2">Bank details</div>
                {selected.bankAccount ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <InfoItem label="Bank">{selected.bankName}</InfoItem>
                    <InfoItem label="Account">{selected.bankAccount}</InfoItem>
                    <InfoItem label="Name">{selected.bankAccountName}</InfoItem>
                  </div>
                ) : <div className="text-xs text-gray-500 italic">Not set</div>}
              </div>

              {/* Commission editor */}
              <div className="border-t border-gray-200 pt-4">
                <div className="text-xs font-bold text-gray-500 uppercase mb-2">Commission rate</div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="number" min="0" max="100" step="0.5" value={editCommission} onChange={e => setEditCommission(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <button onClick={() => doAction("update_commission", { commissionRate: parseFloat(editCommission) })} disabled={processing || editCommission === selected.commissionRate} className="px-4 py-2.5 text-white text-sm font-semibold rounded-lg disabled:opacity-50" style={{ backgroundColor: BRAND_RED }}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Vendor keeps {(100 - parseFloat(editCommission || "0")).toFixed(1)}% of each sale</p>
              </div>

              {/* Concierge debt */}
              {parseFloat(selected.conciergeDebt || "0") > 0 && (
                <div className="border-t border-gray-200 pt-4 bg-orange-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-2xl">
                  <div className="text-xs font-bold text-orange-800 uppercase mb-2">Concierge debt (${parseFloat(selected.conciergeDebt || "0").toFixed(2)})</div>
                  <div className="text-xs text-orange-700 mb-3">
                    Total paid so far: ${parseFloat(selected.conciergePaidTotal || "0").toFixed(2)}
                  </div>
                  <div className="flex gap-2">
                    <input type="number" step="0.01" min="0" max={parseFloat(selected.conciergeDebt || "0")} placeholder="Amount to settle" value={settleAmount} onChange={e => setSettleAmount(e.target.value)} className="flex-1 px-3 py-2 border border-orange-300 rounded-lg text-sm" />
                    <button onClick={() => setSettleAmount(parseFloat(selected.conciergeDebt || "0").toFixed(2))} className="px-3 py-2 bg-white border border-orange-300 rounded-lg text-xs font-semibold text-orange-800">Full</button>
                    <button onClick={() => doAction("settle_concierge_debt", { settleAmount: parseFloat(settleAmount) })} disabled={processing || !settleAmount || parseFloat(settleAmount) <= 0} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50">Mark paid</button>
                  </div>
                </div>
              )}

              {/* Admin note */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Admin note (internal)</label>
                <textarea rows={3} value={adminNote} onChange={e => setAdminNote(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none" />
                <button onClick={() => doAction("update_note", { adminNote })} disabled={processing} className="mt-2 px-4 py-2 text-xs font-semibold text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: BRAND_RED }}>Save note</button>
              </div>

              {/* Status actions */}
              <div className="border-t border-gray-200 pt-4">
                <div className="text-xs font-bold text-gray-500 uppercase mb-2">Account actions</div>
                {selected.status === "approved" ? (
                  <button onClick={() => { if (confirm("Suspend this vendor? All their products will be hidden from the site.")) doAction("suspend"); }} disabled={processing} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-800 font-semibold rounded-lg text-sm disabled:opacity-50">
                    <Ban className="w-4 h-4" />Suspend vendor + hide all products
                  </button>
                ) : selected.status === "suspended" ? (
                  <button onClick={() => { if (confirm("Reactivate this vendor? Approved products will be visible again.")) doAction("reactivate"); }} disabled={processing} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-100 hover:bg-green-200 text-green-800 font-semibold rounded-lg text-sm disabled:opacity-50">
                    <Play className="w-4 h-4" />Reactivate vendor + restore products
                  </button>
                ) : (
                  <div className="text-xs text-gray-500 italic">No actions for {selected.status} vendor</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 uppercase mb-0.5">{label}</div>
      <div className="text-gray-900 font-medium">{children}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-800",
    suspended: "bg-gray-200 text-gray-800",
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
}