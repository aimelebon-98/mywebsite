"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, Loader2, CheckCircle2, AlertCircle, Clock, Play, MessageSquare, Package } from "lucide-react";

const BRAND_RED = "#CA3F2E";
const BRAND_RED_DARK = "#8B2A1E";

interface Request {
  id: string;
  vendorId: string;
  tier: string;
  fee: string;
  productName: string;
  productBrand: string;
  productCategory: string;
  productPrice: string;
  productComparePrice: string | null;
  productMaterial: string;
  productSizes: string;
  productColors: string;
  productStock: number;
  sourceImages: string;
  notes: string;
  status: string;
  adminNote: string;
  createdAt: string;
  completedAt: string | null;
  createdProductId: string | null;
  vendorInfo: { storeName: string; email: string } | null;
}

export default function ConciergeRequestsManager() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [selected, setSelected] = useState<Request | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [createdProductId, setCreatedProductId] = useState("");
  const [processing, setProcessing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const url = filter === "all" ? "/api/admin/concierge-requests" : `/api/admin/concierge-requests?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  async function handleAction(action: string) {
    if (!selected) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/concierge-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: selected.id, action, adminNote, createdProductId: action === "complete" ? createdProductId : undefined }),
      });
      if (!res.ok) throw new Error("Failed");
      setSelected(null);
      setAdminNote("");
      setCreatedProductId("");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setProcessing(false);
    }
  }

  const pendingCount = requests.filter(r => r.status === "pending").length;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {["pending", "in_progress", "needs_info", "completed", "cancelled", "all"].map(f => {
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${active ? "text-white" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"}`} style={active ? { backgroundColor: BRAND_RED } : undefined}>
              {f.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-white" style={{ color: BRAND_RED }}>{pendingCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_RED }} /></div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          No {filter !== "all" ? filter.replace("_", " ") : ""} requests
        </div>
      ) : (
        <div className="grid gap-3">
          {requests.map(r => {
            let imgs: string[] = [];
            try { imgs = JSON.parse(r.sourceImages || "[]"); } catch {}
            return (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
                {imgs[0] ? <img src={imgs[0]} alt="" className="w-16 h-16 rounded-lg object-cover" /> : <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-900 truncate">{r.productName}</h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    <strong>{r.vendorInfo?.storeName || "Unknown vendor"}</strong> &middot; {r.vendorInfo?.email}
                  </div>
                  <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2">
                    <span>Tier: {r.tier}</span>
                    <span>&middot; Fee: ${parseFloat(r.fee).toFixed(2)}</span>
                    <span>&middot; Price: ${parseFloat(r.productPrice).toFixed(2)}</span>
                    <span>&middot; {imgs.length} images</span>
                    <span>&middot; {new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button onClick={() => { setSelected(r); setAdminNote(r.adminNote); setCreatedProductId(r.createdProductId || ""); }} className="px-4 py-2 text-white text-sm font-semibold rounded-lg" style={{ backgroundColor: BRAND_RED }}>Review</button>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">{selected.productName}</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div><div className="text-xs text-gray-500 uppercase font-semibold">Vendor</div><div className="font-semibold">{selected.vendorInfo?.storeName}</div></div>
                <div><div className="text-xs text-gray-500 uppercase font-semibold">Email</div><div className="font-semibold break-all text-xs">{selected.vendorInfo?.email}</div></div>
                <div><div className="text-xs text-gray-500 uppercase font-semibold">Tier</div><div className="font-semibold">{selected.tier} - ${parseFloat(selected.fee).toFixed(2)}</div></div>
                <div><div className="text-xs text-gray-500 uppercase font-semibold">Brand</div><div className="font-semibold">{selected.productBrand || "-"}</div></div>
                <div><div className="text-xs text-gray-500 uppercase font-semibold">Category</div><div className="font-semibold">{selected.productCategory}</div></div>
                <div><div className="text-xs text-gray-500 uppercase font-semibold">Price</div><div className="font-semibold">${parseFloat(selected.productPrice).toFixed(2)}</div></div>
                <div><div className="text-xs text-gray-500 uppercase font-semibold">Compare</div><div className="font-semibold">{selected.productComparePrice ? "$" + parseFloat(selected.productComparePrice).toFixed(2) : "-"}</div></div>
                <div><div className="text-xs text-gray-500 uppercase font-semibold">Stock</div><div className="font-semibold">{selected.productStock}</div></div>
                <div><div className="text-xs text-gray-500 uppercase font-semibold">Material</div><div className="font-semibold text-xs">{selected.productMaterial || "-"}</div></div>
              </div>

              {(() => { let sizes: string[] = []; try { sizes = JSON.parse(selected.productSizes || "[]"); } catch {}; return sizes.length > 0 ? (
                <div><div className="text-xs text-gray-500 uppercase font-semibold mb-1">Sizes</div><div className="flex flex-wrap gap-1">{sizes.map(s => <span key={s} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{s}</span>)}</div></div>
              ) : null; })()}

              {(() => { let colors: string[] = []; try { colors = JSON.parse(selected.productColors || "[]"); } catch {}; return colors.length > 0 ? (
                <div><div className="text-xs text-gray-500 uppercase font-semibold mb-1">Colors</div><div className="flex flex-wrap gap-1">{colors.map(c => <span key={c} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{c}</span>)}</div></div>
              ) : null; })()}

              {(() => { let imgs: string[] = []; try { imgs = JSON.parse(selected.sourceImages || "[]"); } catch {}; return imgs.length > 0 ? (
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-2">Source images ({imgs.length})</div>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {imgs.map((url, idx) => <a key={idx} href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt="" className="w-full aspect-square object-cover rounded-lg hover:opacity-80" /></a>)}
                  </div>
                </div>
              ) : null; })()}

              {selected.notes && (
                <div className="bg-blue-50 border-l-4 border-blue-300 p-3 rounded"><div className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" />Vendor note</div><div className="text-sm text-blue-900 whitespace-pre-wrap">{selected.notes}</div></div>
              )}

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin note (visible to vendor)</label>
                  <textarea rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none" />
                </div>

                {selected.status === "pending" || selected.status === "in_progress" || selected.status === "needs_info" ? (
                  <>
                    {(selected.status === "in_progress" || selected.status === "pending") && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Created product ID (when completing)</label>
                        <input type="text" placeholder="Paste UUID of the product you created" value={createdProductId} onChange={e => setCreatedProductId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono" />
                        <p className="text-xs text-gray-500 mt-1">Create the product normally in Products tab, then paste its ID here and complete.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selected.status === "pending" && (
                        <button onClick={() => handleAction("in_progress")} disabled={processing} className="px-3 py-2.5 text-sm font-semibold rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50 flex items-center justify-center gap-1"><Play className="w-3.5 h-3.5" />Start</button>
                      )}
                      <button onClick={() => handleAction("needs_info")} disabled={processing || !adminNote.trim()} className="px-3 py-2.5 text-sm font-semibold rounded-lg bg-orange-100 text-orange-800 hover:bg-orange-200 disabled:opacity-50 flex items-center justify-center gap-1"><AlertCircle className="w-3.5 h-3.5" />Needs info</button>
                      <button onClick={() => handleAction("cancel")} disabled={processing} className="px-3 py-2.5 text-sm font-semibold rounded-lg bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50 flex items-center justify-center gap-1"><X className="w-3.5 h-3.5" />Cancel</button>
                      <button onClick={() => handleAction("complete")} disabled={processing} className="px-3 py-2.5 text-sm font-semibold text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1 bg-green-600"><CheckCircle2 className="w-3.5 h-3.5" />Complete</button>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 italic">This request is {selected.status.replace("_", " ")} - no further actions.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending: { label: "Pending", bg: "bg-yellow-100", color: "text-yellow-800" },
    in_progress: { label: "In progress", bg: "bg-blue-100", color: "text-blue-800" },
    needs_info: { label: "Needs info", bg: "bg-orange-100", color: "text-orange-800" },
    completed: { label: "Completed", bg: "bg-green-100", color: "text-green-800" },
    cancelled: { label: "Cancelled", bg: "bg-red-100", color: "text-red-800" },
  };
  const m = map[status] || map.pending;
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.bg} ${m.color}`}>{m.label}</span>;
}