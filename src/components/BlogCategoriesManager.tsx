"use client";

import { useEffect, useState } from "react";
import type { BlogCategory } from "@/db/schema";
import { Plus, Trash2, Save, X, Tag, Eye, EyeOff, GripVertical } from "lucide-react";

const COLOR_OPTIONS = [
  { value: "bg-purple-100 text-purple-700", label: "Purple", swatch: "bg-purple-500" },
  { value: "bg-blue-100 text-blue-700", label: "Blue", swatch: "bg-blue-500" },
  { value: "bg-red-100 text-red-700", label: "Red", swatch: "bg-red-500" },
  { value: "bg-emerald-100 text-emerald-700", label: "Emerald", swatch: "bg-emerald-500" },
  { value: "bg-amber-100 text-amber-700", label: "Amber", swatch: "bg-amber-500" },
  { value: "bg-pink-100 text-pink-700", label: "Pink", swatch: "bg-pink-500" },
  { value: "bg-indigo-100 text-indigo-700", label: "Indigo", swatch: "bg-indigo-500" },
  { value: "bg-teal-100 text-teal-700", label: "Teal", swatch: "bg-teal-500" },
  { value: "bg-orange-100 text-orange-700", label: "Orange", swatch: "bg-orange-500" },
  { value: "bg-cyan-100 text-cyan-700", label: "Cyan", swatch: "bg-cyan-500" },
  { value: "bg-gray-100 text-gray-700", label: "Gray", swatch: "bg-gray-500" },
];

export default function BlogCategoriesManager() {
  const [cats, setCats] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", nameFr: "", color: COLOR_OPTIONS[0].value, sortOrder: 99, active: true });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog-categories");
      const data = await res.json();
      setCats(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setForm({ name: "", nameFr: "", color: COLOR_OPTIONS[0].value, sortOrder: cats.length + 1, active: true });
    setEditingId(null);
    setShowAdd(false);
  };

  const startEdit = (c: BlogCategory) => {
    setForm({
      name: c.name,
      nameFr: c.nameFr || "",
      color: c.color,
      sortOrder: c.sortOrder,
      active: c.active,
    });
    setEditingId(c.id);
    setShowAdd(true);
  };

  const save = async () => {
    if (!form.name.trim()) { alert("Name required"); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/blog-categories/${editingId}` : "/api/admin/blog-categories";
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
    if (!confirm("Delete this category? Posts using it will show the slug instead.")) return;
    await fetch(`/api/admin/blog-categories/${id}`, { method: "DELETE" });
    await load();
  };

  const toggleActive = async (c: BlogCategory) => {
    await fetch(`/api/admin/blog-categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, active: !c.active }),
    });
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#CA3F2E]" />
            Blog Categories
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage categories used for blog posts. {cats.length} total, {cats.filter(c => c.active).length} active.
          </p>
        </div>
        {!showAdd && (
          <button onClick={() => { reset(); setShowAdd(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-[#CA3F2E] transition">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white border-2 border-[#CA3F2E]/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{editingId ? "Edit Category" : "New Category"}</h3>
            <button onClick={reset} className="text-gray-500 hover:text-gray-900"><X className="w-4 h-4" /></button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Name (EN) *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Business" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
              {!editingId && form.name && (
                <p className="text-[10px] text-gray-500 mt-1">Slug will be: <code className="bg-gray-100 px-1 rounded">{form.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-")}</code></p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Name (FR)</label>
              <input type="text" value={form.nameFr} onChange={(e) => setForm({ ...form, nameFr: e.target.value })} placeholder="Business" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: opt.value })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition ${form.color === opt.value ? "border-gray-900" : "border-gray-200 hover:border-gray-400"}`}
                >
                  <span className={`w-4 h-4 rounded-full ${opt.swatch}`}></span>
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-3">
              <span className="text-xs text-gray-500">Preview: </span>
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${form.color}`}>{form.name || "Category"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-700">Sort Order:</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-[#CA3F2E]" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white rounded-xl text-sm font-bold transition disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : (editingId ? "Update" : "Create Category")}
            </button>
            <button onClick={reset} className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : cats.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No categories yet. Run migration first.</p>
          <a href="/api/admin/migrate-blog-categories" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold">Run Migration</a>
        </div>
      ) : (
        <div className="space-y-2">
          {cats.map(c => (
            <div key={c.id} className={`bg-white border rounded-xl p-4 flex items-center gap-3 transition ${c.active ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <span className="text-xs font-bold text-gray-400 w-6">#{c.sortOrder}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${c.color}`}>{c.name}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 truncate">
                  <span className="font-semibold">{c.name}</span>
                  {c.nameFr && <span className="text-gray-500"> / {c.nameFr}</span>}
                </div>
                <div className="text-[10px] text-gray-400 font-mono">slug: {c.slug}</div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleActive(c)} className={`p-1.5 rounded-lg transition ${c.active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}>
                  {c.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => startEdit(c)} className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg">Edit</button>
                <button onClick={() => remove(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
