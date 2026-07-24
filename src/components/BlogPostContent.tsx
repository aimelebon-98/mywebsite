"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost, Author } from "@/db/schema";
import { getCategoryLabel, formatDate } from "@/lib/blog";
import CommentSection from "@/components/CommentSection";
import { Clock, Calendar, ChevronRight, Copy, Check, ArrowLeft, ArrowRight, Home, Sparkles, Eye, List, Share2 } from "lucide-react";

interface Props {
  post: BlogPost;
  author: Author | null;
  relatedPosts: BlogPost[];
  locale: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const BRAND_RED = "#CA3F2E";

export default function BlogPostContent({ post, author, relatedPosts, locale }: Props) {
  const isFr = locale === "fr";
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  const tags = useMemo(() => {
    try { return JSON.parse(post.tags || "[]") as string[]; } catch { return []; }
  }, [post.tags]);

  useEffect(() => {
    fetch(`/api/blog/${post.slug}?trackView=true`).catch(() => {});
  }, [post.slug]);

  useEffect(() => {
    const container = document.getElementById("blog-content");
    if (!container) return;

    const items: TocItem[] = [];
    const headings = container.querySelectorAll("h2, h3");
    headings.forEach((h, idx) => {
      const text = h.textContent || "";
      const id = `heading-${idx}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
      h.id = id;
      items.push({ id, text, level: h.tagName === "H2" ? 2 : 3 });
    });
    setToc(items);
  }, [post.content]);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById("blog-content");
      if (container) {
        const rect = container.getBoundingClientRect();
        const scrolled = Math.max(0, -rect.top);
        const total = rect.height - window.innerHeight;
        setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
      }

      const headings = document.querySelectorAll("#blog-content h2, #blog-content h3");
      let current = "";
      headings.forEach(h => {
        const rect = h.getBoundingClientRect();
        if (rect.top < 150) current = h.id;
      });
      setActiveId(current);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(post.title);

  const ShareIcons = ({ size = "sm" }: { size?: "sm" | "md" }) => {
    const dim = size === "md" ? "w-9 h-9" : "w-8 h-8";
    const iconDim = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
    return (
      <div className="flex items-center gap-2">
        <a
          href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener noreferrer"
          aria-label="Share on Facebook"
          className={`${dim} rounded-full bg-gray-100 hover:bg-[#CA3F2E] hover:text-white flex items-center justify-center transition-all text-gray-600 hover:scale-110`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className={iconDim}>
            <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.6c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.6v3h2.5V21h3.4z" />
          </svg>
        </a>
        <a
          href={`https://instagram.com`}
          target="_blank" rel="noopener noreferrer"
          aria-label="Instagram"
          className={`${dim} rounded-full bg-gray-100 hover:bg-[#CA3F2E] hover:text-white flex items-center justify-center transition-all text-gray-600 hover:scale-110`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconDim}>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>
        <a
          href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          className={`${dim} rounded-full bg-gray-100 hover:bg-[#CA3F2E] hover:text-white flex items-center justify-center transition-all text-gray-600 hover:scale-110`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className={iconDim}>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener noreferrer"
          aria-label="Share on X"
          className={`${dim} rounded-full bg-gray-100 hover:bg-[#CA3F2E] hover:text-white flex items-center justify-center transition-all text-gray-600 hover:scale-110`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className={iconDim}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <button
          onClick={handleCopy}
          aria-label="Copy link"
          className={`${dim} rounded-full flex items-center justify-center transition-all hover:scale-110 ${copied ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-[#CA3F2E] hover:text-white text-gray-600"}`}
        >
          {copied ? <Check className={iconDim} /> : <Copy className={iconDim} />}
        </button>
      </div>
    );
  };

  const wordCount = useMemo(() => {
    const text = post.content.replace(/<[^>]*>/g, "");
    return text.split(/\s+/).filter(Boolean).length;
  }, [post.content]);

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-[88px] lg:top-[96px] left-0 right-0 h-1 bg-gray-100 z-30">
        <div
          className="h-full transition-all duration-100"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg, #CA3F2E 0%, #f97316 100%)", boxShadow: "0 0 12px rgba(202, 63, 46, 0.6)" }}
        />
      </div>

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-8">
          <Link href={`/${locale}`} className="hover:text-[#CA3F2E] transition flex items-center">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/${locale}/blog`} className="hover:text-[#CA3F2E] transition">Blog</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/${locale}/blog?category=${post.category}`} className="hover:text-[#CA3F2E] transition">
            {getCategoryLabel(post.category, isFr)}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-semibold line-clamp-1">{post.title}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
          {/* MAIN COLUMN */}
          <div className="min-w-0">
            {/* Category badge */}
            <Link
              href={`/${locale}/blog?category=${post.category}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-white mb-5 hover:opacity-90 transition"
              style={{ backgroundColor: BRAND_RED }}
            >
              <Sparkles className="w-3 h-3" />
              {getCategoryLabel(post.category, isFr)}
            </Link>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-6 text-gray-900">
              {post.title}
            </h1>

            {/* Excerpt as intro */}
            {post.excerpt && (
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed mb-8 font-light">
                {post.excerpt}
              </p>
            )}

            {/* Author + Meta card */}
            <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
              <div className="flex items-center gap-3">
                {author ? (
                  <>
                    <Link href={`/${locale}/blog/author/${author.slug}`} className="flex-shrink-0">
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                    </Link>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                        {isFr ? "Ecrit par" : "Written by"}
                      </div>
                      <Link href={`/${locale}/blog/author/${author.slug}`} className="text-sm font-bold text-gray-900 hover:text-[#CA3F2E] transition block">
                        {author.name}
                      </Link>
                      {(isFr ? author.roleFr : author.role) && (
                        <div className="text-xs text-gray-500">{isFr ? author.roleFr : author.role}</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-sm font-bold">SoleVault</div>
                )}
              </div>

              {/* Meta stats */}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#CA3F2E]" />
                  <span className="font-medium">{formatDate(post.publishedAt, locale)}</span>
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#CA3F2E]" />
                  <span className="font-medium">{post.readTime} {isFr ? "min" : "min read"}</span>
                </span>
                {post.viewCount && post.viewCount > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
                    <span className="hidden sm:flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#CA3F2E]" />
                      <span className="font-medium">{post.viewCount.toLocaleString()}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Cover image */}
            {post.coverImage && (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 mb-10 shadow-xl group">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 800px"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            )}

            {/* Article body */}
            <div
              id="blog-content"
              className="max-w-none scroll-mt-24 blog-body"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Word count footer */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
              <span className="w-8 h-px bg-gray-200" />
              {wordCount.toLocaleString()} {isFr ? "mots" : "words"}
              <span className="w-8 h-px bg-gray-200" />
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">{isFr ? "Tags" : "Tags"}</span>
                  {tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-gray-100 hover:bg-[#CA3F2E] hover:text-white rounded-full text-xs font-medium text-gray-700 transition cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share section */}
            <div className="mt-8 p-6 rounded-2xl relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)" }}>
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20" style={{ background: BRAND_RED, filter: "blur(40px)" }} />
              <div className="relative flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Share2 className="w-4 h-4 text-[#CA3F2E]" />
                    <div className="text-base font-bold text-white">{isFr ? "Aime cet article ?" : "Enjoyed this article?"}</div>
                  </div>
                  <div className="text-xs text-gray-400">{isFr ? "Partagez-le avec vos amis" : "Share it with your friends"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <ShareIcons size="md" />
                </div>
              </div>
            </div>

            {/* Author bio card */}
            {author && (author.bio || author.role) && (
              <div className="mt-8 p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: BRAND_RED }} />
                <div className="text-[10px] uppercase tracking-widest font-bold text-[#CA3F2E] mb-4">
                  {isFr ? "A propos de l'auteur" : "About the Author"}
                </div>
                <div className="flex items-start gap-5">
                  <Link href={`/${locale}/blog/author/${author.slug}`} className="flex-shrink-0">
                    <img src={author.avatar} alt={author.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-lg" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link href={`/${locale}/blog/author/${author.slug}`} className="font-black text-xl text-gray-900 hover:text-[#CA3F2E] transition">
                        {author.name}
                      </Link>
                      {(isFr ? author.roleFr : author.role) && (
                        <span className="text-xs text-gray-500">&middot; {isFr ? author.roleFr : author.role}</span>
                      )}
                    </div>
                    {(isFr ? author.bioFr : author.bio) && (
                      <p className="text-sm text-gray-600 leading-relaxed mb-4">{isFr ? author.bioFr : author.bio}</p>
                    )}
                    <Link
                      href={`/${locale}/blog/author/${author.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-lg text-xs font-bold transition group"
                    >
                      {isFr ? "Voir tous les articles" : "View all posts"}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              {/* Table of Contents */}
              {toc.length > 1 && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND_RED }}>
                      <List className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-black text-sm text-gray-900">
                      {isFr ? "Table des matieres" : "Table of Contents"}
                    </h3>
                  </div>
                  <nav className="px-3 py-3 max-h-[50vh] overflow-y-auto">
                    <ul className="space-y-0.5">
                      {toc.map((item, idx) => (
                        <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
                          <a
                            href={`#${item.id}`}
                            className={`flex items-start gap-3 px-3 py-2 rounded-lg text-sm transition group ${
                              activeId === item.id
                                ? "bg-[#CA3F2E]/5 text-[#CA3F2E] font-bold"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                              activeId === item.id
                                ? "bg-[#CA3F2E] text-white"
                                : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="leading-snug pt-0.5">{item.text}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}

              {/* Share sidebar card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Share2 className="w-4 h-4 text-[#CA3F2E]" />
                  <h3 className="font-black text-sm text-gray-900">
                    {isFr ? "Partager" : "Share this"}
                  </h3>
                </div>
                <ShareIcons size="sm" />
              </div>

              {/* Promotional CTA */}
              <div className="relative rounded-2xl p-6 text-white overflow-hidden shadow-lg" style={{ background: "linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%)" }}>
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white rounded-full blur-3xl opacity-20 pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white rounded-full blur-2xl opacity-10 pointer-events-none" />
                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="w-3 h-3" />
                    {isFr ? "Nouveaute" : "New Arrivals"}
                  </div>
                  <h3 className="text-xl font-black leading-tight mb-2">
                    {isFr ? "Trouvez votre prochaine paire" : "Find Your Next Pair"}
                  </h3>
                  <p className="text-sm text-white/90 mb-4 leading-relaxed">
                    {isFr
                      ? "Livraison gratuite pour les commandes de plus de 100$."
                      : "Free shipping on orders over $100."}
                  </p>
                  <Link
                    href={`/${locale}/shop`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-100 transition group w-full justify-center"
                  >
                    {isFr ? "Voir la collection" : "Shop the collection"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>

      <CommentSection postId={post.id} />

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-14 lg:py-20 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="inline-block text-xs font-bold text-[#CA3F2E] uppercase tracking-widest mb-2">
                  {isFr ? "Continuer la lecture" : "Keep reading"}
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900">{isFr ? "A lire ensuite" : "Read next"}</h2>
              </div>
              <Link href={`/${locale}/blog`} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-gray-900 hover:text-[#CA3F2E] group transition">
                {isFr ? "Tous les articles" : "All articles"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map(p => (
                <article
                  key={p.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <Link href={`/${locale}/blog/${p.slug}`} className="block relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    {p.coverImage && (
                      <Image
                        src={p.coverImage}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#CA3F2E]">
                        {getCategoryLabel(p.category, isFr)}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {p.readTime} min
                      </span>
                    </div>
                    <Link href={`/${locale}/blog/${p.slug}`}>
                      <h3 className="font-black text-gray-900 text-base leading-snug mb-3 group-hover:text-[#CA3F2E] transition line-clamp-2 flex-1">
                        {p.title}
                      </h3>
                    </Link>
                    <Link
                      href={`/${locale}/blog/${p.slug}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-lg text-xs font-bold transition-all group/btn mt-auto"
                    >
                      {isFr ? "Lire l'article" : "Read Article"}
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to blog */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-xl text-sm font-bold transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" /> {isFr ? "Retour au blog" : "Back to blog"}
        </Link>
      </div>
    </>
  );
}
