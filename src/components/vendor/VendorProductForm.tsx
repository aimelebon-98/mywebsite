"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, X, Plus, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { displayCurrency } from "@/lib/vendor-currency";

const BRAND_RED = "#CA3F2E";
const BRAND_RED_DARK = "#8B2A1E";

const CATEGORIES = ["sneakers", "running", "formal", "boots", "sandals", "casual"];
const COUNTRIES = [
  { value: "NG", label: "Nigeria" },
  { value: "TG", label: "Togo" },
  { value: "GH", label: "Ghana" },
  { value: "BJ", label: "Benin" },
  { value: "CI", label: "Ivory Coast" },
  { value: "SN", label: "Senegal" },
  { value: "FR", label: "France" },
  { value: "US", label: "United States" },
];

export interface ProductFormData {
  name: string;
  nameFr: string;
  slug?: string;
  description: string;
  descriptionFr: string;
  shortDescription: string;
  shortDescriptionFr: string;
  longDescription: string;
  longDescriptionFr: string;
  price: string;
  comparePrice: string;
  category: string;
  brand: string;
  material: string;
  sku: string;
  sizes: string[];
  colors: Array<{ name: string; image?: string }>;
  images: string[];
  imageUrl: string;
  stock: number;
  tags: string[];
  tagsFr: string[];
  seoTitle: string;
  seoTitleFr: string;
  metaDescription: string;
  metaDescriptionFr: string;
  focusKeyphrase: string;
  focusKeyphraseFr: string;
  ogImage: string;
  originCountry: string;
  originCity: string;
  currency: string;
}

export function emptyProduct(): ProductFormData {
  return {
    name: "", nameFr: "", description: "", descriptionFr: "",
    shortDescription: "", shortDescriptionFr: "",
    longDescription: "", longDescriptionFr: "",
    price: "", comparePrice: "", category: "sneakers", brand: "",
    material: "", sku: "", sizes: [], colors: [], images: [], imageUrl: "",
    stock: 0, tags: [], tagsFr: [],
    seoTitle: "", seoTitleFr: "", metaDescription: "", metaDescriptionFr: "",
    focusKeyphrase: "", focusKeyphraseFr: "", ogImage: "",
    originCountry: "NG", originCity: "",
    currency: "USD",
  };
}

interface Props {
  initial: ProductFormData;
  submitLabel: string;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isEdit?: boolean;
}

type Lang = "en" | "fr";

export default function VendorProductForm({ initial, submitLabel, onSubmit, isEdit }: Props) {
  const [data, setData] = useState<ProductFormData>(initial);
  const [lang, setLang] = useState<Lang>("en");
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [newSize, setNewSize] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newTagFr, setNewTagFr] = useState("");
  const imageRef = useRef<HTMLInputElement>(null);

  const isFr = lang === "fr";

  function showNotif(type: "success" | "error", msg: string) {
    setNotif({ type, msg });
    setTimeout(() => setNotif(null), 4500);
  }

  async function handleUpload(file: File) {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "product");
      const res = await fetch("/api/vendor/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Upload failed");
      const url = j.url as string;
      const nextImages = [...data.images, url];
      setData({
        ...data,
        images: nextImages,
        imageUrl: data.imageUrl || url,
        ogImage: data.ogImage || url,
      });
      showNotif("success", "Image uploaded successfully");
    } catch (err) {
      showNotif("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  function removeImage(idx: number) {
    const nextImages = data.images.filter((_, i) => i !== idx);
    setData({
      ...data,
      images: nextImages,
      imageUrl: nextImages[0] || "",
      ogImage: nextImages[0] || "",
    });
  }

  function setPrimary(idx: number) {
    const nextImages = [...data.images];
    const [chosen] = nextImages.splice(idx, 1);
    nextImages.unshift(chosen);
    setData({ ...data, images: nextImages, imageUrl: nextImages[0], ogImage: nextImages[0] });
  }

  function addSize() {
    const s = newSize.trim();
    if (!s || data.sizes.includes(s)) return;
    setData({ ...data, sizes: [...data.sizes, s] });
    setNewSize("");
  }
  function removeSize(s: string) { setData({ ...data, sizes: data.sizes.filter(x => x !== s) }); }

  function addColor() {
    const n = newColorName.trim();
    if (!n) return;
    setData({ ...data, colors: [...data.colors, { name: n, image: data.imageUrl }] });
    setNewColorName("");
  }
  function removeColor(idx: number) { setData({ ...data, colors: data.colors.filter((_, i) => i !== idx) }); }

  function addTag(fr: boolean) {
    const t = (fr ? newTagFr : newTag).trim();
    if (!t) return;
    if (fr) {
      if (data.tagsFr.includes(t)) return;
      setData({ ...data, tagsFr: [...data.tagsFr, t] });
      setNewTagFr("");
    } else {
      if (data.tags.includes(t)) return;
      setData({ ...data, tags: [...data.tags, t] });
      setNewTag("");
    }
  }
  function removeTag(t: string, fr: boolean) {
    if (fr) setData({ ...data, tagsFr: data.tagsFr.filter(x => x !== t) });
    else setData({ ...data, tags: data.tags.filter(x => x !== t) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.name.trim()) {
      showNotif("error", "Name required (English)");
      return;
    }
    if (!data.price || parseFloat(data.price) <= 0) {
      showNotif("error", "Valid price required");
      return;
    }
    if (data.images.length === 0) {
      showNotif("error", "At least one product image is required");
      return;
    }

    // Auto-generate SKU if left empty by vendor
    let finalSku = data.sku.trim();
    if (!finalSku) {
      const brandCode = (data.brand || data.category || "NDZ").replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "NDZ";
      const nameCode = (data.name || "ITEM").replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "ITM";
      const randNum = Math.floor(1000 + Math.random() * 9000);
      finalSku = `NDZ-${brandCode}-${nameCode}-${randNum}`;
    }

    const submissionData = {
      ...data,
      sku: finalSku,
    };

    setSaving(true);
    try {
      await onSubmit(submissionData);
      showNotif("success", isEdit ? "Product updated - resubmitted for review" : "Product submitted for admin approval");
    } catch (err) {
      showNotif("error", err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6 pb-12">
      {notif && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl flex items-center gap-2 ${notif.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {notif.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notif.msg}
        </div>
      )}

      {/* LANGUAGE MODE TOGGLE */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="font-bold text-gray-900 text-base">Product Details</h2>
          <p className="text-xs text-gray-500">Fill in all details below on this single page.</p>
        </div>

        <div className="inline-flex p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition ${lang === "en" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            <span className="text-[10px] font-black opacity-70">EN</span>
            English
          </button>
          <button
            type="button"
            onClick={() => setLang("fr")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition ${lang === "fr" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            <span className="text-[10px] font-black opacity-70">FR</span>
            Fran&ccedil;ais
          </button>
        </div>
      </div>

      {/* SECTION 1: BASIC INFORMATION */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4 shadow-xs">
        <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          1. Basic information {isFr && <span className="text-xs text-gray-500 font-normal">(French Mode)</span>}
        </h3>

        {!isFr ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name (English) *</label>
              <input
                type="text"
                required
                value={data.name}
                onChange={e => setData({ ...data, name: e.target.value })}
                placeholder="e.g. Nike Air Max 90 Sneaker - Black/White"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price ({displayCurrency(data.currency)}) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={data.price}
                  onChange={e => setData({ ...data, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Compare-at price ({displayCurrency(data.currency)})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.comparePrice}
                  onChange={e => setData({ ...data, comparePrice: e.target.value })}
                  placeholder="Original price (shows discount)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={data.stock}
                  onChange={e => setData({ ...data, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
                <select
                  value={data.category}
                  onChange={e => setData({ ...data, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Nike, Jordan, Puma"
                  value={data.brand}
                  onChange={e => setData({ ...data, brand: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">SKU (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated on submit if left empty"
                  value={data.sku}
                  onChange={e => setData({ ...data, sku: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Material</label>
              <input
                type="text"
                placeholder="e.g. Full Grain Leather, Mesh + EVA Sole, Suede..."
                value={data.material}
                onChange={e => setData({ ...data, material: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ships from country</label>
                <select
                  value={data.originCountry}
                  onChange={e => setData({ ...data, originCountry: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ships from city</label>
                <input
                  type="text"
                  placeholder="e.g. Abuja, Lomé, Lagos"
                  value={data.originCity}
                  onChange={e => setData({ ...data, originCity: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom (Fran&ccedil;ais)</label>
              <input
                type="text"
                value={data.nameFr}
                onChange={e => setData({ ...data, nameFr: e.target.value })}
                placeholder="Traduction fran&ccedil;aise du nom du produit"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">Si vide, la version anglaise sera utilis&eacute;e.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              Les prix, cat&eacute;gorie, marque, stock et pays sont g&eacute;r&eacute;s dans la version anglaise.
            </div>
          </>
        )}
      </div>

      {/* SECTION 2: MEDIA / IMAGES */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4 shadow-xs">
        <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          2. Product images *
        </h3>
        <p className="text-xs text-gray-500">First image is the main photo. Click any image to make it primary.</p>

        {data.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.images.map((img, idx) => (
              <div key={img + idx} className="relative group">
                <img
                  src={img}
                  alt={"Product image " + (idx + 1)}
                  className={`w-full aspect-square object-cover rounded-xl cursor-pointer border-2 ${idx === 0 ? "border-[#CA3F2E]" : "border-gray-200"}`}
                  onClick={() => setPrimary(idx)}
                />
                {idx === 0 && (
                  <span className="absolute top-2 left-2 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm" style={{ backgroundColor: BRAND_RED }}>
                    MAIN
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => imageRef.current?.click()}
          disabled={uploadingImage}
          className="w-full flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 transition disabled:opacity-50"
        >
          {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-gray-500" />}
          <span className="text-sm font-semibold">{uploadingImage ? "Uploading..." : "Upload product image (JPG, PNG, WebP)"}</span>
        </button>
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
            if (imageRef.current) imageRef.current.value = "";
          }}
        />
      </div>

      {/* SECTION 3: SIZES & COLORS */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-6 shadow-xs">
        <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          3. Sizes &amp; Color variants
        </h3>

        {/* Sizes */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Sizes</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 40, 41, 42, 43 or EU 42"
              value={newSize}
              onChange={e => setNewSize(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSize(); } }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="button"
              onClick={addSize}
              className="px-4 py-2 text-white font-bold text-xs rounded-lg transition"
              style={{ backgroundColor: BRAND_RED }}
            >
              Add Size
            </button>
          </div>
          {data.sizes.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {data.sizes.map(s => (
                <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-800">
                  {s}
                  <button type="button" onClick={() => removeSize(s)} className="hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Colors */}
        <div className="space-y-3 border-t border-gray-100 pt-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Colors</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Black/White, Desert Sand"
              value={newColorName}
              onChange={e => setNewColorName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="button"
              onClick={addColor}
              className="px-4 py-2 text-white font-bold text-xs rounded-lg transition"
              style={{ backgroundColor: BRAND_RED }}
            >
              Add Color
            </button>
          </div>
          {data.colors.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {data.colors.map((c, idx) => (
                <span key={c.name + idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-800">
                  {c.name}
                  <button type="button" onClick={() => removeColor(idx)} className="hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: CONTENT & DESCRIPTIONS */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4 shadow-xs">
        <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          4. Content &amp; Descriptions {isFr && <span className="text-xs text-gray-500 font-normal">(French Mode)</span>}
        </h3>

        {!isFr ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short description</label>
              <textarea
                rows={2}
                placeholder="1-2 sentence summary shown on product cards"
                value={data.shortDescription}
                onChange={e => setData({ ...data, shortDescription: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full description (HTML allowed)</label>
              <textarea
                rows={8}
                placeholder="Detailed product specifications, features, cushioning, style tips..."
                value={data.longDescription}
                onChange={e => setData({ ...data, longDescription: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add tag (e.g. sneakers, running, black)"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(false); } }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  type="button"
                  onClick={() => addTag(false)}
                  className="px-3 py-2 text-white text-sm font-semibold rounded-lg"
                  style={{ backgroundColor: BRAND_RED }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {data.tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-700">
                    {t}<button type="button" onClick={() => removeTag(t, false)}><X className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description courte (Fran&ccedil;ais)</label>
              <textarea
                rows={2}
                placeholder="1-2 phrases affich&eacute;es sur les cartes produit"
                value={data.shortDescriptionFr}
                onChange={e => setData({ ...data, shortDescriptionFr: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description compl&egrave;te (Fran&ccedil;ais)</label>
              <textarea
                rows={8}
                placeholder="Description d&eacute;taill&eacute;e du produit..."
                value={data.longDescriptionFr}
                onChange={e => setData({ ...data, longDescriptionFr: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (Fran&ccedil;ais)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Ajouter un tag fran&ccedil;ais"
                  value={newTagFr}
                  onChange={e => setNewTagFr(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(true); } }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  type="button"
                  onClick={() => addTag(true)}
                  className="px-3 py-2 text-white text-sm font-semibold rounded-lg"
                  style={{ backgroundColor: BRAND_RED }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {data.tagsFr.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-700">
                    {t}<button type="button" onClick={() => removeTag(t, true)}><X className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* SECTION 5: SEO METADATA */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4 shadow-xs">
        <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          5. SEO Metadata {isFr && <span className="text-xs text-gray-500 font-normal">(French Mode)</span>}
        </h3>
        <p className="text-xs text-gray-500">Optional. Helps search engines list your product higher.</p>

        {!isFr ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">SEO title (50-60 chars)</label>
              <input
                type="text"
                maxLength={70}
                value={data.seoTitle}
                onChange={e => setData({ ...data, seoTitle: e.target.value })}
                placeholder="Product Name - Category | Store Name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <p className="text-xs text-gray-400 mt-1">{data.seoTitle.length}/60</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meta description (140-160 chars)</label>
              <textarea
                rows={2}
                maxLength={170}
                value={data.metaDescription}
                onChange={e => setData({ ...data, metaDescription: e.target.value })}
                placeholder="Buy [Product Name]. Fast shipping and verified quality."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <p className="text-xs text-gray-400 mt-1">{data.metaDescription.length}/160</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Focus keyphrase</label>
              <input
                type="text"
                value={data.focusKeyphrase}
                onChange={e => setData({ ...data, focusKeyphrase: e.target.value })}
                placeholder="e.g. nike air max 90 black"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre SEO (Fran&ccedil;ais)</label>
              <input
                type="text"
                maxLength={70}
                value={data.seoTitleFr}
                onChange={e => setData({ ...data, seoTitleFr: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <p className="text-xs text-gray-400 mt-1">{data.seoTitleFr.length}/60</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">M&eacute;ta description (Fran&ccedil;ais)</label>
              <textarea
                rows={2}
                maxLength={170}
                value={data.metaDescriptionFr}
                onChange={e => setData({ ...data, metaDescriptionFr: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <p className="text-xs text-gray-400 mt-1">{data.metaDescriptionFr.length}/160</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expression cl&eacute; focus (Fran&ccedil;ais)</label>
              <input
                type="text"
                value={data.focusKeyphraseFr}
                onChange={e => setData({ ...data, focusKeyphraseFr: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="text-xs text-gray-500">
          {isEdit ? "Edits require admin approval before updating live." : "New products require admin approval before going live."}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3.5 text-white font-extrabold rounded-xl transition-all shadow-md disabled:opacity-50"
          style={{ backgroundColor: BRAND_RED }}
          onMouseOver={e => { if (!saving) e.currentTarget.style.backgroundColor = BRAND_RED_DARK; }}
          onMouseOut={e => { if (!saving) e.currentTarget.style.backgroundColor = BRAND_RED; }}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>{saving ? "Submitting..." : submitLabel}</span>
        </button>
      </div>
    </form>
  );
}