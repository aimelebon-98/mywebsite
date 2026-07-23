"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost, Author } from "@/db/schema";
import { BLOG_CATEGORIES, getCategoryLabel, getCategoryColor, formatDate } from "@/lib/blog";
import { Search, Clock, Star, ArrowRight, User } from "lucide-react";

interface Props {
  posts: BlogPost[];
  authors: Author[];
  locale: string;
}

const POSTS_PER_PAGE = 9;

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
      {/* Hero header */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-12 lg:py-16 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700 mb-4">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            {isFr ? "Nouveau contenu chaque semaine" : "New content every week"}
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3">
            {isFr ? "Le Blog SoleVault" : "The SoleVault Blog"}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {isFr
              ? "Conseils de style, tests, guides d'achat et actualites du monde des sneakers premium."
              : "Style tips, reviews, buying guides, and news from the world of premium footwear."}
          </p>
        </div>
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
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-full shadow-lg">
                <Star className="w-3.5 h-3.5 fill-amber-900" />
                {isFr ? "A LA UNE" : "FEATURED"}
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getCategoryColor(featured.category)}`}>
                  {getCategoryLabel(featured.category, isFr)}
                </span>
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

              <div className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 group-hover:gap-2 transition-all">
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
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
            <button
              onClick={() => { setCategory("all"); setPage(1); }}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                category === "all" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {isFr ? "Tout" : "All"}
            </button>
            {BLOG_CATEGORIES.map(c => (
              <button
                key={c.slug}
                onClick={() => { setCategory(c.slug); setPage(1); }}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                  category === c.slug ? "bg-gray-900 text-white" : "bg-white border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {isFr ? c.nameFr : c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts grid */}
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
              className="text-sm text-gray-900 font-semibold underline"
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
                      <div className="absolute top-3 left-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${getCategoryColor(p.category)}`}>
                          {getCategoryLabel(p.category, isFr)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 p-5 flex flex-col">
                      <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-gray-700 transition line-clamp-2">
                        {p.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-1">
                        {p.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 min-w-0">
                          {author ? (
                            <>
                              <img src={author.avatar} alt={author.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-700 truncate">{author.name}</span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 flex items-center gap-1"><User className="w-3 h-3" /> SoleVault</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                          <Clock className="w-3 h-3" /> {p.readTime} min
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
                      n === page ? "bg-gray-900 text-white" : "hover:bg-gray-100"
                    }`}
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
