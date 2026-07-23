"use client";

import { useState, useEffect } from "react";
import type { BlogPost, Author } from "@/db/schema";
import BlogEditor from "./BlogEditor";

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

export default function BlogPostForm({ post, onSave, onCancel, loading }: Props) {
  const [authors, setAuthors] = useState<Author[]>([]);

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

  const [showFrench, setShowFrench] = useState(!!(post?.titleFr || post?.contentFr));

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

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="max-w-4xl space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between sticky top-0 bg-gray-50 py-3 z-20 -mx-2 px-2">
        <div>
          <h2 className="text-xl font-bold">{post ? "Edit Post" : "New Post"}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {published ? <span className="text-green-600 font-semibold">Published</span> : <span className="text-orange-500 font-semibold">Draft</span>}
            {" - "}
            {content.split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button type="button" onClick={(e) => handleSubmit(e, false)} disabled={loading} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
            {loading ? "..." : "Save Draft"}
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading || !title} className="px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50">
            {loading ? "..." : (published ? "Update" : "Publish")}
          </button>
        </div>
      </div>

      {/* Basic English */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="font-bold text-lg">Post (English)</h3>

        <div>
          <label className="block text-sm font-medium mb-1.5">Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="How to Style Chunky Sneakers in 2026" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Slug <span className="text-xs text-gray-500 font-normal">(leave empty to auto-generate)</span></label>
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="how-to-style-chunky-sneakers-2026" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Excerpt <span className="text-xs text-gray-500 font-normal">(shown in list + social preview)</span></label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} placeholder="A short summary that hooks the reader..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Content *</label>
          <BlogEditor value={content} onChange={setContent} placeholder="Start writing your post..." minHeight={500} />
        </div>
      </div>

      {/* Cover + meta */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="font-bold text-lg">Cover &amp; Meta</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Cover Image URL</label>
            <input type="url" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
            {coverImage && (
              <div className="mt-3 aspect-[16/9] max-w-md bg-gray-100 rounded-xl overflow-hidden">
                <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-white">
              {CATEGORIES.map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Author</label>
            <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-white">
              <option value="">No author</option>
              {authors.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Tags <span className="text-xs text-gray-500 font-normal">(comma separated)</span></label>
            <input type="text" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="chunky, streetwear, 2026" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-5 h-5 rounded" />
            <div>
              <div className="text-sm font-medium">Featured post</div>
              <div className="text-xs text-gray-500">Shown at the top of the blog</div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-5 h-5 rounded" />
            <div>
              <div className="text-sm font-medium">Published</div>
              <div className="text-xs text-gray-500">Visible to visitors</div>
            </div>
          </label>
        </div>
      </div>

      {/* French translations (collapsible) */}
      <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFrench(!showFrench)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-50/50 transition text-left"
        >
          <div>
            <h3 className="font-bold text-lg text-blue-900">French Translation</h3>
            <p className="text-xs text-blue-600 mt-0.5">Optional - only appears on /fr routes</p>
          </div>
          <span className="text-blue-600 text-sm font-semibold">{showFrench ? "Hide" : "Show"}</span>
        </button>

        {showFrench && (
          <div className="p-6 space-y-5 border-t border-blue-100 bg-blue-50/20">
            <div>
              <label className="block text-sm font-medium mb-1.5">Titre (French)</label>
              <input type="text" value={titleFr} onChange={(e) => setTitleFr(e.target.value)} placeholder="Comment porter les baskets chunky en 2026" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Resume (French)</label>
              <textarea value={excerptFr} onChange={(e) => setExcerptFr(e.target.value)} rows={2} placeholder="Un court resume qui accroche..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Contenu (French)</label>
              <BlogEditor value={contentFr} onChange={setContentFr} placeholder="Commencez a ecrire en francais..." minHeight={500} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Tags (French)</label>
              <input type="text" value={tagsFrStr} onChange={(e) => setTagsFrStr(e.target.value)} placeholder="chunky, streetwear, 2026" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
          </div>
        )}
      </div>

      {/* SEO */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">SEO &amp; Search Engines</h3>
            <p className="text-xs text-gray-500 mt-0.5">Optimize how this post appears in Google.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Yoast-style
          </div>
        </div>

        {/* Google Preview */}
        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Google Preview</div>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">mywebsite-inky-gamma.vercel.app &rsaquo; blog &rsaquo; {slug || (title ? title.toLowerCase().replace(/\s+/g,"-").slice(0,40) : "post-slug")}</div>
            <div className="text-[#1a0dab] text-lg leading-tight hover:underline cursor-pointer font-normal" style={{fontFamily:"arial,sans-serif"}}>
              {(seoTitle || title || "Your post SEO title").slice(0, 60)}{(seoTitle || title || "").length > 60 ? "..." : ""}
            </div>
            <div className="text-sm text-gray-700 leading-snug" style={{fontFamily:"arial,sans-serif"}}>
              {(metaDescription || excerpt || "Your meta description will appear here.").slice(0, 155)}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Focus Keyphrase</label>
          <input type="text" value={focusKeyphrase} onChange={(e) => setFocusKeyphrase(e.target.value)} placeholder="chunky sneakers 2026" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium">SEO Title</label>
            <span className={`text-xs font-medium ${seoTitle.length > 60 ? "text-red-500" : seoTitle.length > 50 ? "text-green-600" : "text-gray-400"}`}>
              {seoTitle.length} / 60
            </span>
          </div>
          <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title || "Leave empty to use post title"} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium">Meta Description</label>
            <span className={`text-xs font-medium ${metaDescription.length > 155 ? "text-red-500" : metaDescription.length >= 120 ? "text-green-600" : "text-gray-400"}`}>
              {metaDescription.length} / 155
            </span>
          </div>
          <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} placeholder="Compelling summary (120-155 chars)..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none" />
        </div>

        <details className="border border-gray-200 rounded-xl overflow-hidden">
          <summary className="cursor-pointer px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-sm font-medium select-none">Advanced (OG Image, Canonical, Robots)</summary>
          <div className="p-4 space-y-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium mb-1.5">OG Image URL</label>
              <input type="url" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="Leave empty to use cover image" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Canonical URL</label>
              <input type="url" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="Leave empty for auto" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={noIndex} onChange={(e) => setNoIndex(e.target.checked)} className="w-5 h-5 rounded" />
              <div>
                <div className="text-sm font-medium">Hide from search engines (noindex)</div>
                <div className="text-xs text-gray-500">Google/Bing wont index this post</div>
              </div>
            </label>
          </div>
        </details>

        <details className="border border-blue-200 rounded-xl overflow-hidden">
          <summary className="cursor-pointer px-4 py-3 bg-blue-50 hover:bg-blue-100 transition text-sm font-medium select-none">French SEO (for /fr)</summary>
          <div className="p-4 space-y-4 border-t border-blue-200 bg-blue-50/30">
            <div>
              <label className="block text-sm font-medium mb-1.5">Focus Keyphrase (French)</label>
              <input type="text" value={focusKeyphraseFr} onChange={(e) => setFocusKeyphraseFr(e.target.value)} placeholder="baskets chunky 2026" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium">Titre SEO (French)</label>
                <span className={`text-xs font-medium ${seoTitleFr.length > 60 ? "text-red-500" : seoTitleFr.length > 50 ? "text-green-600" : "text-gray-400"}`}>{seoTitleFr.length} / 60</span>
              </div>
              <input type="text" value={seoTitleFr} onChange={(e) => setSeoTitleFr(e.target.value)} placeholder={titleFr || "Vide = utilise le titre"} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium">Meta Description (French)</label>
                <span className={`text-xs font-medium ${metaDescriptionFr.length > 155 ? "text-red-500" : metaDescriptionFr.length >= 120 ? "text-green-600" : "text-gray-400"}`}>{metaDescriptionFr.length} / 155</span>
              </div>
              <textarea value={metaDescriptionFr} onChange={(e) => setMetaDescriptionFr(e.target.value)} rows={3} placeholder="Description en francais (120-155 caracteres)..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none" />
            </div>
          </div>
        </details>
      </div>
    </form>
  );
}
