import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { blogPosts, type BlogPost } from "@/db/schema";
import { eq, and, isNotNull, desc } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { getCategoryLabel, getCategoryColor, formatDate } from "@/lib/blog";
import { ArrowRight, Clock } from "lucide-react";

function localizePost(p: BlogPost, isFr: boolean): BlogPost {
  if (!isFr) return p;
  return {
    ...p,
    title: p.titleFr || p.title,
    excerpt: p.excerptFr || p.excerpt,
  };
}

export default async function HomeBlogSection() {
  const locale = await getLocale();
  const isFr = locale === "fr";

  let posts: BlogPost[] = [];
  try {
    const conditions = [eq(blogPosts.published, true)];
    if (isFr) conditions.push(isNotNull(blogPosts.titleFr));

    const raw = await db.select().from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
      .limit(3);

    posts = raw.map(p => localizePost(p, isFr));
  } catch { /* ignore */ }

  if (posts.length === 0) return null;

  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 lg:mb-10">
          <div>
            <div className="inline-block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {isFr ? "Depuis le blog" : "From the blog"}
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold">
              {isFr ? "Derniers articles" : "Latest articles"}
            </h2>
          </div>
          <Link
            href={`/${locale}/blog`}
            className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all"
          >
            {isFr ? "Voir tous les articles" : "See all articles"} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {posts.map(p => (
            <Link
              key={p.id}
              href={`/${locale}/blog/${p.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                {p.coverImage ? (
                  <Image
                    src={p.coverImage}
                    alt={p.title}
                    fill
                    className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100" />
                )}
                <div className="absolute top-3 left-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${getCategoryColor(p.category)}`}>
                    {getCategoryLabel(p.category, isFr)}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-gray-700 transition line-clamp-2">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{p.excerpt}</p>
                <div className="text-xs text-gray-500 flex items-center gap-3">
                  <span>{formatDate(p.publishedAt, locale)}</span>
                  <span>&middot;</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.readTime} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-1 text-sm font-semibold"
          >
            {isFr ? "Voir tous les articles" : "See all articles"} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
