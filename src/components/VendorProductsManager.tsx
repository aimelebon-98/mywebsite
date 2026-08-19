"use client";

import { useEffect, useState } from "react";
import { Package, Loader2, X, Check, Ban, MessageSquare, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";

const BRAND_RED = "#CA3F2E";

interface Item {
  id: string;
  productId: string;
  vendorId: string;
  status: string;
  adminNote: string;
  submittedAt: string;
  vendor: { storeName: string; email: string; storeSlug: string; contactName: string } | null;
  product: {
    name: string;
    nameFr: string | null;
    slug: string;
    price: string;
    comparePrice: string | null;
    category: string;
    brand: string;
    material: string;
    stock: number;
    imageUrl: string;
    images: string;
    sizes: string;
    colors: string;
    shortDescription: string;
    longDescription: string;
    shortDescriptionFr: string | null;
    longDescriptionFr: string | null;
    seoTitle: string | null;
    metaDescription: string | null;
    focusKeyphrase: string | null;
    originCountry: string;
    originCity: string;
    active: boolean;
  };
}

export default function VendorProductsManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [selected, setSelected] = useState<Item | null>(null);
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const url = filter === "all" ? "/api/admin/vendor-products" : `/api/admin/vendor-products?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(data.items || []);
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

  async function handleAction(action: "approve" | "reject" | "suspend") {
    if (!selected) return;
    if (action === "reject" && !note.trim()) {
      showNotif("error", "Rejection reason required");
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/vendor-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorProductId: selected.id, action, adminNote: note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showNotif("success", action === "approve" ? "Product approved & live" : action === "reject" ? "Product rejected" : "Product suspended");
      setSelected(null);
      setNote("");
      await load();
    } catch (err) {
      showNotif("error", err instanceof Error ? err.message : "Failed");
    } finally {
      setProcessing(false);
    }
  }

  const pendingCount = items.filter(i => i.status === "pending").length;

  return (
    <div>
      {notif && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 ${notif.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {notif.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notif.msg}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {["pending", "approved", "rejected", "suspended", "all"].map(f => {
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
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          No {filter !== "all" ? filter : ""} vendor products
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map(it => (
            <div key={it.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
              {it.product.imageUrl ? (
                <img src={it.product.imageUrl} alt={it.product.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><Package className="w-6 h-6 text-gray-400" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-gray-900 truncate">{it.product.name}</h3>
                  <StatusBadge status={it.status} />
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  by <strong>{it.vendor?.storeName || "Unknown"}</strong> ({it.vendor?.email})
                </div>
                <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2">
                  <span>${parseFloat(it.product.price).toFixed(2)}</span>
                  <span>&middot; {it.product.category}</span>
                  <span>&middot; Stock: {it.product.stock}</span>
                  {it.product.brand && <span>&middot; {it.product.brand}</span>}
                  <span>&middot; {new Date(it.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => { setSelected(it); setNote(it.adminNote || ""); }} className="px-4 py-2 text-white text-sm font-semibold rounded-lg" style={{ backgroundColor: BRAND_RED }}>Review</button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">{selected.product.name}</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Images */}
              {(() => { let imgs: string[] = []; try { imgs = JSON.parse(selected.product.images || "[]"); } catch {}; return imgs.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {imgs.map((u, i) => <a key={i} href={u} target="_blank" rel="noopener noreferrer"><img src={u} alt="" className="w-full aspect-square object-cover rounded-lg hover:opacity-80" /></a>)}
                </div>
              ) : null; })()}

              {/* Vendor info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
                <div className="font-bold text-blue-900">Vendor: {selected.vendor?.storeName}</div>
                <div className="text-xs text-blue-800 mt-0.5">{selected.vendor?.email} &middot; {selected.vendor?.contactName}</div>
                <a href={`/en/store/${selected.vendor?.storeSlug}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold inline-flex items-center gap-1 mt-1 text-blue-700 hover:underline">
                  <ExternalLink className="w-3 h-3" />View store
                </a>
              </div>

              {/* Product details grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 rounded-xl p-4 text-sm">
                <InfoItem label="Price">${parseFloat(selected.product.price).toFixed(2)}</InfoItem>
                {selected.product.comparePrice && <InfoItem label="Compare">${parseFloat(selected.product.comparePrice).toFixed(2)}</InfoItem>}
                <InfoItem label="Stock">{selected.product.stock}</InfoItem>
                <InfoItem label="Category">{selected.product.category}</InfoItem>
                <InfoItem label="Brand">{selected.product.brand || "-"}</InfoItem>
                <InfoItem label="Material">{selected.product.material || "-"}</InfoItem>
                <InfoItem label="Origin">{selected.product.originCity}, {selected.product.originCountry}</InfoItem>
              </div>

              {/* Sizes / Colors */}
              <div className="grid grid-cols-2 gap-4">
                {(() => { let s: string[] = []; try { s = JSON.parse(selected.product.sizes || "[]"); } catch {}; return s.length > 0 ? (
                  <div><div className="text-xs font-bold text-gray-500 uppercase mb-1">Sizes</div><div className="flex flex-wrap gap-1">{s.map(x => <span key={x} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{x}</span>)}</div></div>
                ) : null; })()}
                {(() => { let c: Array<{ name: string }> = []; try { c = JSON.parse(selected.product.colors || "[]"); } catch {}; return c.length > 0 ? (
                  <div><div className="text-xs font-bold text-gray-500 uppercase mb-1">Colors</div><div className="flex flex-wrap gap-1">{c.map((x, i) => <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{x.name}</span>)}</div></div>
                ) : null; })()}
              </div>

              {/* Descriptions */}
              {selected.product.shortDescription && (
                <div><div className="text-xs font-bold text-gray-500 uppercase mb-1">Short description (EN)</div><div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selected.product.shortDescription}</div></div>
              )}
              {selected.product.shortDescriptionFr && (
                <div><div className="text-xs font-bold text-gray-500 uppercase mb-1">Short description (FR)</div><div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selected.product.shortDescriptionFr}</div></div>
              )}
              {selected.product.longDescription && (
                <div><div className="text-xs font-bold text-gray-500 uppercase mb-1">Full description (EN)</div><div className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">{selected.product.longDescription}</div></div>
              )}

              {/* SEO */}
              {(selected.product.seoTitle || selected.product.metaDescription) && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs">
                  <div className="font-bold text-purple-900 mb-1">SEO metadata</div>
                  {selected.product.seoTitle && <div className="mb-1"><strong>Title:</strong> {selected.product.seoTitle}</div>}
                  {selected.product.metaDescription && <div className="mb-1"><strong>Meta:</strong> {selected.product.metaDescription}</div>}
                  {selected.product.focusKeyphrase && <div><strong>Keyphrase:</strong> {selected.product.focusKeyphrase}</div>}
                </div>
              )}

              {/* Admin note */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Admin note (shown to vendor)</label>
                <textarea rows={3} placeholder="Required for rejection. Optional for approval." value={note} onChange={e => setNote(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none" />
              </div>

              {/* Actions */}
              {selected.status === "pending" || selected.status === "rejected" || selected.status === "suspended" ? (
                <div className="grid grid-cols-3 gap-2 border-t border-gray-200 pt-4">
                  <button onClick={() => handleAction("reject")} disabled={processing} className="px-3 py-2.5 text-sm font-semibold rounded-lg bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50 flex items-center justify-center gap-1"><X className="w-4 h-4" />Reject</button>
                  <button onClick={() => handleAction("suspend")} disabled={processing} className="px-3 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center gap-1"><Ban className="w-4 h-4" />Suspend</button>
                  <button onClick={() => handleAction("approve")} disabled={processing} className="px-3 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1 bg-green-600"><Check className="w-4 h-4" />Approve &amp; Live</button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4">
                  <button onClick={() => handleAction("suspend")} disabled={processing} className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50 flex items-center justify-center gap-1"><Ban className="w-4 h-4" />Suspend (hide from site)</button>
                </div>
              )}
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
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    suspended: "bg-gray-200 text-gray-800",
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
}