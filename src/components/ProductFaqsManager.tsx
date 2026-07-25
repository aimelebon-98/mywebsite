"use client";

import { useEffect, useState } from "react";
import type { ProductFaq } from "@/db/schema";
import { Plus, Trash2, Save, X, ChevronDown, ChevronUp, HelpCircle, Eye, EyeOff, GripVertical } from "lucide-react";

export default function ProductFaqsManager() {
  const [faqs, setFaqs] = useState<ProductFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    question: "",
    answer: "",
    questionFr: "",
    answerFr: "",
    sortOrder: 0,
    active: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/product-faqs");
      const data = await res.json();
      setFaqs(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ question: "", answer: "", questionFr: "", answerFr: "", sortOrder: faqs.length + 1, active: true });
    setEditingId(null);
    setShowAdd(false);
  };

  const startEdit = (f: ProductFaq) => {
    setForm({
      question: f.question,
      answer: f.answer,
      questionFr: f.questionFr || "",
      answerFr: f.answerFr || "",
      sortOrder: f.sortOrder,
      active: f.active,
    });
    setEditingId(f.id);
    setShowAdd(true);
  };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      alert("Question and answer are required");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/product-faqs/${editingId}` : "/api/admin/product-faqs";
      const method = editingId ? "PATCH" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      await load();
      resetForm();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await fetch(`/api/admin/product-faqs/${id}`, { method: "DELETE" });
      await load();
    } catch { /* ignore */ }
  };

  const toggleActive = async (f: ProductFaq) => {
    try {
      await fetch(`/api/admin/product-faqs/${f.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, active: !f.active }),
      });
      await load();
    } catch { /* ignore */ }
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#CA3F2E]" />
            Product FAQs
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            These FAQs appear on every product page. {faqs.length} total, {faqs.filter(f => f.active).length} active.
          </p>
        </div>
        {!showAdd && (
          <button
            onClick={() => { resetForm(); setShowAdd(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-[#CA3F2E] transition"
          >
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        )}
      </div>

      {/* Add/Edit form */}
      {showAdd && (
        <div className="bg-white border-2 border-[#CA3F2E]/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">
              {editingId ? "Edit FAQ" : "New FAQ"}
            </h3>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-900">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* EN */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">English</div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Question *</label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
                  placeholder="Are these shoes authentic?"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Answer *</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
                  placeholder="Yes, 100% authentic..."
                />
              </div>
            </div>

            {/* FR */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Français</div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Question (FR)</label>
                <input
                  type="text"
                  value={form.questionFr}
                  onChange={(e) => setForm({ ...form, questionFr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
                  placeholder="Ces chaussures sont-elles authentiques?"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Answer (FR)</label>
                <textarea
                  value={form.answerFr}
                  onChange={(e) => setForm({ ...form, answerFr: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
                  placeholder="Oui, 100% authentiques..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-700">Sort Order:</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 accent-[#CA3F2E]"
              />
              <span className="text-sm text-gray-700">Active (visible on site)</span>
            </label>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white rounded-xl text-sm font-bold transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : (editingId ? "Update FAQ" : "Create FAQ")}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : faqs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No FAQs yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {faqs.map((f) => {
            const isExpanded = expanded.has(f.id);
            return (
              <div
                key={f.id}
                className={`bg-white border rounded-xl overflow-hidden transition ${f.active ? "border-gray-200" : "border-gray-100 opacity-60"}`}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  <span className="text-xs font-bold text-gray-400 flex-shrink-0 w-6">#{f.sortOrder}</span>
                  <button
                    onClick={() => toggleExpand(f.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="font-semibold text-sm text-gray-900 truncate">{f.question}</div>
                    {f.questionFr && (
                      <div className="text-xs text-gray-500 truncate">{f.questionFr}</div>
                    )}
                  </button>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(f)}
                      className={`p-1.5 rounded-lg transition ${f.active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                      title={f.active ? "Active" : "Hidden"}
                    >
                      {f.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => toggleExpand(f.id)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => startEdit(f)}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(f.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50 space-y-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Answer (EN)</div>
                      <p className="text-sm text-gray-700 leading-relaxed">{f.answer}</p>
                    </div>
                    {f.answerFr && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Answer (FR)</div>
                        <p className="text-sm text-gray-700 leading-relaxed">{f.answerFr}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
