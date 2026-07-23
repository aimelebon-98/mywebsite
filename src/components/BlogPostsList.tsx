"use client";

import { useState, useEffect } from "react";
import type { BlogPost, Author } from "@/db/schema";
import { Plus, Edit2, Trash2, Search, Eye, Star, FileText } from "lucide-react";

const CATEGORIES = [
  { slug: "all", name: "All Categories" },
  { slug: "style-tips", name: "Style Tips" },
  { slug: "product-reviews", name: "Product Reviews" },
  { slug: "sneaker-news", name: "Sneaker News" },
  { slug: "care-guides", name: "Care Guides" },
  { slug: "buying-guides", name: "Buying Guides" },
  { slug: "brand-stories", name: "Brand Stories" },
];

interface Props {
  onEdit: (post: BlogPost) => void;
  onAdd: () => void;
  onNotify: (msg: string, type?: "success" | "error") => void;
  refreshKey: number;
}

export default function BlogPostsList({ onEdit, onAdd, onNotify, refreshKey }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([
        fetch("/api/blog?published=false"),
        fetch("/api/authors?active=false"),
      ]);
      if (pRes.ok) setPosts(await pRes.json());
      if (aRes.ok) setAuthors(await aRes.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [refreshKey]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
      if (res.ok) {
        onNotify("Post deleted", "success");
        fetchPosts();
      }
    } catch {
      onNotify("Failed to delete", "error");
    }
  };

  const togglePublished = async (post: BlogPost) => {
    try {
      await fetch(`/api/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });
      fetchPosts();
    } catch { /* ignore */ }
  };

  const toggleFeatured = async (post: BlogPost) => {
    try {
      await fetch(`/api/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !post.featured }),
      });
      fetchPosts();
    } catch { /* ignore */ }
  };

  const authorMap = new Map(authors.map(a => [a.id, a]));

  const filtered = posts.filter(p => {
    if (statusFilter === "published" && !p.published) return false;
    if (statusFilter === "draft" && p.published) return false;
    if (category !== "all" && p.category !== category) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">Blog Posts</h2>
          <p className="text-sm text-gray-500 mt-0.5">{posts.length} total posts</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition">
          {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(["all", "published", "draft"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${statusFilter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No posts yet.</p>
          <button onClick={onAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
            <Plus className="w-4 h-4" /> Write your first post
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const author = p.authorId ? authorMap.get(p.authorId) : null;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                {p.coverImage ? (
                  <img src={p.coverImage} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-gray-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    {p.published ? (
                      <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-semibold">PUBLISHED</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-semibold">DRAFT</span>
                    )}
                    {p.featured && <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-semibold flex items-center gap-1"><Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> FEATURED</span>}
                    {p.titleFr && <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-semibold">FR</span>}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{p.excerpt || "No excerpt"}</p>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span>{p.category}</span>
                    <span>&middot;</span>
                    <span>{p.readTime} min read</span>
                    {author && <><span>&middot;</span><span>by {author.name}</span></>}
                    <span>&middot;</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.viewCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => togglePublished(p)}
                    title={p.published ? "Unpublish" : "Publish"}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${p.published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {p.published ? "Live" : "Draft"}
                  </button>
                  <button onClick={() => toggleFeatured(p)} title="Toggle featured" className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${p.featured ? "text-amber-500 hover:bg-amber-50" : "text-gray-400 hover:bg-gray-50"}`}>
                    <Star className={`w-4 h-4 ${p.featured ? "fill-amber-500" : ""}`} />
                  </button>
                  <button onClick={() => onEdit(p)} title="Edit" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id, p.title)} title="Delete" className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
