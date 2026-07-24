"use client";

import { useState, useEffect } from "react";
import type { BlogPost, Author } from "@/db/schema";
import BlogEditor from "./BlogEditor";
import { Save, Eye, EyeOff, Star, ChevronDown, Search, Globe, Image as ImageIcon, Tag, User, Layers } from "lucide-react";

const CATEGORIES = [
  { slug: "style-tips",       name: "Style Tips",       nameFr: "Conseils de style" },
  { slug: "product-reviews",  name: "Product Reviews",  nameFr: "Tests produits" },
  { slug: "sneaker-news",     name: "Sneaker News",     nameFr: "Actualites sneaker" },
  { slug: "care-guides",      name: "Care Guides",      nameFr: "Guides d'entretien" },
  { slug: "buying-guides",    name: "Buying Guides",    nameFr: "Guides d'achat" },
  { slug: "brand-stories",    name: "Brand Stories",    nameFr: "Histoires de marques" },
];

interface Props {
  post?: BlogPost;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
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

export default function BlogPostForm({ post, onSave, onCancel, loading }: Props) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [langTab, setLangTab] = useState<"en" | "fr">("en");

  // English
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [category, setCategory] = useState(post?.category || "style-tips");
  const [tagsStr, setTagsStr] = useState(() => {
    try { return post?.tags ? (JSON.parse(post.tags) as string[]).join(", ") : ""; } catch { return ""; }
  });
  const [authorId, setAuthorId] = useState(post?.authorId || "");
  const [published, setPublished] = useState(post?.published || false);
  const [featured, setFeatured] = useState(post?.featured || false);

  // French
  const [titleFr, setTitleFr] = useState(post?.titleFr || "");
  const [excerptFr, setExcerptFr] = useState(post?.excerptFr || "");
  const [contentFr, setContentFr] = useState(post?.contentFr || "");
  const [tagsFrStr, setTagsFrStr] = useState(() => {
    if (!post?.tagsFr) return "";
    try { return (JSON.parse(post.tagsFr) as string[]).join(", "); } catch { return ""; }
  });

  // SEO
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "");
  const [focusKeyphrase, setFocusKeyphrase] = useState(post?.focusKeyphrase || "");
  const [ogImage, setOgImage] = useState(post?.ogImage || "");
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl || "");
  const [noIndex, setNoIndex] = useState(post?.noIndex || false);
  const [seoTitleFr, setSeoTitleFr] = useState(post?.seoTitleFr || "");
  const [metaDescriptionFr, setMetaDescriptionFr] = useState(post?.metaDescriptionFr || "");
  const [focusKeyphraseFr, setFocusKeyphraseFr] = useState(post?.focusKeyphraseFr || "");

  useEffect(() => {
    fetch("/api/authors")
      .then(r => r.json())
      .then((data: Author[]) => {
        setAuthors(data);
        if (!authorId && data.length > 0) setAuthorId(data[0].id);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent, publish?: boolean) => {
    e.preventDefault();
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    const tagsFr = tagsFrStr.split(",").map((t) => t.trim()).filter(Boolean);

    await onSave({
      title,
      slug: slug || undefined,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      authorId: authorId || null,
      published: publish !== undefined ? publish : published,
      featured,
      titleFr: titleFr || null,
      excerptFr: excerptFr || null,
      contentFr: contentFr || null,
      tagsFr: tagsFr.length > 0 ? tagsFr : null,
      seoTitle: seoTitle || null,
      metaDescription: metaDescription || null,
      focusKeyphrase: focusKeyphrase || null,
      ogImage: ogImage || null,
      canonicalUrl: canonicalUrl || null,
      noIndex,
      seoTitleFr: seoTitleFr || null,
      metaDescriptionFr: metaDescriptionFr || null,
      focusKeyphraseFr: focusKeyphraseFr || null,
    });
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="max-w-full space-y-4">
      {/* TOP BAR */}
      <div className="flex items-center justify-between sticky top-0 bg-gray-50 py-3 z-30 -mx-2 px-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold">{post ? "Edit Post" : "New Post"}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {published ? <span className="text-green-600 font-semibold">Published</span> : <span className="text-orange-500 font-semibold">Draft</span>}
            {" - "}{wordCount} words
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
            Cancel
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, false)} disabled={loading} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
            {loading ? "..." : "Save Draft"}
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading || !title} className="px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50">
            {loading ? "..." : (published ? "Update" : "Publish")}
          </button>
        </div>
      </div>

      {/* WORDPRESS-STYLE 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
        {/* LEFT: EDITOR */}
        <div className="min-w-0 bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
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
                {(titleFr || contentFr) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="French content added" />
                )}
              </button>
            </div>
            <span className="text-xs text-gray-500">
              {langTab === "en" ? "Required" : "Optional but recommended"}
            </span>
          </div>

          {/* EN */}
          <div style={{ display: langTab === "en" ? "block" : "none" }} className="space-y-5">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Add title..."
                className="w-full px-0 py-2 border-0 border-b border-transparent hover:border-gray-200 focus:border-gray-900 text-2xl font-bold focus:outline-none transition placeholder-gray-300 bg-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Slug <span className="font-normal normal-case text-gray-400">(auto)</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="post-url-slug"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="A short summary that hooks the reader..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Content
              </label>
              {langTab === "en" && (
                <BlogEditor value={content} onChange={setContent} placeholder="Start writing your post..." minHeight={500} />
              )}
            </div>
          </div>

          {/* FR */}
          <div style={{ display: langTab === "fr" ? "block" : "none" }} className="space-y-5">
            <div>
              <input
                type="text"
                value={titleFr}
                onChange={(e) => setTitleFr(e.target.value)}
                placeholder="Ajouter un titre..."
                className="w-full px-0 py-2 border-0 border-b border-transparent hover:border-gray-200 focus:border-blue-500 text-2xl font-bold focus:outline-none transition placeholder-gray-300 bg-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Resume (French)
              </label>
              <textarea
                value={excerptFr}
                onChange={(e) => setExcerptFr(e.target.value)}
                rows={2}
                placeholder="Un court resume qui accroche..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Contenu (French)
              </label>
              {langTab === "fr" && (
                <BlogEditor value={contentFr} onChange={setContentFr} placeholder="Commencez a ecrire en francais..." minHeight={500} />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-3">
          {/* Status card */}
          <SidebarCard title="Status" icon={Layers} defaultOpen={true}>
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4 rounded" />
              <div className="flex-1">
                <div className="text-sm font-medium flex items-center gap-1.5">
                  {published ? <Eye className="w-3.5 h-3.5 text-green-600" /> : <EyeOff className="w-3.5 h-3.5 text-orange-500" />}
                  Published
                </div>
                <div className="text-[11px] text-gray-500">Visible on the site</div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 rounded" />
              <div className="flex-1">
                <div className="text-sm font-medium flex items-center gap-1.5">
                  <Star className={`w-3.5 h-3.5 ${featured ? "fill-amber-400 text-amber-400" : "text-gray-400"}`} />
                  Featured
                </div>
                <div className="text-[11px] text-gray-500">Shown at top of blog</div>
              </div>
            </label>
          </SidebarCard>

          {/* Category + Author */}
          <SidebarCard title="Category &amp; Author" icon={User}>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition bg-white">
                {CATEGORIES.map(c => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Author</label>
              <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition bg-white">
                <option value="">No author</option>
                {authors.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </SidebarCard>

          {/* Cover image */}
          <SidebarCard title="Cover Image" icon={ImageIcon}>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition"
            />
            {coverImage && (
              <div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden mt-2">
                <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
            )}
          </SidebarCard>

          {/* Tags */}
          <SidebarCard title="Tags" icon={Tag}>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tags (English)</label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="chunky, streetwear, 2026"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">Comma separated</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tags (French)</label>
              <input
                type="text"
                value={tagsFrStr}
                onChange={(e) => setTagsFrStr(e.target.value)}
                placeholder="chunky, streetwear, 2026"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </SidebarCard>

          {/* SEO */}
          <SidebarCard title="SEO" icon={Search} defaultOpen={false}>
            {/* Google preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-[10px] font-semibold text-gray-500 uppercase mb-1.5">Google Preview</div>
              <div className="text-[10px] text-gray-600 truncate">mywebsite-inky-gamma.vercel.app &rsaquo; blog &rsaquo; {slug || (title ? title.toLowerCase().replace(/\s+/g,"-").slice(0,30) : "post")}</div>
              <div className="text-[#1a0dab] text-sm leading-tight font-normal my-1" style={{fontFamily:"arial,sans-serif"}}>
                {(seoTitle || title || "Your post SEO title").slice(0, 60)}
              </div>
              <div className="text-[11px] text-gray-700 leading-snug line-clamp-2" style={{fontFamily:"arial,sans-serif"}}>
                {(metaDescription || excerpt || "Your meta description will appear here.").slice(0, 155)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Focus Keyphrase</label>
              <input type="text" value={focusKeyphrase} onChange={(e) => setFocusKeyphrase(e.target.value)} placeholder="chunky sneakers 2026" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">SEO Title</label>
                <span className={`text-[10px] font-medium ${seoTitle.length > 60 ? "text-red-500" : seoTitle.length > 50 ? "text-green-600" : "text-gray-400"}`}>
                  {seoTitle.length}/60
                </span>
              </div>
              <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title || "Leave empty to use post title"} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Meta Description</label>
                <span className={`text-[10px] font-medium ${metaDescription.length > 155 ? "text-red-500" : metaDescription.length >= 120 ? "text-green-600" : "text-gray-400"}`}>
                  {metaDescription.length}/155
                </span>
              </div>
              <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} placeholder="Compelling summary (120-155 chars)..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition resize-none" />
            </div>
          </SidebarCard>

          {/* French SEO */}
          <SidebarCard title="French SEO" icon={Globe} defaultOpen={false}>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Focus Keyphrase (FR)</label>
              <input type="text" value={focusKeyphraseFr} onChange={(e) => setFocusKeyphraseFr(e.target.value)} placeholder="baskets chunky 2026" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Titre SEO (FR)</label>
                <span className={`text-[10px] font-medium ${seoTitleFr.length > 60 ? "text-red-500" : seoTitleFr.length > 50 ? "text-green-600" : "text-gray-400"}`}>{seoTitleFr.length}/60</span>
              </div>
              <input type="text" value={seoTitleFr} onChange={(e) => setSeoTitleFr(e.target.value)} placeholder={titleFr || "Vide = utilise le titre"} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Meta Description (FR)</label>
                <span className={`text-[10px] font-medium ${metaDescriptionFr.length > 155 ? "text-red-500" : metaDescriptionFr.length >= 120 ? "text-green-600" : "text-gray-400"}`}>{metaDescriptionFr.length}/155</span>
              </div>
              <textarea value={metaDescriptionFr} onChange={(e) => setMetaDescriptionFr(e.target.value)} rows={3} placeholder="Description en francais (120-155 caracteres)..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none" />
            </div>
          </SidebarCard>

          {/* Advanced */}
          <SidebarCard title="Advanced" icon={Save} defaultOpen={false}>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Open Graph Image</label>
              <input type="url" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="Leave empty to use cover image" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition" />
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
