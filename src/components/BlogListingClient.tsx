"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost, Author } from "@/db/schema";
import { BLOG_CATEGORIES, getCategoryLabel, formatDate } from "@/lib/blog";
import { Search, Clock, Star, ArrowRight, Calendar, Sparkles } from "lucide-react";

interface Props {
  posts: BlogPost[];
  authors: Author[];
  locale: string;
}

const POSTS_PER_PAGE = 9;
const BRAND_RED = "#CA3F2E";

export default function BlogListingClient({ posts, authors, locale }: Props) {
  const isFr = locale === "fr";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  const authorMap = useMemo(() => new Map(authors.map(a => [a.id, a])), [authors]);

  const featured = posts.find(p => p.featured);
  const nonFeatured = posts.filter(p => p.id !== featured?.id);

  const filtered = useMemo(() => {
    return nonFeatured.filter(p => {
      if (category !== "all" && p.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.excerpt.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [nonFeatured, category, search]);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div>
      {/* Hero header - Animated gradient with floating blobs */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        ></div>

        {/* Radial fade at edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(255,255,255,0.8) 100%)",
          }}
        ></div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-xs font-semibold text-gray-700 mb-6 shadow-sm hero-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: BRAND_RED }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: BRAND_RED }}></span>
            </span>
            <Sparkles className="w-3.5 h-3.5" style={{ color: BRAND_RED }} />
            {isFr ? "Nouveau contenu chaque semaine" : "New content every week"}
          </div>

          {/* Title with gradient text */}
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-5 hero-fade-in hero-delay-1">
            {isFr ? "Le Blog " : "The "}
            <span className="hero-gradient-text">SoleVault</span>
            {!isFr && " Blog"}
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed hero-fade-in hero-delay-2">
            {isFr
              ? "Conseils de style, tests, guides d'achat et actualites du monde des sneakers premium."
              : "Style tips, reviews, buying guides, and news from the world of premium footwear."}
          </p>

          {/* Decorative divider */}
          <div className="mt-8 flex items-center justify-center gap-2 hero-fade-in hero-delay-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BRAND_RED }}></div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
        </div>

        <style jsx>{`
          .blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.5;
            will-change: transform;
          }
          .blob-1 {
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(202, 63, 46, 0.35), transparent 70%);
            top: -150px;
            left: -100px;
            animation: float1 18s ease-in-out infinite;
          }
          .blob-2 {
            width: 450px;
            height: 450px;
            background: radial-gradient(circle, rgba(251, 146, 60, 0.3), transparent 70%);
            top: -100px;
            right: -100px;
            animation: float2 22s ease-in-out infinite;
          }
          .blob-3 {
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent 70%);
            bottom: -150px;
            left: 40%;
            animation: float3 20s ease-in-out infinite;
          }
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(60px, 40px) scale(1.1); }
            66% { transform: translate(-40px, 60px) scale(0.95); }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-50px, 30px) scale(1.05); }
            66% { transform: translate(30px, -40px) scale(0.9); }
          }
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-60px, -30px) scale(1.15); }
          }
          .hero-gradient-text {
            background: linear-gradient(135deg, #CA3F2E 0%, #f97316 50%, #CA3F2E 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer 4s linear infinite;
          }
          @keyframes shimmer {
            to { background-position: 200% center; }
          }
          .hero-fade-in {
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.8s ease-out forwards;
          }
          .hero-delay-1 { animation-delay: 0.15s; }
          .hero-delay-2 { animation-delay: 0.3s; }
          .hero-delay-3 { animation-delay: 0.45s; }
          @keyframes fadeInUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      {/* Featured post */}
      {featured && !search && category === "all" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <Link
            href={`/${locale}/blog/${featured.slug}`}
            className="group grid md:grid-cols-2 gap-8 lg:gap-12 bg-gradient-to-br from-gray-50 to-white rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all p-6 lg:p-10"
          >
            <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden">
              {featured.coverImage ? (
                <Image
                  src={featured.coverImage}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Star className="w-16 h-16 text-gray-200" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-lg" style={{ backgroundColor: BRAND_RED }}>
                <Star className="w-3.5 h-3.5 fill-white" />
                {isFr ? "A LA UNE" : "FEATURED"}
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: BRAND_RED }}>
                  {getCategoryLabel(featured.category, isFr)}
                </span>
                <span className="text-gray-300">/</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {featured.readTime} min
                </span>
              </div>

              <h2 className="text-2xl lg:text-3xl font-bold mb-3 group-hover:text-gray-700 transition">
                {featured.title}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5 line-clamp-3">{featured.excerpt}</p>

              {featured.authorId && authorMap.get(featured.authorId) && (
                <div className="flex items-center gap-3 mb-5">
                  <img
                    src={authorMap.get(featured.authorId)!.avatar || "/favicon.ico"}
                    alt={authorMap.get(featured.authorId)!.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-semibold">{authorMap.get(featured.authorId)!.name}</div>
                    <div className="text-xs text-gray-500">{formatDate(featured.publishedAt, locale)}</div>
                  </div>
                </div>
              )}

              <div
                className="inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all"
                style={{ color: BRAND_RED }}
              >
                {isFr ? "Lire l'article" : "Read article"} <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Search + Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={isFr ? "Rechercher un article..." : "Search articles..."}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 transition"
              style={{ boxShadow: "none" }}
              onFocus={(e) => e.currentTarget.style.borderColor = BRAND_RED}
              onBlur={(e) => e.currentTarget.style.borderColor = ""}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
            <button
              onClick={() => { setCategory("all"); setPage(1); }}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                category === "all"
                  ? "text-white"
                  : "bg-white border border-gray-200 hover:bg-gray-50"
              }`}
              style={category === "all" ? { backgroundColor: BRAND_RED } : undefined}
            >
              {isFr ? "Tout" : "All"}
            </button>
            {BLOG_CATEGORIES.map(c => (
              <button
                key={c.slug}
                onClick={() => { setCategory(c.slug); setPage(1); }}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                  category === c.slug
                    ? "text-white"
                    : "bg-white border border-gray-200 hover:bg-gray-50"
                }`}
                style={category === c.slug ? { backgroundColor: BRAND_RED } : undefined}
              >
                {isFr ? c.nameFr : c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts grid - Neil Patel style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {paginated.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg mb-2">
              {isFr ? "Aucun article trouve" : "No articles found"}
            </p>
            <button
              onClick={() => { setSearch(""); setCategory("all"); }}
              className="text-sm font-semibold underline"
              style={{ color: BRAND_RED }}
            >
              {isFr ? "Effacer les filtres" : "Clear filters"}
            </button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {paginated.map((p) => {
                const author = p.authorId ? authorMap.get(p.authorId) : null;
                return (
                  <Link
                    key={p.id}
                    href={`/${locale}/blog/${p.slug}`}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all"
                  >
                    {/* Cover image */}
                    <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                      {p.coverImage ? (
                        <Image
                          src={p.coverImage}
                          alt={p.title}
                          fill
                          className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                          <span className="text-4xl font-bold text-gray-200">SV</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-5 flex flex-col">
                      {/* Category + read time (top row) */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-[11px] font-bold uppercase tracking-wider"
                          style={{ color: BRAND_RED }}
                        >
                          {getCategoryLabel(p.category, isFr)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {p.readTime} min
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-lg leading-snug mb-3 group-hover:text-gray-700 transition line-clamp-2">
                        {p.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-5 flex-1">
                        {p.excerpt}
                      </p>

                      {/* Author + date footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {author ? (
                            <>
                              <img src={author.avatar} alt={author.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-gray-900 truncate">{author.name}</div>
                                {(isFr ? author.roleFr : author.role) && (
                                  <div className="text-[10px] text-gray-500 truncate">{isFr ? author.roleFr : author.role}</div>
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">SoleVault</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                          <Calendar className="w-3 h-3" />
                          {formatDate(p.publishedAt, locale)}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {isFr ? "Precedent" : "Previous"}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition ${
                      n === page ? "text-white" : "hover:bg-gray-100"
                    }`}
                    style={n === page ? { backgroundColor: BRAND_RED } : undefined}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {isFr ? "Suivant" : "Next"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
