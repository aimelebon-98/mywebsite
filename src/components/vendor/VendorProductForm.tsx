"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, X, Plus, Save, AlertCircle, CheckCircle2 } from "lucide-react";

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
  };
}

interface Props {
  initial: ProductFormData;
  submitLabel: string;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isEdit?: boolean;
}

type Lang = "en" | "fr";
type Section = "basics" | "media" | "variants" | "content" | "seo";

export default function VendorProductForm({ initial, submitLabel, onSubmit, isEdit }: Props) {
  const [data, setData] = useState<ProductFormData>(initial);
  const [lang, setLang] = useState<Lang>("en");
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [section, setSection] = useState<Section>("basics");
  const [newSize, setNewSize] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newTagFr, setNewTagFr] = useState("");
  const imageRef = useRef<HTMLInputElement>(null);

  const isFr = lang === "fr";

  function showNotif(type: "success" | "error", msg: string) {
    setNotif({ type, msg });
    setTimeout(() => setNotif(null), 4000);
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
      showNotif("success", "Image uploaded");
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
    if (!data.name.trim()) { showNotif("error", "Name required (English)"); setLang("en"); setSection("basics"); return; }
    if (!data.price || parseFloat(data.price) <= 0) { showNotif("error", "Valid price required"); setSection("basics"); return; }
    if (data.images.length === 0) { showNotif("error", "At least one image required"); setSection("media"); return; }
    setSaving(true);
    try {
      await onSubmit(data);
      showNotif("success", isEdit ? "Product updated - resubmitted for review" : "Product submitted for approval");
    } catch (err) {
      showNotif("error", err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const sections: Array<{ id: Section; label: string }> = [
    { id: "basics", label: "Basics" },
    { id: "media", label: "Media" },
    { id: "variants", label: "Sizes & colors" },
    { id: "content", label: "Content" },
    { id: "seo", label: "SEO" },
  ];

  // Show language toggle only on sections that have translations
  const sectionHasTranslations = section === "basics" || section === "content" || section === "seo";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl">
      {notif && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 ${notif.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {notif.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notif.msg}
        </div>
      )}

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200">
        {sections.map(s => {
          const active = section === s.id;
          return (
            <button
              type="button"
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition ${active ? "" : "text-gray-500 border-transparent hover:text-gray-700"}`}
              style={active ? { borderBottomColor: BRAND_RED, color: BRAND_RED } : undefined}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Language toggle - only on translatable sections */}
      {sectionHasTranslations && (
        <div className="mb-4">
          <div className="inline-flex p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition ${lang === "en" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <span className="text-xs font-black opacity-70">EN</span>
              English
            </button>
            <button
              type="button"
              onClick={() => setLang("fr")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition ${lang === "fr" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <span className="text-xs font-black opacity-70">FR</span>
              Fran&ccedil;ais
            </button>
          </div>
          {isFr && (
            <p className="text-xs text-gray-500 mt-2">
              You are editing the French version. English is required, French is optional but recommended.
            </p>
          )}
        </div>
      )}

      {/* BASICS SECTION */}
      {section === "basics" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-900">Basic information {isFr && <span className="text-xs text-gray-500 font-normal">(French)</span>}</h3>

          {!isFr ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name (English) *</label>
                <input type="text" required value={data.name} onChange={e => setData({ ...data, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (USD) *</label>
                  <input type="number" step="0.01" min="0" required value={data.price} onChange={e => setData({ ...data, price: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Compare-at price (USD)</label>
                  <input type="number" step="0.01" min="0" value={data.comparePrice} onChange={e => setData({ ...data, comparePrice: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
                  <p className="text-xs text-gray-500 mt-1">Original price (shows discount)</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock *</label>
                  <input type="number" min="0" required value={data.stock} onChange={e => setData({ ...data, stock: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
                  <select value={data.category} onChange={e => setData({ ...data, category: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand</label>
                  <input type="text" value={data.brand} onChange={e => setData({ ...data, brand: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">SKU</label>
                  <input type="text" value={data.sku} onChange={e => setData({ ...data, sku: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Material</label>
                <input type="text" placeholder="e.g. Leather, Mesh + Rubber, Suede..." value={data.material} onChange={e => setData({ ...data, material: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ships from country</label>
                  <select value={data.originCountry} onChange={e => setData({ ...data, originCountry: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                    {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ships from city</label>
                  <input type="text" value={data.originCity} onChange={e => setData({ ...data, originCity: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom (Fran&ccedil;ais)</label>
                <input type="text" value={data.nameFr} onChange={e => setData({ ...data, nameFr: e.target.value })} placeholder="Traduction fran&ccedil;aise du nom du produit" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
                <p className="text-xs text-gray-500 mt-1">Si vide, la version anglaise sera utilis&eacute;e.</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800">
                Les prix, cat&eacute;gorie, marque, stock et pays sont partag&eacute;s entre les deux langues et se g&egrave;rent dans la version anglaise.
              </div>
            </>
          )}
        </div>
      )}

      {/* MEDIA SECTION (no lang toggle - images shared) */}
      {section === "media" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-900">Product images</h3>
          <p className="text-sm text-gray-500">First image is the main image. Click any image to make it primary.</p>

          {data.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.images.map((img, idx) => (
                <div key={img + idx} className="relative group">
                  <img
                    src={img}
                    alt={"Product image " + (idx + 1)}
                    className={`w-full aspect-square object-cover rounded-xl cursor-pointer border-2 ${idx === 0 ? "" : "border-gray-200"}`}
                    style={idx === 0 ? { borderColor: BRAND_RED } : undefined}
                    onClick={() => setPrimary(idx)}
                  />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: BRAND_RED }}>MAIN</span>
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
            className="w-full flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 disabled:opacity-50"
          >
            {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {uploadingImage ? "Uploading..." : "Upload image (JPG, PNG, WebP - max 5 MB)"}
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
      )}

      {/* VARIANTS SECTION (no lang toggle - sizes/colors shared) */}
      {section === "variants" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900">Sizes</h3>
            <div className="flex gap-2">
              <input type="text" placeholder="e.g. 42 or US 9" value={newSize} onChange={e => setNewSize(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSize(); } }} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              <button type="button" onClick={addSize} className="px-4 py-2.5 text-white font-semibold rounded-lg" style={{ backgroundColor: BRAND_RED }}>Add</button>
            </div>
            {data.sizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.sizes.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                    {s}
                    <button type="button" onClick={() => removeSize(s)} className="hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900">Colors</h3>
            <div className="flex gap-2">
              <input type="text" placeholder="e.g. Black/White" value={newColorName} onChange={e => setNewColorName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              <button type="button" onClick={addColor} className="px-4 py-2.5 text-white font-semibold rounded-lg" style={{ backgroundColor: BRAND_RED }}>Add</button>
            </div>
            {data.colors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.colors.map((c, idx) => (
                  <span key={c.name + idx} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                    {c.name}
                    <button type="button" onClick={() => removeColor(idx)} className="hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENT SECTION - with lang toggle */}
      {section === "content" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-900">Content &amp; descriptions {isFr && <span className="text-xs text-gray-500 font-normal">(French)</span>}</h3>

          {!isFr ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short description</label>
                <textarea rows={2} placeholder="1-2 sentences shown on product cards" value={data.shortDescription} onChange={e => setData({ ...data, shortDescription: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full description (HTML allowed)</label>
                <textarea rows={10} placeholder="Detailed product description..." value={data.longDescription} onChange={e => setData({ ...data, longDescription: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" placeholder="Add tag" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(false); } }} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <button type="button" onClick={() => addTag(false)} className="px-3 py-2 text-white text-sm font-semibold rounded-lg" style={{ backgroundColor: BRAND_RED }}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {data.tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">
                      {t}<button type="button" onClick={() => removeTag(t, false)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description courte</label>
                <textarea rows={2} placeholder="1-2 phrases affich&eacute;es sur les cartes produit" value={data.shortDescriptionFr} onChange={e => setData({ ...data, shortDescriptionFr: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description compl&egrave;te (HTML autoris&eacute;)</label>
                <textarea rows={10} placeholder="Description d&eacute;taill&eacute;e du produit..." value={data.longDescriptionFr} onChange={e => setData({ ...data, longDescriptionFr: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (Fran&ccedil;ais)</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" placeholder="Ajouter tag" value={newTagFr} onChange={e => setNewTagFr(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(true); } }} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <button type="button" onClick={() => addTag(true)} className="px-3 py-2 text-white text-sm font-semibold rounded-lg" style={{ backgroundColor: BRAND_RED }}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {data.tagsFr.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">
                      {t}<button type="button" onClick={() => removeTag(t, true)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* SEO SECTION - with lang toggle */}
      {section === "seo" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-900">SEO metadata {isFr && <span className="text-xs text-gray-500 font-normal">(French)</span>}</h3>
          <p className="text-sm text-gray-500">Optional. Helps your product rank in Google search.</p>

          {!isFr ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">SEO title - 50-60 chars</label>
                <input type="text" maxLength={70} value={data.seoTitle} onChange={e => setData({ ...data, seoTitle: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
                <p className="text-xs text-gray-500 mt-1">{data.seoTitle.length}/60</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meta description - 140-160 chars</label>
                <textarea rows={2} maxLength={170} value={data.metaDescription} onChange={e => setData({ ...data, metaDescription: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none" />
                <p className="text-xs text-gray-500 mt-1">{data.metaDescription.length}/160</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Focus keyphrase</label>
                <input type="text" value={data.focusKeyphrase} onChange={e => setData({ ...data, focusKeyphrase: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre SEO - 50-60 caract&egrave;res</label>
                <input type="text" maxLength={70} value={data.seoTitleFr} onChange={e => setData({ ...data, seoTitleFr: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
                <p className="text-xs text-gray-500 mt-1">{data.seoTitleFr.length}/60</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">M&eacute;ta description - 140-160 caract&egrave;res</label>
                <textarea rows={2} maxLength={170} value={data.metaDescriptionFr} onChange={e => setData({ ...data, metaDescriptionFr: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none" />
                <p className="text-xs text-gray-500 mt-1">{data.metaDescriptionFr.length}/160</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expression cl&eacute; focus</label>
                <input type="text" value={data.focusKeyphraseFr} onChange={e => setData({ ...data, focusKeyphraseFr: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-6 pt-4">
        <div className="text-xs text-gray-500">
          {isEdit ? "Editing resubmits for admin approval" : "New products require admin approval before going live"}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          style={{ backgroundColor: BRAND_RED }}
          onMouseOver={e => { if (!saving) e.currentTarget.style.backgroundColor = BRAND_RED_DARK; }}
          onMouseOut={e => { if (!saving) e.currentTarget.style.backgroundColor = BRAND_RED; }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}