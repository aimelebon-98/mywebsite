"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, X, Plus, CheckCircle2, AlertCircle, Sparkles, Send } from "lucide-react";
import { CONCIERGE_TIERS, getTierFee } from "@/lib/concierge-tiers";

const BRAND_RED = "#CA3F2E";
const BRAND_RED_DARK = "#8B2A1E";

const CATEGORIES = ["sneakers", "running", "formal", "boots", "sandals", "casual"];

interface Props {
  onSuccess: () => void;
}

export default function ConciergeForm({ onSuccess }: Props) {
  const [tier, setTier] = useState<string>("basic");
  const [productName, setProductName] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [productCategory, setProductCategory] = useState("sneakers");
  const [productPrice, setProductPrice] = useState("");
  const [productComparePrice, setProductComparePrice] = useState("");
  const [productMaterial, setProductMaterial] = useState("");
  const [productSizes, setProductSizes] = useState<string[]>([]);
  const [productColors, setProductColors] = useState<string[]>([]);
  const [productStock, setProductStock] = useState("10");
  const [sourceImages, setSourceImages] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const fee = getTierFee(tier);

  function showNotif(type: "success" | "error", msg: string) {
    setNotif({ type, msg });
    setTimeout(() => setNotif(null), 4000);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "concierge");
      const res = await fetch("/api/vendor/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Upload failed");
      setSourceImages(prev => [...prev, j.url]);
      showNotif("success", "Image uploaded");
    } catch (err) {
      showNotif("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx: number) {
    setSourceImages(prev => prev.filter((_, i) => i !== idx));
  }

  function addSize() {
    const s = newSize.trim();
    if (!s || productSizes.includes(s)) return;
    setProductSizes([...productSizes, s]);
    setNewSize("");
  }
  function addColor() {
    const c = newColor.trim();
    if (!c || productColors.includes(c)) return;
    setProductColors([...productColors, c]);
    setNewColor("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productName.trim() || !productPrice || sourceImages.length === 0) {
      showNotif("error", "Name, price and at least one image are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier, productName, productBrand, productCategory,
          productPrice: parseFloat(productPrice),
          productComparePrice: productComparePrice ? parseFloat(productComparePrice) : null,
          productMaterial,
          productSizes, productColors,
          productStock: parseInt(productStock, 10) || 0,
          sourceImages, notes,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      showNotif("success", "Request submitted");
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      showNotif("error", err instanceof Error ? err.message : "Failed");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {notif && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 ${notif.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {notif.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notif.msg}
        </div>
      )}

      {/* Tier selection */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-1">Choose your service tier</h3>
        <p className="text-sm text-gray-500 mb-4">We take your info + images and create the full listing. Fee added to your invoice.</p>

        <div className="grid md:grid-cols-3 gap-3">
          {CONCIERGE_TIERS.map(t => {
            const selected = tier === t.id;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setTier(t.id)}
                className={`text-left p-4 rounded-xl border-2 transition ${selected ? "" : "border-gray-200 hover:border-gray-300"}`}
                style={selected ? { borderColor: BRAND_RED, backgroundColor: "#FEF2F0" } : undefined}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">{t.name}</span>
                  <span className="text-lg font-black" style={{ color: selected ? BRAND_RED : "#111827" }}>${t.price}</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {t.features.map(f => (
                    <li key={f} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product info */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
        <h3 className="font-bold text-gray-900">Product information</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product name *</label>
            <input type="text" required value={productName} onChange={e => setProductName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand</label>
            <input type="text" value={productBrand} onChange={e => setProductBrand(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
            <select value={productCategory} onChange={e => setProductCategory(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Material</label>
            <input type="text" placeholder="e.g. Leather, Mesh..." value={productMaterial} onChange={e => setProductMaterial(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Selling price (USD) *</label>
            <input type="number" step="0.01" min="0" required value={productPrice} onChange={e => setProductPrice(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Compare-at price (optional)</label>
            <input type="number" step="0.01" min="0" value={productComparePrice} onChange={e => setProductComparePrice(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock</label>
            <input type="number" min="0" value={productStock} onChange={e => setProductStock(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sizes</label>
            <div className="flex gap-2 mb-2">
              <input type="text" placeholder="e.g. 42" value={newSize} onChange={e => setNewSize(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSize(); } }} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <button type="button" onClick={addSize} className="px-3 py-2 text-white text-sm font-semibold rounded-lg" style={{ backgroundColor: BRAND_RED }}><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-1">
              {productSizes.map(s => (
                <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">
                  {s}<button type="button" onClick={() => setProductSizes(productSizes.filter(x => x !== s))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Colors</label>
            <div className="flex gap-2 mb-2">
              <input type="text" placeholder="e.g. Black/White" value={newColor} onChange={e => setNewColor(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <button type="button" onClick={addColor} className="px-3 py-2 text-white text-sm font-semibold rounded-lg" style={{ backgroundColor: BRAND_RED }}><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-1">
              {productColors.map(c => (
                <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">
                  {c}<button type="button" onClick={() => setProductColors(productColors.filter(x => x !== c))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
        <div>
          <h3 className="font-bold text-gray-900 mb-1">Product images *</h3>
          <p className="text-sm text-gray-500">Upload as many clear photos as you have. We&apos;ll optimize them.</p>
        </div>

        {sourceImages.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {sourceImages.map((url, idx) => (
              <div key={url + idx} className="relative group">
                <img src={url} alt={"upload " + idx} className="w-full aspect-square object-cover rounded-lg border border-gray-200" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg">
                  <X className="w-3 h-3 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="button" onClick={() => imageRef.current?.click()} disabled={uploading} className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 disabled:opacity-50">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {uploading ? "Uploading..." : "Upload image"}
        </button>
        <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
          if (imageRef.current) imageRef.current.value = "";
        }} />
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <label className="block font-bold text-gray-900 mb-2">Notes for our team (optional)</label>
        <textarea rows={4} placeholder="Anything special? Preferred product name, style keywords, specific selling points..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none" />
      </div>

      {/* Fee summary + submit */}
      <div className="rounded-2xl p-5 border-2" style={{ borderColor: BRAND_RED, backgroundColor: "#FEF2F0" }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" style={{ color: BRAND_RED }} />
            <div>
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">Total fee</div>
              <div className="text-2xl font-black" style={{ color: BRAND_RED }}>${fee.toFixed(2)}</div>
            </div>
          </div>
          <div className="text-xs text-gray-600 max-w-xs text-right">
            Fee added to your invoice when the product goes live. Pay with your next payout or on request.
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3.5 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          style={{ backgroundColor: BRAND_RED }}
          onMouseOver={e => { if (!submitting) e.currentTarget.style.backgroundColor = BRAND_RED_DARK; }}
          onMouseOut={e => { if (!submitting) e.currentTarget.style.backgroundColor = BRAND_RED; }}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Submit concierge request
        </button>
      </div>
    </form>
  );
}