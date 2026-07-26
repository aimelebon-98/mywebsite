"use client";

import { useEffect, useState } from "react";
import type { Bundle } from "@/db/schema";
import { Plus, Trash2, Save, X, Gift, Eye, EyeOff, Percent, Package } from "lucide-react";

export default function BundlesManager() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    nameFr: "",
    description: "",
    descriptionFr: "",
    minItems: 2,
    discountPercent: 15,
    category: "",
    priority: 0,
    active: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bundles");
      const data = await res.json();
      setBundles(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setForm({ name: "", nameFr: "", description: "", descriptionFr: "", minItems: 2, discountPercent: 15, category: "", priority: 0, active: true });
    setEditingId(null);
    setShowAdd(false);
  };

  const startEdit = (b: Bundle) => {
    setForm({
      name: b.name,
      nameFr: b.nameFr || "",
      description: b.description || "",
      descriptionFr: b.descriptionFr || "",
      minItems: b.minItems,
      discountPercent: b.discountPercent,
      category: b.category || "",
      priority: b.priority,
      active: b.active,
    });
    setEditingId(b.id);
    setShowAdd(true);
  };

  const save = async () => {
    if (!form.name.trim()) { alert("Name required"); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/bundles/${editingId}` : "/api/admin/bundles";
      await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      await load();
      reset();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this bundle?")) return;
    await fetch(`/api/admin/bundles/${id}`, { method: "DELETE" });
    await load();
  };

  const toggleActive = async (b: Bundle) => {
    await fetch(`/api/admin/bundles/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...b, active: !b.active }),
    });
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#CA3F2E]" />
            Bundle Deals
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Auto-apply discounts when customers add multiple items. {bundles.length} total, {bundles.filter(b => b.active).length} active.
          </p>
        </div>
        {!showAdd && (
          <button
            onClick={() => { reset(); setShowAdd(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-[#CA3F2E] transition"
          >
            <Plus className="w-4 h-4" /> Add Bundle
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white border-2 border-[#CA3F2E]/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{editingId ? "Edit Bundle" : "New Bundle"}</h3>
            <button onClick={reset} className="text-gray-500 hover:text-gray-900"><X className="w-4 h-4" /></button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">English</div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Buy 2 Get 15% Off" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" placeholder="Add any 2 items..." />
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Français</div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Nom (FR)</label>
                <input type="text" value={form.nameFr} onChange={(e) => setForm({ ...form, nameFr: e.target.value })} placeholder="Achetez 2 - 15%" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Description (FR)</label>
                <textarea value={form.descriptionFr} onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block flex items-center gap-1"><Package className="w-3 h-3" /> Min Items</label>
              <input type="number" min="2" value={form.minItems} onChange={(e) => setForm({ ...form, minItems: parseInt(e.target.value) || 2 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block flex items-center gap-1"><Percent className="w-3 h-3" /> Discount %</label>
              <input type="number" min="1" max="99" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: parseInt(e.target.value) || 10 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Category (optional)</label>
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. sneakers" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Priority</label>
              <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-[#CA3F2E]" />
            <span className="text-sm text-gray-700">Active (auto-applies at checkout)</span>
          </label>

          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white rounded-xl text-sm font-bold transition disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : (editingId ? "Update" : "Create Bundle")}
            </button>
            <button onClick={reset} className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : bundles.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No bundles yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bundles.map(b => (
            <div key={b.id} className={`bg-white border rounded-xl p-4 flex items-center gap-4 transition ${b.active ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] flex items-center justify-center text-white font-black text-lg shadow-md">
                -{b.discountPercent}%
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-gray-900">{b.name}</div>
                {b.nameFr && <div className="text-xs text-gray-500">{b.nameFr}</div>}
                <div className="text-[11px] text-gray-500 mt-1">
                  Buy {b.minItems}+ items {b.category && `in ${b.category}`} - Priority {b.priority}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleActive(b)} className={`p-1.5 rounded-lg transition ${b.active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}>
                  {b.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => startEdit(b)} className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg">Edit</button>
                <button onClick={() => remove(b.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
