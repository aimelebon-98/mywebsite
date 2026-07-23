"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost, Author } from "@/db/schema";
import { getCategoryLabel, getCategoryColor, formatDate } from "@/lib/blog";
import { Clock, Calendar, ChevronRight, Share2, Facebook, Copy, Check, ArrowLeft, ArrowRight } from "lucide-react";

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

  // Track view count (only once)
  useEffect(() => {
    fetch(`/api/blog/${post.slug}?trackView=true`).catch(() => {});
  }, [post.slug]);

  // Build TOC from content H2s and add IDs
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

  // Scroll spy + reading progress
  useEffect(() => {
    const handleScroll = () => {
      // Reading progress
      const container = document.getElementById("blog-content");
      if (container) {
        const rect = container.getBoundingClientRect();
        const scrolled = Math.max(0, -rect.top);
        const total = rect.height - window.innerHeight;
        setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
      }

      // Active TOC item
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

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <div className="h-full bg-gray-900 transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>

      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
          <Link href={`/${locale}`} className="hover:text-gray-900 transition">{isFr ? "Accueil" : "Home"}</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/${locale}/blog`} className="hover:text-gray-900 transition">Blog</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-medium line-clamp-1">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8 lg:mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/${locale}/blog?category=${post.category}`}
              className={`text-xs font-bold px-3 py-1 rounded-full ${getCategoryColor(post.category)}`}
            >
              {getCategoryLabel(post.category, isFr)}
            </Link>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {post.readTime} {isFr ? "min de lecture" : "min read"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed mb-6">{post.excerpt}</p>
          )}

          {/* Author + date */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {author ? (
                <>
                  <Link href={`/${locale}/blog/author/${author.slug}`}>
                    <img src={author.avatar} alt={author.name} className="w-11 h-11 rounded-full object-cover" />
                  </Link>
                  <div>
                    <Link href={`/${locale}/blog/author/${author.slug}`} className="text-sm font-semibold hover:underline">
                      {author.name}
                    </Link>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.publishedAt, locale)}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <div className="text-sm font-semibold">SoleVault</div>
                  <div className="text-xs text-gray-500">{formatDate(post.publishedAt, locale)}</div>
                </div>
              )}
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 mr-1">{isFr ? "Partager :" : "Share:"}</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                aria-label="Share on X"
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                aria-label="Share on Facebook"
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <button
                onClick={handleCopy}
                aria-label="Copy link"
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
                  copied ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Cover image */}
        {post.coverImage && (
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-gray-100 mb-10 lg:mb-14">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1200px"
              priority
            />
          </div>
        )}

        {/* Content grid */}
        <div className="grid lg:grid-cols-[1fr_240px] gap-10 lg:gap-14">
          {/* Article body */}
          <div
            id="blog-content"
            className="prose prose-gray prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:mb-4 prose-h3:mt-6 prose-a:text-gray-900 prose-a:underline prose-img:rounded-2xl prose-blockquote:border-l-gray-900 prose-blockquote:not-italic"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* TOC sidebar */}
          {toc.length > 2 && (
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  {isFr ? "Table des matieres" : "Table of contents"}
                </div>
                <nav className="border-l border-gray-100 space-y-1">
                  {toc.map(item => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block py-1.5 -ml-px border-l text-sm transition ${
                        item.level === 3 ? "pl-8" : "pl-4"
                      } ${
                        activeId === item.id
                          ? "border-gray-900 text-gray-900 font-semibold"
                          : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-10 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-500 uppercase">{isFr ? "Tags :" : "Tags:"}</span>
              {tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author bio card */}
        {author && (author.bio || author.role) && (
          <div className="mt-10 p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="flex items-start gap-5">
              <Link href={`/${locale}/blog/author/${author.slug}`}>
                <img src={author.avatar} alt={author.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
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
      </article>

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
