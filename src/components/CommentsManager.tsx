"use client";

import { useState, useEffect } from "react";
import type { BlogComment, BlogPost } from "@/db/schema";
import { Check, X, Trash2, MessageSquare, Clock, Heart, CheckSquare, Square } from "lucide-react";

interface Props {
  onNotify: (msg: string, type?: "success" | "error") => void;
}

const AVATAR_COLORS = [
  "from-blue-400 to-blue-600",
  "from-pink-400 to-rose-600",
  "from-emerald-400 to-green-600",
  "from-purple-400 to-violet-600",
  "from-amber-400 to-orange-600",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function CommentsManager({ onNotify }: Props) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([
        fetch("/api/blog-comments?all=true", { credentials: "include" }),
        fetch("/api/blog?published=false"),
      ]);
      if (cRes.ok) setComments(await cRes.json());
      if (pRes.ok) setPosts(await pRes.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const approve = async (id: string) => {
    try {
      await fetch(`/api/blog-comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      onNotify("Comment approved");
      fetchAll();
    } catch {
      onNotify("Failed to approve", "error");
    }
  };

  const unapprove = async (id: string) => {
    try {
      await fetch(`/api/blog-comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: false }),
      });
      onNotify("Comment unpublished");
      fetchAll();
    } catch {
      onNotify("Failed", "error");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this comment permanently?")) return;
    try {
      await fetch(`/api/blog-comments/${id}`, { method: "DELETE" });
      onNotify("Comment deleted");
      fetchAll();
    } catch {
      onNotify("Failed to delete", "error");
    }
  };

  const handleBulkAction = async (action: "approve" | "unapprove" | "delete") => {
    if (selectedIds.size === 0) return;
    if (action === "delete" && !confirm(`Delete ${selectedIds.size} selected comment(s) permanently?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/blog-comments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ids: Array.from(selectedIds),
        }),
      });

      if (res.ok) {
        onNotify(`Bulk ${action} succeeded for ${selectedIds.size} comment(s)`);
        setSelectedIds(new Set());
        fetchAll();
      } else {
        onNotify(`Bulk ${action} failed`, "error");
      }
    } catch {
      onNotify(`Failed to perform bulk ${action}`, "error");
    }
    setActionLoading(false);
  };

  const postMap = new Map(posts.map(p => [p.id, p]));
  const commentMap = new Map(comments.map(c => [c.id, c]));

  const filtered = comments.filter(c => {
    if (filter === "pending") return !c.approved;
    if (filter === "approved") return c.approved;
    return true;
  });

  const pendingCount = comments.filter(c => !c.approved).length;

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Comments
            {pendingCount > 0 && (
              <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-semibold">
                {pendingCount} pending
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{comments.length} total comments</p>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1">
          {(["pending", "approved", "all"] as const).map(s => (
            <button
              key={s}
              onClick={() => { setFilter(s); setSelectedIds(new Set()); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition capitalize ${filter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              {s} {s === "pending" && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex-wrap gap-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 transition"
          >
            {selectedIds.size > 0 && selectedIds.size === filtered.length ? (
              <CheckSquare className="w-4 h-4 text-[#CA3F2E]" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
            Select All ({filtered.length})
          </button>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-500 mr-1">
                {selectedIds.size} selected:
              </span>
              <button
                disabled={actionLoading}
                onClick={() => handleBulkAction("approve")}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition border border-emerald-200"
              >
                <Check className="w-3.5 h-3.5" /> Approve Selected
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleBulkAction("unapprove")}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold transition border border-amber-200"
              >
                <X className="w-3.5 h-3.5" /> Unpublish Selected
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleBulkAction("delete")}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Selected
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {filter === "pending" ? "No pending comments." : filter === "approved" ? "No approved comments yet." : "No comments yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const post = postMap.get(c.postId);
            const parent = c.parentId ? commentMap.get(c.parentId) : null;
            const isSelected = selectedIds.has(c.id);

            return (
              <div
                key={c.id}
                className={`bg-white rounded-2xl border p-4 transition ${isSelected ? "border-[#CA3F2E] ring-1 ring-[#CA3F2E]" : c.approved ? "border-gray-100" : "border-orange-200 bg-orange-50/30"}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleSelectOne(c.id)}
                    className="mt-1 text-gray-400 hover:text-[#CA3F2E] transition flex-shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#CA3F2E]" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-300" />
                    )}
                  </button>

                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(c.authorName)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {getInitials(c.authorName)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{c.authorName}</span>
                      {c.authorEmail && <span className="text-xs text-gray-500">&lt;{c.authorEmail}&gt;</span>}
                      {c.locale && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.locale === "fr" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                          {c.locale.toUpperCase()}
                        </span>
                      )}
                      {c.approved ? (
                        <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-semibold">APPROVED</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-semibold">PENDING</span>
                      )}
                      {parent && <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-semibold">REPLY TO {parent.authorName.toUpperCase()}</span>}
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words mb-2">{c.content}</p>
                    <div className="text-xs text-gray-500 flex items-center gap-3 flex-wrap">
                      {post && (
                        <a href={`/${c.locale || "en"}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 underline">
                          on: {post.title}
                        </a>
                      )}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(c.createdAt).toLocaleString()}</span>
                      {c.likes > 0 && <span className="flex items-center gap-1"><Heart className="w-3 h-3 fill-red-400 text-red-400" /> {c.likes}</span>}
                      {c.ipAddress && <span className="text-gray-400">{c.ipAddress}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {c.approved ? (
                      <button onClick={() => unapprove(c.id)} title="Unpublish" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => approve(c.id)} title="Approve" className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-50 transition">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => del(c.id)} title="Delete" className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}