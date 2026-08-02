"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Ticket, Plus, Edit, Trash2, Loader2, X, Search, RefreshCw,
  CheckCircle, AlertTriangle, Calendar, Percent, DollarSign, Copy, Gift
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: string;
  minOrder: string;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  description: string;
  descriptionFr: string | null;
  isWelcome: boolean;
  createdAt: string;
}

interface FormData {
  code: string;
  type: "percent" | "fixed";
  value: string;
  minOrder: string;
  maxUses: string;
  expiresAt: string;
  active: boolean;
  description: string;
  descriptionFr: string;
  isWelcome: boolean;
}

const EMPTY_FORM: FormData = {
  code: "", type: "percent", value: "10", minOrder: "0", maxUses: "",
  expiresAt: "", active: true, description: "", descriptionFr: "", isWelcome: false,
};

export default function CouponsManager({ onNotify }: { onNotify: (msg: string, type?: "success" | "error") => void }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openAddForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      type: c.type === "fixed" ? "fixed" : "percent",
      value: c.value,
      minOrder: c.minOrder,
      maxUses: c.maxUses !== null ? String(c.maxUses) : "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      active: c.active,
      description: c.description,
      descriptionFr: c.descriptionFr || "",
      isWelcome: c.isWelcome,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      onNotify("Code is required", "error");
      return;
    }
    if (!form.value || parseFloat(form.value) <= 0) {
      onNotify("Value must be greater than 0", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: form.value,
        minOrder: form.minOrder,
        maxUses: form.maxUses || null,
        expiresAt: form.expiresAt || null,
        active: form.active,
        description: form.description,
        descriptionFr: form.descriptionFr || null,
        isWelcome: form.isWelcome,
      };
      const url = editing ? "/api/admin/coupons/" + editing.id : "/api/admin/coupons";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        onNotify(editing ? "Coupon updated" : "Coupon created", "success");
        closeForm();
        fetchCoupons();
      } else {
        onNotify(data.error || "Failed to save", "error");
      }
    } catch {
      onNotify("Failed to save coupon", "error");
    }
    setSaving(false);
  };

  const handleDelete = async (c: Coupon) => {
    if (!confirm("Delete coupon " + c.code + "? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/admin/coupons/" + c.id, { method: "DELETE" });
      if (res.ok) {
        setCoupons(prev => prev.filter(x => x.id !== c.id));
        onNotify("Coupon deleted", "success");
      } else {
        onNotify("Failed to delete", "error");
      }
    } catch {
      onNotify("Failed to delete", "error");
    }
  };

  const handleToggleActive = async (c: Coupon) => {
    try {
      const res = await fetch("/api/admin/coupons/" + c.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !c.active }),
      });
      if (res.ok) {
        setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, active: !c.active } : x));
      }
    } catch { /* ignore */ }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const filtered = coupons.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.code.toLowerCase().includes(s) || c.description.toLowerCase().includes(s);
  });

  const activeCount = coupons.filter(c => c.active).length;
  const totalUses = coupons.reduce((sum, c) => sum + c.usedCount, 0);
  const welcomeExists = coupons.some(c => c.isWelcome && c.active);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Ticket className="w-4 h-4 text-[#CA3F2E]" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{coupons.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-500">Active</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{activeCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-500">Total Uses</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{totalUses}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-500">Welcome</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{welcomeExists ? "Yes" : "No"}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
          />
        </div>
        <button onClick={fetchCoupons} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
          <RefreshCw className={"w-4 h-4 text-gray-600" + (loading ? " animate-spin" : "")} />
        </button>
        <button onClick={openAddForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {/* Welcome coupon warning */}
      {!welcomeExists && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">No active welcome coupon</p>
              <p className="text-xs">Create a coupon and mark it as "Welcome coupon" so new customers auto-receive it on registration.</p>
            </div>
          </div>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900">{editing ? "Edit Coupon" : "New Coupon"}</h3>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Code *</label>
                <input
                  type="text" value={form.code}
                  onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, "") }))}
                  placeholder="WELCOME15"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setForm(f => ({ ...f, type: "percent" }))}
                      className={"flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold transition " +
                        (form.type === "percent" ? "bg-[#CA3F2E] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                      <Percent className="w-3 h-3" /> %
                    </button>
                    <button type="button" onClick={() => setForm(f => ({ ...f, type: "fixed" }))}
                      className={"flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold transition " +
                        (form.type === "fixed" ? "bg-[#CA3F2E] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                      <DollarSign className="w-3 h-3" /> $
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Value * {form.type === "percent" ? "(%)" : "(USD)"}
                  </label>
                  <input
                    type="number" step="0.01" min="0" value={form.value}
                    onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Min Order (USD)</label>
                  <input
                    type="number" step="0.01" min="0" value={form.minOrder}
                    onChange={(e) => setForm(f => ({ ...f, minOrder: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Max Uses (blank = unlimited)</label>
                  <input
                    type="number" min="1" value={form.maxUses}
                    onChange={(e) => setForm(f => ({ ...f, maxUses: e.target.value }))}
                    placeholder="Unlimited"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Expires At (blank = never)</label>
                <input
                  type="date" value={form.expiresAt}
                  onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Description (EN)</label>
                <input
                  type="text" value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="15% off your first order"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Description (FR)</label>
                <input
                  type="text" value={form.descriptionFr}
                  onChange={(e) => setForm(f => ({ ...f, descriptionFr: e.target.value }))}
                  placeholder="15% de reduction sur votre premiere commande"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active}
                    onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))}
                    className="w-4 h-4 rounded" />
                  <span className="text-sm font-semibold text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isWelcome}
                    onChange={(e) => setForm(f => ({ ...f, isWelcome: e.target.checked }))}
                    className="w-4 h-4 rounded" />
                  <span className="text-sm font-semibold text-gray-700">Welcome coupon (auto-assign to new customers)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeForm}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-[#CA3F2E] text-white rounded-xl text-sm font-bold hover:bg-[#8B2A1E] transition disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Update Coupon" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            {coupons.length === 0 ? "No coupons yet" : "No coupons match your search"}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-gray-700">Code</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-700">Discount</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-700 hidden md:table-cell">Min Order</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-700 hidden lg:table-cell">Uses</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-700 hidden lg:table-cell">Expires</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-700">Status</th>
                  <th className="text-right px-4 py-3 font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => copyCode(c.code)}
                          className="font-mono font-bold text-gray-900 hover:text-[#CA3F2E] transition inline-flex items-center gap-1 group">
                          {c.code}
                          {copiedCode === c.code
                            ? <CheckCircle className="w-3 h-3 text-green-600" />
                            : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                          }
                        </button>
                        {c.isWelcome && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded uppercase">
                            <Gift className="w-2.5 h-2.5" /> Welcome
                          </span>
                        )}
                      </div>
                      {c.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{c.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-[#CA3F2E]">
                        {c.type === "percent" ? parseFloat(c.value) + "%" : "$" + parseFloat(c.value).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {parseFloat(c.minOrder) > 0 ? "$" + parseFloat(c.minOrder).toFixed(2) : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {c.usedCount}{c.maxUses ? " / " + c.maxUses : ""}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {c.expiresAt ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Calendar className="w-3 h-3" />
                          {new Date(c.expiresAt).toLocaleDateString()}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(c)}
                        className={"px-2.5 py-1 rounded-full text-[10px] font-bold transition " +
                          (c.active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200")}>
                        {c.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditForm(c)}
                          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                          title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition"
                          title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
