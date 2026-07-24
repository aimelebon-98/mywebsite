"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, FileText, Star, Eye, MessageSquare, Globe, ArrowRight, ExternalLink } from "lucide-react";
import type { BlogPost, BlogComment } from "@/db/schema";

interface Props {
  onAddPost?: () => void;
  onOpenBlog?: () => void;
  onOpenComments?: () => void;
}

export default function DashboardBlogStats({ onAddPost, onOpenBlog, onOpenComments }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/blog?published=false").then(r => r.ok ? r.json() : []),
      fetch("/api/blog-comments?all=true", { credentials: "include" }).then(r => r.ok ? r.json() : []),
    ]).then(([p, c]) => {
      setPosts(p);
      setComments(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
        <div className="h-6 w-40 bg-gray-100 rounded mb-4"></div>
        <div className="grid grid-cols-4 gap-4">
          <div className="h-16 bg-gray-100 rounded-xl"></div>
          <div className="h-16 bg-gray-100 rounded-xl"></div>
          <div className="h-16 bg-gray-100 rounded-xl"></div>
          <div className="h-16 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const total = posts.length;
  const published = posts.filter(p => p.published).length;
  const draft = total - published;
  const featured = posts.filter(p => p.featured).length;
  const totalViews = posts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const totalComments = comments.length;
  const pendingComments = comments.filter(c => !c.approved).length;
  const withFr = posts.filter(p => p.titleFr).length;
  const frPct = total > 0 ? Math.round((withFr / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Blog Overview</h3>
            <p className="text-xs text-gray-500">All the blog metrics at a glance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/en/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition"
            title="Open live blog in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View live
          </a>
          {onAddPost && (
            <button
              onClick={onAddPost}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition"
            >
              + New Post
            </button>
          )}
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenBlog}
          className="text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition group"
        >
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <FileText className="w-3.5 h-3.5" />
            Total posts
          </div>
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            <span className="text-green-600 font-semibold">{published}</span> live &middot;{" "}
            <span className="text-orange-600 font-semibold">{draft}</span> draft
          </div>
        </button>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Star className="w-3.5 h-3.5" />
            Featured
          </div>
          <div className="text-2xl font-bold text-amber-600">{featured}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Shown on top</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Eye className="w-3.5 h-3.5" />
            Total views
          </div>
          <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">All-time reads</div>
        </div>

        <button
          onClick={onOpenComments}
          className="text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition group"
        >
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            Comments
          </div>
          <div className="text-2xl font-bold">{totalComments}</div>
          <div className="text-[11px] mt-0.5">
            {pendingComments > 0 ? (
              <span className="text-orange-600 font-semibold">{pendingComments} pending</span>
            ) : (
              <span className="text-gray-500">All approved</span>
            )}
          </div>
        </button>
      </div>

      {/* French translation progress */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold">French Translations</span>
          </div>
          <span className="text-xs text-gray-500">
            <span className="font-semibold text-gray-900">{withFr}</span> / {total} ({frPct}%)
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
            style={{ width: `${frPct}%` }}
          />
        </div>
      </div>

      {/* Recent activity */}
      {onOpenBlog && total > 0 && (
        <button
          onClick={onOpenBlog}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition text-sm text-gray-700 group"
        >
          <span className="font-medium">Manage all blog posts</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}
