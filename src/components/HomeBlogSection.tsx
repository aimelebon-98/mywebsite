import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { blogPosts, authors, type BlogPost, type Author } from "@/db/schema";
import { eq, and, isNotNull, desc } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { getCategoryLabel, formatDate } from "@/lib/blog";
import { ArrowRight, Clock, Calendar } from "lucide-react";

type PostWithAuthor = BlogPost & { author: Author | null };

function localizePost(p: BlogPost, isFr: boolean): BlogPost {
  if (!isFr) return p;
  return {
    ...p,
    title: p.titleFr || p.title,
    excerpt: p.excerptFr || p.excerpt,
  };
}

function localizeAuthor(a: Author | null, isFr: boolean): Author | null {
  if (!a) return null;
  if (!isFr) return a;
  return { ...a, role: a.roleFr || a.role, bio: a.bioFr || a.bio };
}

export default async function HomeBlogSection() {
  const locale = await getLocale();
  const isFr = locale === "fr";

  let posts: PostWithAuthor[] = [];
  try {
    const conditions = [eq(blogPosts.published, true)];
    if (isFr) conditions.push(isNotNull(blogPosts.titleFr));

    const raw = await db
      .select({ post: blogPosts, author: authors })
      .from(blogPosts)
      .leftJoin(authors, eq(blogPosts.authorId, authors.id))
      .where(and(...conditions))
      .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
      .limit(4);

    posts = raw.map(r => ({
      ...localizePost(r.post, isFr),
      author: localizeAuthor(r.author, isFr),
    }));
  } catch { /* ignore */ }

  if (posts.length === 0) return null;

  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 lg:mb-12">
          <div>
            <div className="inline-block text-xs font-bold text-[#CA3F2E] uppercase tracking-widest mb-2">
              {isFr ? "Depuis le blog" : "From the blog"}
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
              {isFr ? "Derniers articles" : "Latest articles"}
            </h2>
          </div>
          <Link
            href={`/${locale}/blog`}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-gray-900 hover:text-[#CA3F2E] group transition"
          >
            {isFr ? "Voir tous les articles" : "See all articles"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* Grid - 4 posts */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {posts.map(p => (
            <article
              key={p.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Image */}
              <Link href={`/${locale}/blog/${p.slug}`} className="block relative aspect-[16/10] bg-gray-100 overflow-hidden">
                {p.coverImage ? (
                  <Image
                    src={p.coverImage}
                    alt={p.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                )}
              </Link>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                {/* Category + Read time */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#CA3F2E]">
                    {getCategoryLabel(p.category, isFr)}
                  </span>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {p.readTime} min
                  </span>
                </div>

                {/* Title */}
                <Link href={`/${locale}/blog/${p.slug}`}>
                  <h3 className="font-black text-gray-900 text-base leading-snug mb-2 group-hover:text-[#CA3F2E] transition line-clamp-2">
                    {p.title}
                  </h3>
                </Link>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed flex-1">
                  {p.excerpt}
                </p>

                {/* Author + Date */}
                {p.author && (
                  <div className="flex items-center gap-2.5 pt-4 border-t border-gray-100 mb-4">
                    {p.author.avatar ? (
                      <Image
                        src={p.author.avatar}
                        alt={p.author.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover w-8 h-8"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {p.author.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 truncate">{p.author.name}</div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {formatDate(p.publishedAt, locale)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Read Article button */}
                <Link
                  href={`/${locale}/blog/${p.slug}`}
                  className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-lg text-xs font-bold transition-all group/btn"
                >
                  {isFr ? "Lire l'article" : "Read Article"}
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile see all */}
        <div className="text-center mt-8 sm:hidden">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-900"
          >
            {isFr ? "Voir tous les articles" : "See all articles"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
