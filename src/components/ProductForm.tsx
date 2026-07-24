"use client";

import { useState } from "react";
import type { Product, Category } from "@/db/schema";
import { Save, Eye, EyeOff, Star, ChevronDown, Search, Globe, Image as ImageIcon, Tag, Package, Layers, DollarSign } from "lucide-react";

interface Props {
  product?: Product;
  categories: Category[];
  onSave: (data: Record<string, unknown>) => Promise<void>;
  loading: boolean;
  onCancel?: () => void;
}

// Collapsible sidebar card
function SidebarCard({
  title, icon: Icon, defaultOpen = true, children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ProductForm({ product, categories, onSave, loading, onCancel }: Props) {
  const [langTab, setLangTab] = useState<"en" | "fr">("en");

  // English fields
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription || "");
  const [longDescription, setLongDescription] = useState(product?.longDescription || "");

  // French
  const [nameFr, setNameFr] = useState(product?.nameFr || "");
  const [descriptionFr, setDescriptionFr] = useState(product?.descriptionFr || "");
  const [shortDescriptionFr, setShortDescriptionFr] = useState(product?.shortDescriptionFr || "");
  const [longDescriptionFr, setLongDescriptionFr] = useState(product?.longDescriptionFr || "");
  const [tagsFrStr, setTagsFrStr] = useState(() => {
    if (!product?.tagsFr) return "";
    try { return (JSON.parse(product.tagsFr) as string[]).join(", "); } catch { return ""; }
  });

  // Pricing / variants
  const [price, setPrice] = useState(product?.price || "");
  const [comparePrice, setComparePrice] = useState(product?.comparePrice || "");
  const [category, setCategory] = useState(product?.category || (categories[0]?.slug ?? "sneakers"));
  const [brand, setBrand] = useState(product?.brand || "");
  const [sizesStr, setSizesStr] = useState(product ? (JSON.parse(product.sizes || "[]") as string[]).join(", ") : "7, 8, 9, 10, 11, 12");
  const [colorsStr, setColorsStr] = useState(product ? (JSON.parse(product.colors || "[]") as string[]).join(", ") : "");

  // Images
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [extraImages, setExtraImages] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(product?.images || "[]") as string[];
      return parsed.filter(img => img && img !== product?.imageUrl);
    } catch { return []; }
  });
  const [newImageUrl, setNewImageUrl] = useState("");

  // Meta
  const [stock, setStock] = useState(product?.stock?.toString() || "0");
  const [featured, setFeatured] = useState(product?.featured || false);
  const [active, setActive] = useState(product?.active !== false);
  const [material, setMaterial] = useState(product?.material || "");
  const [sku, setSku] = useState(product?.sku || "");
  const [tagsStr, setTagsStr] = useState(product?.tags ? (JSON.parse(product.tags) as string[]).join(", ") : "");

  // SEO
  const [seoTitle, setSeoTitle] = useState(product?.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(product?.metaDescription || "");
  const [focusKeyphrase, setFocusKeyphrase] = useState(product?.focusKeyphrase || "");
  const [ogImage, setOgImage] = useState(product?.ogImage || "");
  const [canonicalUrl, setCanonicalUrl] = useState(product?.canonicalUrl || "");
  const [noIndex, setNoIndex] = useState(product?.noIndex || false);
  const [seoTitleFr, setSeoTitleFr] = useState(product?.seoTitleFr || "");
  const [metaDescriptionFr, setMetaDescriptionFr] = useState(product?.metaDescriptionFr || "");
  const [focusKeyphraseFr, setFocusKeyphraseFr] = useState(product?.focusKeyphraseFr || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sizes = sizesStr.split(",").map((s) => s.trim()).filter(Boolean);
    const colors = colorsStr.split(",").map((c) => c.trim()).filter(Boolean);
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    const tagsFr = tagsFrStr.split(",").map((t) => t.trim()).filter(Boolean);

    onSave({
      name, description, shortDescription, longDescription,
      nameFr: nameFr.trim() || null,
      descriptionFr: descriptionFr.trim() || null,
      shortDescriptionFr: shortDescriptionFr.trim() || null,
      longDescriptionFr: longDescriptionFr.trim() || null,
      tagsFr: tagsFr.length > 0 ? tagsFr : null,
      price: parseFloat(price) || 0,
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      category, brand, sizes, colors,
      imageUrl,
      images: [imageUrl, ...extraImages].filter(Boolean),
      stock: parseInt(stock) || 0,
      featured, active,
      material, sku, tags,
      seoTitle: seoTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
      focusKeyphrase: focusKeyphrase.trim() || null,
      ogImage: ogImage.trim() || null,
      canonicalUrl: canonicalUrl.trim() || null,
      noIndex,
      seoTitleFr: seoTitleFr.trim() || null,
      metaDescriptionFr: metaDescriptionFr.trim() || null,
      focusKeyphraseFr: focusKeyphraseFr.trim() || null,
    });
  };

  const activeCategories = categories.filter(c => c.active);
  const categoriesToShow = activeCategories.length > 0 ? activeCategories : categories;

  return (
    <form onSubmit={handleSubmit} className="max-w-full space-y-4">
      {/* TOP BAR */}
      <div className="flex items-center justify-between sticky top-0 bg-gray-50 py-3 z-30 -mx-2 px-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold">{product ? "Edit Product" : "New Product"}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {active ? <span className="text-green-600 font-semibold">Active</span> : <span className="text-orange-500 font-semibold">Inactive</span>}
            {" - "}
            <span className="text-gray-700">{stock || 0} in stock</span>
          </p>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !name}
            className="px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : (product ? "Update Product" : "Save Product")}
          </button>
        </div>
      </div>

      {/* WORDPRESS-STYLE 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        {/* LEFT: MAIN CONTENT */}
        <div className="min-w-0 space-y-4">
          {/* Product info card with EN/FR tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            {/* Language tabs */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setLangTab("en")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    langTab === "en" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="text-base">EN</span>
                  <span>English</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLangTab("fr")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    langTab === "fr" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="text-base">FR</span>
                  <span>Francais</span>
                  {(nameFr || descriptionFr) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="French content added" />
                  )}
                </button>
              </div>
              <span className="text-xs text-gray-500">
                {langTab === "en" ? "Required" : "Optional but recommended"}
              </span>
            </div>

            {/* ENGLISH */}
            <div style={{ display: langTab === "en" ? "block" : "none" }} className="space-y-5">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Product name..."
                  className="w-full px-0 py-2 border-0 border-b border-transparent hover:border-gray-200 focus:border-gray-900 text-2xl font-bold focus:outline-none transition placeholder-gray-300 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Short Description</label>
                <textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g., Premium sneakers with responsive cushioning..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition resize-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">Shown in product cards and previews</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Long Description</label>
                <textarea
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  rows={6}
                  placeholder="Detailed product description..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Fallback Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Generic fallback if long description is empty"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition resize-none"
                />
              </div>
            </div>

            {/* FRENCH */}
            <div style={{ display: langTab === "fr" ? "block" : "none" }} className="space-y-5">
              <div>
                <input
                  type="text"
                  value={nameFr}
                  onChange={(e) => setNameFr(e.target.value)}
                  placeholder="Nom du produit en francais..."
                  className="w-full px-0 py-2 border-0 border-b border-transparent hover:border-gray-200 focus:border-blue-500 text-2xl font-bold focus:outline-none transition placeholder-gray-300 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Courte Description (French)</label>
                <textarea
                  value={shortDescriptionFr}
                  onChange={(e) => setShortDescriptionFr(e.target.value)}
                  rows={2}
                  placeholder="ex: Baskets haut de gamme avec amorti reactif..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Longue Description (French)</label>
                <textarea
                  value={longDescriptionFr}
                  onChange={(e) => setLongDescriptionFr(e.target.value)}
                  rows={6}
                  placeholder="Description detaillee du produit en francais..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description Generale (French)</label>
                <textarea
                  value={descriptionFr}
                  onChange={(e) => setDescriptionFr(e.target.value)}
                  rows={2}
                  placeholder="Description generale en francais (fallback)..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Images card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-600" />
              Product Images
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Main Image URL <span className="font-normal normal-case text-gray-400">(shown in cards)</span>
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/shoe.jpg"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition"
              />
              {imageUrl && (
                <div className="mt-3 relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden">
                  <img src={imageUrl} alt="Main preview" className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-gray-900 text-white text-[9px] font-bold rounded uppercase tracking-wide">Main</div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Additional Images <span className="font-normal normal-case text-gray-400">(gallery)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const url = newImageUrl.trim();
                      if (url && !extraImages.includes(url) && url !== imageUrl) {
                        setExtraImages([...extraImages, url]);
                        setNewImageUrl("");
                      }
                    }
                  }}
                  placeholder="https://... (Enter or click Add)"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition"
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = newImageUrl.trim();
                    if (url && !extraImages.includes(url) && url !== imageUrl) {
                      setExtraImages([...extraImages, url]);
                      setNewImageUrl("");
                    }
                  }}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition flex-shrink-0"
                >
                  Add
                </button>
              </div>

              {extraImages.length > 0 && (
                <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {extraImages.map((img, i) => (
                    <div key={i} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                      <img src={img} alt={`Extra ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 w-5 h-5 bg-black/60 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {i + 2}
                      </div>
                      {i > 0 && (
                        <button type="button" onClick={() => { const arr = [...extraImages]; [arr[i], arr[i-1]] = [arr[i-1], arr[i]]; setExtraImages(arr); }} className="absolute bottom-1 left-1 w-6 h-6 bg-white/90 rounded-full text-xs opacity-0 group-hover:opacity-100 transition shadow hover:bg-white">&larr;</button>
                      )}
                      {i < extraImages.length - 1 && (
                        <button type="button" onClick={() => { const arr = [...extraImages]; [arr[i], arr[i+1]] = [arr[i+1], arr[i]]; setExtraImages(arr); }} className="absolute bottom-1 left-8 w-6 h-6 bg-white/90 rounded-full text-xs opacity-0 group-hover:opacity-100 transition shadow hover:bg-white">&rarr;</button>
                      )}
                      <button type="button" onClick={() => setExtraImages(extraImages.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition shadow hover:bg-red-600">&times;</button>
                      <button type="button" onClick={() => { const oldMain = imageUrl; setImageUrl(img); const newExtras = extraImages.filter((_, idx) => idx !== i); if (oldMain) newExtras.unshift(oldMain); setExtraImages(newExtras); }} className="absolute bottom-1 right-1 px-2 py-0.5 bg-gray-900 text-white text-[9px] font-bold rounded uppercase opacity-0 group-hover:opacity-100 transition hover:bg-gray-800" title="Set as main">Main</button>
                    </div>
                  ))}
                </div>
              )}

              {(imageUrl || extraImages.length > 0) && (
                <div className="mt-2 text-xs text-gray-500">
                  Total: <span className="font-semibold text-gray-700">{(imageUrl ? 1 : 0) + extraImages.length}</span> image{(imageUrl ? 1 : 0) + extraImages.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>

          {/* Variants card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-gray-600" />
              Variants
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Sizes</label>
                <input type="text" value={sizesStr} onChange={(e) => setSizesStr(e.target.value)} placeholder="7, 8, 9, 10, 11, 12" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition" />
                <p className="text-[11px] text-gray-400 mt-1">Comma separated</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Colors</label>
                <input type="text" value={colorsStr} onChange={(e) => setColorsStr(e.target.value)} placeholder="Black, White, Red" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition" />
                <p className="text-[11px] text-gray-400 mt-1">Comma separated</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Material</label>
                <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Leather, Mesh, Suede..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">SKU</label>
                <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SV-001" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-3">
          {/* Publish + Featured */}
          <SidebarCard title="Status" icon={Layers} defaultOpen={true}>
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 rounded" />
              <div className="flex-1">
                <div className="text-sm font-medium flex items-center gap-1.5">
                  {active ? <Eye className="w-3.5 h-3.5 text-green-600" /> : <EyeOff className="w-3.5 h-3.5 text-orange-500" />}
                  Active
                </div>
                <div className="text-[11px] text-gray-500">Visible on the shop</div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 rounded" />
              <div className="flex-1">
                <div className="text-sm font-medium flex items-center gap-1.5">
                  <Star className={`w-3.5 h-3.5 ${featured ? "fill-amber-400 text-amber-400" : "text-gray-400"}`} />
                  Featured
                </div>
                <div className="text-[11px] text-gray-500">Shown on homepage</div>
              </div>
            </label>
          </SidebarCard>

          {/* Pricing */}
          <SidebarCard title="Pricing" icon={DollarSign} defaultOpen={true}>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Price *</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="99.99" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Compare Price</label>
              <input type="number" step="0.01" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="Original price (for discounts)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition" />
              <p className="text-[11px] text-gray-400 mt-1">Shown crossed out</p>
            </div>
          </SidebarCard>

          {/* Inventory */}
          <SidebarCard title="Inventory" icon={Package} defaultOpen={true}>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Stock</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition" />
              <p className="text-[11px] text-gray-400 mt-1">
                {parseInt(stock) === 0 ? <span className="text-red-500 font-semibold">Out of stock</span> : parseInt(stock) < 10 ? <span className="text-orange-500 font-semibold">Low stock</span> : <span className="text-green-600 font-semibold">In stock</span>}
              </p>
            </div>
          </SidebarCard>

          {/* Organization */}
          <SidebarCard title="Organization" icon={Tag} defaultOpen={true}>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition bg-white">
                {categoriesToShow.map(c => (
                  <option key={c.slug} value={c.slug}>{c.nameEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Brand</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Nike, Adidas..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tags (EN)</label>
              <input type="text" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="new, sale, bestseller" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition" />
              <p className="text-[11px] text-gray-400 mt-1">Comma separated</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tags (FR)</label>
              <input type="text" value={tagsFrStr} onChange={(e) => setTagsFrStr(e.target.value)} placeholder="ex: bon-plan, nouveaute" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition" />
            </div>
          </SidebarCard>

          {/* SEO */}
          <SidebarCard title="SEO" icon={Search} defaultOpen={false}>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-[10px] font-semibold text-gray-500 uppercase mb-1.5">Google Preview</div>
              <div className="text-[10px] text-gray-600 truncate">mywebsite-inky-gamma.vercel.app &rsaquo; product &rsaquo; {name ? name.toLowerCase().replace(/\s+/g,"-").slice(0,30) : "slug"}</div>
              <div className="text-[#1a0dab] text-sm leading-tight my-1" style={{fontFamily:"arial,sans-serif"}}>
                {(seoTitle || name || "SEO title").slice(0, 60)}
              </div>
              <div className="text-[11px] text-gray-700 leading-snug line-clamp-2" style={{fontFamily:"arial,sans-serif"}}>
                {(metaDescription || shortDescription || "Meta description").slice(0, 155)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Focus Keyphrase</label>
              <input type="text" value={focusKeyphrase} onChange={(e) => setFocusKeyphrase(e.target.value)} placeholder="nike air max" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">SEO Title</label>
                <span className={`text-[10px] font-medium ${seoTitle.length > 60 ? "text-red-500" : seoTitle.length > 50 ? "text-green-600" : "text-gray-400"}`}>{seoTitle.length}/60</span>
              </div>
              <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={name || "Leave empty to use product name"} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Meta Description</label>
                <span className={`text-[10px] font-medium ${metaDescription.length > 155 ? "text-red-500" : metaDescription.length >= 120 ? "text-green-600" : "text-gray-400"}`}>{metaDescription.length}/155</span>
              </div>
              <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} placeholder="Compelling summary (120-155 chars)..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition resize-none" />
            </div>
          </SidebarCard>

          {/* French SEO */}
          <SidebarCard title="French SEO" icon={Globe} defaultOpen={false}>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Focus Keyphrase (FR)</label>
              <input type="text" value={focusKeyphraseFr} onChange={(e) => setFocusKeyphraseFr(e.target.value)} placeholder="ex: baskets nike" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Titre SEO (FR)</label>
                <span className={`text-[10px] font-medium ${seoTitleFr.length > 60 ? "text-red-500" : seoTitleFr.length > 50 ? "text-green-600" : "text-gray-400"}`}>{seoTitleFr.length}/60</span>
              </div>
              <input type="text" value={seoTitleFr} onChange={(e) => setSeoTitleFr(e.target.value)} placeholder={nameFr || "Vide = nom du produit"} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Meta Description (FR)</label>
                <span className={`text-[10px] font-medium ${metaDescriptionFr.length > 155 ? "text-red-500" : metaDescriptionFr.length >= 120 ? "text-green-600" : "text-gray-400"}`}>{metaDescriptionFr.length}/155</span>
              </div>
              <textarea value={metaDescriptionFr} onChange={(e) => setMetaDescriptionFr(e.target.value)} rows={3} placeholder="Description en francais..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none" />
            </div>
          </SidebarCard>

          {/* Advanced */}
          <SidebarCard title="Advanced" icon={Save} defaultOpen={false}>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">OG Image URL</label>
              <input type="url" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="Leave empty to use product image" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Canonical URL</label>
              <input type="url" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="Leave empty for auto" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition" />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition">
              <input type="checkbox" checked={noIndex} onChange={(e) => setNoIndex(e.target.checked)} className="w-4 h-4 rounded" />
              <div className="flex-1">
                <div className="text-xs font-medium">Hide from search engines</div>
                <div className="text-[11px] text-gray-500">Prevents Google indexing</div>
              </div>
            </label>
          </SidebarCard>
        </aside>
      </div>
    </form>
  );
}
