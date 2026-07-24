import { db } from "@/db";
import { blogPosts, authors, type BlogPost, type Author } from "@/db/schema";
import { eq, and, isNotNull, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getLocale } from "next-intl/server";
import { getCategoryLabel, getCategoryColor, formatDate } from "@/lib/blog";
import { Clock, ArrowLeft, Mail, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mywebsite-inky-gamma.vercel.app";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

function localizePost(p: BlogPost, isFr: boolean): BlogPost {
  if (!isFr) return p;
  return {
    ...p,
    title: p.titleFr || p.title,
    excerpt: p.excerptFr || p.excerpt,
    content: p.contentFr || p.content,
    tags: p.tagsFr || p.tags,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const isFr = locale === "fr";
  try {
    const res = await db.select().from(authors).where(eq(authors.slug, slug));
    if (res.length === 0) return { title: "Author Not Found - SoleVault" };
    const a = res[0];
    const bio = isFr ? (a.bioFr || a.bio) : a.bio;

    return {
      title: `${a.name} - SoleVault Blog`,
      description: bio || `Read articles by ${a.name} on SoleVault Blog.`,
      alternates: {
        canonical: `${SITE_URL}/${locale}/blog/author/${slug}`,
        languages: {
          "en-US": `${SITE_URL}/en/blog/author/${slug}`,
          "fr-FR": `${SITE_URL}/fr/blog/author/${slug}`,
        },
      },
      openGraph: {
        title: `${a.name} - SoleVault Blog`,
        description: bio,
        url: `${SITE_URL}/${locale}/blog/author/${slug}`,
        images: a.avatar ? [{ url: a.avatar, width: 400, height: 400, alt: a.name }] : [],
        type: "profile",
      },
    };
  } catch {
    return { title: "Author - SoleVault" };
  }
}

export default async function AuthorPage({ params }: Props) {
  const { slug, locale: paramLocale } = await params;
  const locale = await getLocale();
  const isFr = locale === "fr";

  let author: Author;
  let posts: BlogPost[] = [];

  try {
    const res = await db.select().from(authors).where(eq(authors.slug, slug));
    if (res.length === 0) notFound();
    author = res[0];

    const conditions = [eq(blogPosts.published, true), eq(blogPosts.authorId, author.id)];
    if (isFr) conditions.push(isNotNull(blogPosts.titleFr));

    const raw = await db.select().from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.publishedAt));

    posts = raw.map(p => localizePost(p, isFr));
  } catch {
    notFound();
  }

  const displayRole = isFr ? (author.roleFr || author.role) : author.role;
  const displayBio = isFr ? (author.bioFr || author.bio) : author.bio;

  // Person JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `${SITE_URL}/${paramLocale}/blog/author/${slug}`,
    image: author.avatar || undefined,
    jobTitle: author.role || undefined,
    description: author.bio || undefined,
    sameAs: [author.twitter, author.instagram, author.linkedin, author.website].filter(Boolean),
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="pt-20 lg:pt-24">
        {/* Header */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-14 lg:py-20 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-28 h-28 lg:w-32 lg:h-32 rounded-full object-cover mx-auto mb-5 border-4 border-white shadow-lg"
            />
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">{author.name}</h1>
            {displayRole && (
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{displayRole}</p>
            )}
            {displayBio && (
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto mb-6">{displayBio}</p>
            )}

            <div className="flex items-center justify-center gap-2">
              {author.email && (
                <a href={`mailto:${author.email}`} aria-label="Email" className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition">
                  <Mail className="w-4 h-4 text-gray-700" />
                </a>
              )}
              {author.twitter && (
                <a href={author.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-700">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {author.instagram && (
                <a href={author.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-700">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              )}
              {author.linkedin && (
                <a href={author.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-700">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              )}
              {author.website && (
                <a href={author.website} target="_blank" rel="noopener noreferrer" aria-label="Website" className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition">
                  <Globe className="w-4 h-4 text-gray-700" />
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Posts */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold">
              {isFr ? "Articles" : "Articles"} <span className="text-gray-400 font-normal text-lg">({posts.length})</span>
            </h2>
            <Link href={`/${paramLocale}/blog`} className="flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all">
              <ArrowLeft className="w-4 h-4" /> {isFr ? "Tous les articles" : "All articles"}
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <p className="text-gray-500">{isFr ? "Aucun article publie pour le moment." : "No articles published yet."}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(p => (
                <Link
                  key={p.id}
                  href={`/${paramLocale}/blog/${p.slug}`}
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
                      <span>{formatDate(p.publishedAt, paramLocale)}</span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.readTime} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}