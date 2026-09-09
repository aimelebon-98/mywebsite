"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Loader2,
  X,
  Check,
  Ban,
  MessageSquare,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Square,
} from "lucide-react";

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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  function showNotif(type: "success" | "error", msg: string) {
    setNotif({ type, msg });
    setTimeout(() => setNotif(null), 3500);
  }

  async function load() {
    setLoading(true);
    try {
      const url = filter === "all" ? "/api/admin/vendor-products" : `/api/admin/vendor-products?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(data.items || []);
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === items.length) setSelectedIds([]);
    else setSelectedIds(items.map((i) => i.id));
  }

  async function bulkAction(action: "approve" | "reject" | "suspend") {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to ${action} ${selectedIds.length} product${
          selectedIds.length === 1 ? "" : "s"
        }?`
      )
    ) {
      return;
    }
    setBulkProcessing(true);
    try {
      const res = await fetch("/api/admin/vendor-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorProductIds: selectedIds,
          action,
          adminNote: action === "reject" ? "Bulk rejected by admin" : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk action failed");
      showNotif("success", data.message || "Bulk update done");
      setSelectedIds([]);
      await load();
    } catch (err) {
      showNotif("error", err instanceof Error ? err.message : "Failed");
    } finally {
      setBulkProcessing(false);
    }
  }

  async function handleAction(action: "approve" | "reject" | "suspend") {
    if (!selected) return;
    if (action === "reject" && !note.trim()) {
      alert("Please provide a reason for rejection");
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
      showNotif("success", data.message || "Updated");
      setSelected(null);
      await load();
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
        {["pending", "approved", "rejected", "suspended", "all"].map(f => {
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${active ? "text-white" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"}`} style={active ? { backgroundColor: BRAND_RED } : undefined}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          );
        })}
      </div>

      {/* SELECT ALL BAR */}
      {items.length > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              {selectedIds.length === items.length && items.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-gray-900" />
              ) : selectedIds.length > 0 ? (
                <div className="w-4 h-4 rounded border-2 border-gray-900 bg-gray-900 flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-white"></div>
                </div>
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span className="font-semibold text-gray-900">
                {selectedIds.length === items.length && items.length > 0
                  ? "Deselect all"
                  : "Select all"}
              </span>
            </button>
            <span className="text-xs text-gray-500 ml-2">
              {items.length} visible
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-gray-700 mr-2">
                {selectedIds.length} selected:
              </span>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => bulkAction("approve")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-40"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => bulkAction("suspend")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-40"
              >
                Suspend
              </button>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => bulkAction("reject")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-40"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}

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
            <div key={it.id} className={`bg-white rounded-xl border p-4 flex items-start gap-4 hover:shadow-md transition-shadow ${selectedIds.includes(it.id) ? "border-[#CA3F2E] ring-1 ring-[#CA3F2E]/30" : "border-gray-200"}`}>
              <button
                type="button"
                onClick={() => toggleSelect(it.id)}
                className="mt-1 flex-shrink-0 text-gray-400 hover:text-[#CA3F2E]"
              >
                {selectedIds.includes(it.id) ? (
                  <CheckSquare className="w-5 h-5 text-[#CA3F2E]" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
              {it.product.imageUrl ? (
                <img src={it.product.imageUrl} alt={it.product.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><Package className="w-6 h-6 text-gray-400" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-gray-900 truncate">{it.product.name}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${it.status === "approved" ? "bg-green-100 text-green-800" : it.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{it.status}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">by <strong>{it.vendor?.storeName || "Unknown"}</strong> ({it.vendor?.email})</div>
                <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2">
                  <span>${parseFloat(it.product.price).toFixed(2)}</span>
                  <span>&middot; {it.product.category}</span>
                  <span>&middot; Stock: {it.product.stock}</span>
                </div>
              </div>
              <button onClick={() => { setSelected(it); setNote(it.adminNote || ""); }} className="px-4 py-2 text-white text-sm font-semibold rounded-lg" style={{ backgroundColor: BRAND_RED }}>Review</button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">{selected.product.name}</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin Note / Reason</label>
              <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Reason for rejection or note..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleAction("reject")} disabled={processing} className="flex-1 py-2.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl text-sm disabled:opacity-50">Reject</button>
              <button onClick={() => handleAction("approve")} disabled={processing} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm disabled:opacity-50">Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}