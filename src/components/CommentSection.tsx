"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, Heart, Reply, Send, User } from "lucide-react";
import type { BlogComment } from "@/db/schema";

interface Props {
  postId: string;
}

const AVATAR_COLORS = [
  "from-blue-400 to-blue-600",
  "from-pink-400 to-rose-600",
  "from-emerald-400 to-green-600",
  "from-purple-400 to-violet-600",
  "from-amber-400 to-orange-600",
  "from-teal-400 to-cyan-600",
  "from-red-400 to-red-600",
  "from-indigo-400 to-indigo-600",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function timeAgo(date: string | Date, isFr: boolean) {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return isFr ? "a l'instant" : "just now";
  if (seconds < 3600) return isFr ? `il y a ${Math.floor(seconds / 60)} min` : `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return isFr ? `il y a ${Math.floor(seconds / 3600)} h` : `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return isFr ? `il y a ${Math.floor(seconds / 86400)} j` : `${Math.floor(seconds / 86400)}d ago`;
  return d.toLocaleDateString(isFr ? "fr-FR" : "en-US");
}

export default function CommentSection({ postId }: Props) {
  const pathname = usePathname();
  const isFr = pathname?.startsWith("/fr");

  const t = isFr ? {
    heading: "Commentaires",
    empty: "Soyez le premier a commenter !",
    formTitle: "Laisser un commentaire",
    name: "Nom",
    namePh: "Votre nom",
    email: "Email (optionnel, non publie)",
    emailPh: "vous@exemple.com",
    content: "Commentaire",
    contentPh: "Partagez vos pensees...",
    submit: "Envoyer",
    submitting: "Envoi...",
    thanks: "Merci ! Votre commentaire est en attente de moderation.",
    error: "Une erreur est survenue. Reessayez.",
    reply: "Repondre",
    cancel: "Annuler",
    replying: "Reponse a",
    likes: "j'aimes",
    like: "j'aime",
    pending: "En attente de moderation",
  } : {
    heading: "Comments",
    empty: "Be the first to comment!",
    formTitle: "Leave a comment",
    name: "Name",
    namePh: "Your name",
    email: "Email (optional, not published)",
    emailPh: "you@example.com",
    content: "Comment",
    contentPh: "Share your thoughts...",
    submit: "Post comment",
    submitting: "Posting...",
    thanks: "Thanks! Your comment is awaiting moderation.",
    error: "Something went wrong. Try again.",
    reply: "Reply",
    cancel: "Cancel",
    replying: "Replying to",
    likes: "likes",
    like: "like",
    pending: "Pending moderation",
  };

  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [replyTo, setReplyTo] = useState<BlogComment | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Load liked comments from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sv_liked_comments");
      if (stored) setLikedIds(new Set(JSON.parse(stored)));
      const storedName = localStorage.getItem("sv_commenter_name");
      if (storedName) setName(storedName);
      const storedEmail = localStorage.getItem("sv_commenter_email");
      if (storedEmail) setEmail(storedEmail);
    } catch { /* ignore */ }
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/blog-comments?postId=${postId}`);
      if (res.ok) setComments(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/blog-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          parentId: replyTo?.id || null,
          authorName: name,
          authorEmail: email,
          content,
        }),
      });
      if (res.ok) {
        // Remember commenter info for next time
        try {
          localStorage.setItem("sv_commenter_name", name);
          if (email) localStorage.setItem("sv_commenter_email", email);
        } catch { /* ignore */ }

        setContent("");
        setReplyTo(null);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 6000);
      } else {
        setError(t.error);
      }
    } catch {
      setError(t.error);
    }
    setSubmitting(false);
  };

  const handleLike = async (comment: BlogComment) => {
    const isLiked = likedIds.has(comment.id);
    const newLiked = new Set(likedIds);
    if (isLiked) newLiked.delete(comment.id);
    else newLiked.add(comment.id);
    setLikedIds(newLiked);

    // Optimistic update
    setComments(prev => prev.map(c =>
      c.id === comment.id ? { ...c, likes: Math.max(0, c.likes + (isLiked ? -1 : 1)) } : c
    ));

    try {
      localStorage.setItem("sv_liked_comments", JSON.stringify([...newLiked]));
      await fetch(`/api/blog-comments/${comment.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlike: isLiked }),
      });
    } catch { /* ignore */ }
  };

  const topLevel = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  const CommentItem = ({ c, isReply = false }: { c: BlogComment; isReply?: boolean }) => {
    const isLiked = likedIds.has(c.id);
    const replies = getReplies(c.id);

    return (
      <div className={isReply ? "pl-6 sm:pl-12 border-l-2 border-gray-100 ml-2" : ""}>
        <div className="flex items-start gap-3 py-4">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(c.authorName)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {getInitials(c.authorName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-semibold text-sm">{c.authorName}</span>
              <span className="text-xs text-gray-500">{timeAgo(c.createdAt, !!isFr)}</span>
            </div>
            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">{c.content}</p>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => handleLike(c)}
                className={`flex items-center gap-1 text-xs font-medium transition ${isLiked ? "text-red-500" : "text-gray-500 hover:text-gray-900"}`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-red-500" : ""}`} />
                {c.likes > 0 && <span>{c.likes}</span>}
              </button>
              {!isReply && (
                <button
                  onClick={() => { setReplyTo(c); document.getElementById("comment-form")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition"
                >
                  <Reply className="w-3.5 h-3.5" /> {t.reply}
                </button>
              )}
            </div>
          </div>
        </div>
        {replies.length > 0 && (
          <div>
            {replies.map(r => <CommentItem key={r.id} c={r} isReply />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-0">
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        <div className="lg:pr-4">
          <div className="border-t border-gray-100 pt-8">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-gray-700" />
          <h2 className="text-2xl font-bold">
            {t.heading} {topLevel.length > 0 && <span className="text-gray-400 font-normal">({comments.length})</span>}
          </h2>
        </div>

        {/* Comment form */}
        <form
          id="comment-form"
          onSubmit={handleSubmit}
          className="rounded-2xl p-5 lg:p-6 mb-8 border border-gray-800 bg-gray-950 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-white">{t.formTitle}</h3>
            {replyTo && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">{t.replying}</span>
                <span className="font-semibold">{replyTo.authorName}</span>
                <button type="button" onClick={() => setReplyTo(null)} className="text-red-500 hover:underline">{t.cancel}</button>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">{t.name} *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePh}
                required
                maxLength={100}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] focus:border-[#CA3F2E] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPh}
                maxLength={200}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] focus:border-[#CA3F2E] transition"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-300 mb-1">{t.content} *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.contentPh}
              required
              rows={4}
              maxLength={5000}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] focus:border-[#CA3F2E] transition resize-none"
            />
          </div>

          {success && (
            <div className="mb-3 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
              {t.thanks}
            </div>
          )}
          {error && (
            <div className="mb-3 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !name.trim() || !content.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl text-sm font-bold uppercase tracking-wide hover:brightness-110 hover:shadow-xl transition disabled:opacity-50 shadow-lg" style={{ backgroundColor: "#CA3F2E", boxShadow: "0 4px 14px rgba(202, 63, 46, 0.4)" }}
          >
            <Send className="w-4 h-4" /> {submitting ? t.submitting : t.submit}
          </button>
          <p className="text-xs text-gray-400 mt-3">{t.pending}.</p>
        </form>

        {/* Comments list */}
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
        ) : topLevel.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            {t.empty}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {topLevel.map(c => <CommentItem key={c.id} c={c} />)}
          </div>
        )}
          </div>
        </div>
      </div>
    </section>
  );
}
