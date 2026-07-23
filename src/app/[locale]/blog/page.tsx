import { db } from "@/db";
import { blogPosts, authors, type BlogPost, type Author } from "@/db/schema";
import { eq, and, isNotNull, desc } from "drizzle-orm";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogListingClient from "@/components/BlogListingClient";
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mywebsite-inky-gamma.vercel.app";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFr = locale === "fr";

  const title = isFr ? "Blog - Conseils, guides et actualites - SoleVault" : "Blog - Style tips, guides & sneaker news - SoleVault";
  const description = isFr
    ? "Decouvrez nos conseils de style, tests de produits, guides d'achat et actualites du monde des sneakers premium."
    : "Discover our style tips, product reviews, buying guides, and news from the world of premium sneakers and footwear.";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog`,
      languages: {
        "en-US": `${SITE_URL}/en/blog`,
        "fr-FR": `${SITE_URL}/fr/blog`,
        "x-default": `${SITE_URL}/en/blog`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/blog`,
      siteName: "SoleVault",
      locale: isFr ? "fr_FR" : "en_US",
      type: "website",
    },
  };
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

export default async function BlogPage() {
  const locale = await getLocale();
  const isFr = locale === "fr";

  let posts: BlogPost[] = [];
  let authorsList: Author[] = [];

  try {
    const conditions = [eq(blogPosts.published, true)];
    if (isFr) conditions.push(isNotNull(blogPosts.titleFr));

    const raw = await db.select().from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt));

    posts = raw.map(p => localizePost(p, isFr));

    authorsList = await db.select().from(authors).where(eq(authors.active, true));
  } catch (err) {
    console.error("Blog listing error:", err);
  }

  // Blog listing JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: isFr ? "Blog SoleVault" : "SoleVault Blog",
    url: `${SITE_URL}/${locale}/blog`,
    blogPost: posts.slice(0, 10).map(p => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/${locale}/blog/${p.slug}`,
      datePublished: p.publishedAt ? new Date(p.publishedAt).toISOString() : undefined,
      image: p.coverImage || undefined,
    })),
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pt-20 lg:pt-24">
        <BlogListingClient posts={posts} authors={authorsList} locale={locale} />
      </div>
      <Footer />
    </main>
  );
}