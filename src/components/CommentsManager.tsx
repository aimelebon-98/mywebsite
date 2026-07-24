"use client";

import { useState, useEffect } from "react";
import type { BlogComment, BlogPost } from "@/db/schema";
import { Check, X, Trash2, MessageSquare, Clock, Heart } from "lucide-react";

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

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([
        fetch("/api/blog-comments?all=true"),
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

  const postMap = new Map(posts.map(p => [p.id, p]));
  const commentMap = new Map(comments.map(c => [c.id, c]));

  const filtered = comments.filter(c => {
    if (filter === "pending") return !c.approved;
    if (filter === "approved") return c.approved;
    return true;
  });

  const pendingCount = comments.filter(c => !c.approved).length;

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
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition capitalize ${filter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              {s} {s === "pending" && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>
      </div>

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
            return (
              <div key={c.id} className={`bg-white rounded-2xl border p-4 ${c.approved ? "border-gray-100" : "border-orange-200 bg-orange-50/30"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(c.authorName)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {getInitials(c.authorName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{c.authorName}</span>
                      {c.authorEmail && <span className="text-xs text-gray-500">&lt;{c.authorEmail}&gt;</span>}
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
                        <a href={`/en/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 underline">
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
