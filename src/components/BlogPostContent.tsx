"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost, Author } from "@/db/schema";
import { getCategoryLabel, getCategoryColor, formatDate } from "@/lib/blog";
import CommentSection from "@/components/CommentSection";
import { Clock, Calendar, ChevronRight, Copy, Check, ArrowLeft, ArrowRight, Home, Sparkles } from "lucide-react";

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

  const ShareIcons = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <a
        href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank" rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-900 hover:text-white flex items-center justify-center transition text-gray-600"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
          <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.6c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.6v3h2.5V21h3.4z" />
        </svg>
      </a>
      <a
        href={`https://instagram.com`}
        target="_blank" rel="noopener noreferrer"
        aria-label="Instagram"
        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-900 hover:text-white flex items-center justify-center transition text-gray-600"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <a
        href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
        target="_blank" rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-900 hover:text-white flex items-center justify-center transition text-gray-600"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
        target="_blank" rel="noopener noreferrer"
        aria-label="Share on X"
        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-900 hover:text-white flex items-center justify-center transition text-gray-600"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
    </div>
  );

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <div className="h-full bg-gray-900 transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-8">
          <Link href={`/${locale}`} className="hover:text-gray-900 transition flex items-center">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/${locale}/blog`} className="hover:text-gray-900 transition">Blog</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/${locale}/blog?category=${post.category}`} className="hover:text-gray-900 transition">
            {getCategoryLabel(post.category, isFr)}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-medium line-clamp-1">{post.title}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
          {/* MAIN COLUMN */}
          <div className="min-w-0">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
              {post.title}
            </h1>

            {/* Author + Date row */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-200">
              {/* Author */}
              <div className="flex items-center gap-3">
                {author ? (
                  <>
                    <Link href={`/${locale}/blog/author/${author.slug}`}>
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </Link>
                    <div>
                      <Link href={`/${locale}/blog/author/${author.slug}`} className="text-sm font-semibold hover:underline block">
                        {author.name}
                      </Link>
                      {(isFr ? author.roleFr : author.role) && (
                        <div className="text-xs text-gray-500">{isFr ? author.roleFr : author.role}</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="text-sm font-semibold">SoleVault</div>
                  </div>
                )}
              </div>

              {/* Date + Read time */}
              <div className="flex items-center gap-5 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span>{formatDate(post.publishedAt, locale)}</span>
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                </span>
                <span className="flex items-center gap-1.5">
                  <span>{post.readTime} {isFr ? "min de lecture" : "min read"}</span>
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                </span>
              </div>
            </div>

            {/* Cover image */}
            {post.coverImage && (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 my-8">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 800px"
                  priority
                />
              </div>
            )}

            {/* Excerpt as intro */}
            {post.excerpt && (
              <p className="text-lg text-gray-700 leading-relaxed mb-8 font-medium">
                {post.excerpt}
              </p>
            )}

            {/* Article body */}
            <div
              id="blog-content"
              className="prose prose-gray prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:mb-4 prose-h3:mt-6 prose-a:text-gray-900 prose-a:underline prose-img:rounded-2xl prose-blockquote:border-l-gray-900 prose-blockquote:not-italic scroll-mt-24"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-500 uppercase">{isFr ? "Tags :" : "Tags:"}</span>
                  {tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700 hover:bg-gray-200 transition cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share section at bottom */}
            <div className="mt-8 p-5 bg-gray-50 rounded-2xl flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-sm font-semibold">{isFr ? "Aime cet article ?" : "Enjoyed this article?"}</div>
                <div className="text-xs text-gray-500 mt-0.5">{isFr ? "Partagez-le avec vos amis" : "Share it with your friends"}</div>
              </div>
              <div className="flex items-center gap-2">
                <ShareIcons />
                <button
                  onClick={handleCopy}
                  aria-label="Copy link"
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition ${copied ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-600"}`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Author bio card */}
            {author && (author.bio || author.role) && (
              <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-200">
                <div className="flex items-start gap-5">
                  <Link href={`/${locale}/blog/author/${author.slug}`}>
                    <img src={author.avatar} alt={author.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link href={`/${locale}/blog/author/${author.slug}`} className="font-bold text-lg hover:underline">
                        {author.name}
                      </Link>
                      {(isFr ? author.roleFr : author.role) && (
                        <span className="text-xs text-gray-500">&middot; {isFr ? author.roleFr : author.role}</span>
                      )}
                    </div>
                    {(isFr ? author.bioFr : author.bio) && (
                      <p className="text-sm text-gray-600 leading-relaxed">{isFr ? author.bioFr : author.bio}</p>
                    )}
                    <Link
                      href={`/${locale}/blog/author/${author.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold mt-3 hover:gap-2 transition-all"
                    >
                      {isFr ? "Tous les articles" : "All posts"} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              {/* Table of Contents card */}
              {toc.length > 1 && (
                <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
                    <h3 className="font-bold text-base">
                      {isFr ? "Table des matieres" : "Table of Contents"}
                    </h3>
                    <ShareIcons />
                  </div>
                  <div className="w-full h-0.5" style={{ backgroundColor: "#CA3F2E" }} />
                  <nav className="px-5 py-4 max-h-[60vh] overflow-y-auto">
                    <ul className="space-y-2.5">
                      {toc.map(item => (
                        <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
                          <a
                            href={`#${item.id}`}
                            className={`flex items-start gap-2.5 text-sm transition group ${
                              activeId === item.id
                                ? "text-gray-900 font-semibold"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            <span style={activeId === item.id ? { backgroundColor: "#CA3F2E" } : undefined} className={`flex-shrink-0 w-2 h-2 mt-1.5 rounded-sm transition ${
                              activeId === item.id ? "" : "bg-gray-400 group-hover:opacity-100 opacity-70"
                            }`} />
                            <span className="leading-snug">{item.text}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}

              {/* Promotional CTA card */}
              <div className="relative rounded-2xl p-6 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%)" }}>
                {/* Decorative badge */}
                <div className="absolute -top-1 -right-1 w-24 h-24 bg-white rounded-full blur-2xl opacity-20 pointer-events-none" />

                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="w-3 h-3" />
                    {isFr ? "Nouveaute" : "New Arrivals"}
                  </div>
                  <h3 className="text-lg font-bold leading-tight mb-2">
                    {isFr ? "Trouvez votre prochaine paire" : "Find Your Next Pair"}
                  </h3>
                  <p className="text-sm text-white/90 mb-4 leading-relaxed">
                    {isFr
                      ? "Decouvrez notre selection de chaussures premium. Livraison gratuite pour les commandes de plus de 100$."
                      : "Discover our premium footwear selection. Free shipping on orders over $100."}
                  </p>
                  <Link
                    href={`/${locale}/shop`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-semibold hover:bg-gray-100 transition group"
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
                <h2 className="text-2xl lg:text-3xl font-bold">{isFr ? "A lire ensuite" : "Read next"}</h2>
                <p className="text-gray-500 text-sm mt-1">{isFr ? "Plus d'articles dans la meme categorie" : "More articles in the same category"}</p>
              </div>
              <Link href={`/${locale}/blog`} className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all">
                {isFr ? "Tous les articles" : "All articles"} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map(p => (
                <Link
                  key={p.id}
                  href={`/${locale}/blog/${p.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[16/10] bg-gray-100">
                    {p.coverImage && (
                      <Image
                        src={p.coverImage}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${getCategoryColor(p.category)}`}>
                      {getCategoryLabel(p.category, isFr)}
                    </span>
                    <h3 className="font-bold text-base leading-tight mb-2 group-hover:text-gray-700 transition line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {p.readTime} min
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to blog */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> {isFr ? "Retour au blog" : "Back to blog"}
        </Link>
      </div>
    </>
  );
}
