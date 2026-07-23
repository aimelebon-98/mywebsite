import { db } from "@/db";
import { blogPosts, authors, type BlogPost, type Author } from "@/db/schema";
import { eq, and, ne, isNotNull, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogPostContent from "@/components/BlogPostContent";
import { getLocale } from "next-intl/server";

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
    let result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    if (result.length === 0) {
      result = await db.select().from(blogPosts).where(eq(blogPosts.id, slug));
    }
    if (result.length === 0 || !result[0].published) {
      return { title: isFr ? "Article introuvable - SoleVault" : "Article Not Found - SoleVault" };
    }

    const raw = result[0];
    const post = localizePost(raw, isFr);

    const seoTitle = isFr
      ? (raw.seoTitleFr || raw.seoTitle || `${post.title} - SoleVault Blog`)
      : (raw.seoTitle || `${post.title} - SoleVault Blog`);

    const metaDescription = isFr
      ? (raw.metaDescriptionFr || raw.metaDescription || post.excerpt || post.content.replace(/<[^>]*>/g, "").slice(0, 155))
      : (raw.metaDescription || post.excerpt || post.content.replace(/<[^>]*>/g, "").slice(0, 155));

    const ogImage = raw.ogImage || post.coverImage;
    const postUrl = `${SITE_URL}/${locale}/blog/${slug}`;
    const canonical = raw.canonicalUrl || postUrl;

    const focusKp = isFr ? (raw.focusKeyphraseFr || raw.focusKeyphrase || "") : (raw.focusKeyphrase || "");
    const tagArr = (() => {
      try { return JSON.parse(post.tags || "[]") as string[]; } catch { return []; }
    })();

    const metadata: Metadata = {
      title: seoTitle,
      description: metaDescription,
      keywords: [focusKp, ...tagArr, "SoleVault", "blog"].filter(Boolean).join(", "),
      alternates: {
        canonical,
        languages: {
          "en-US": `${SITE_URL}/en/blog/${slug}`,
          "fr-FR": `${SITE_URL}/fr/blog/${slug}`,
          "x-default": `${SITE_URL}/en/blog/${slug}`,
        },
      },
      openGraph: {
        title: seoTitle,
        description: metaDescription,
        url: postUrl,
        siteName: "SoleVault",
        locale: isFr ? "fr_FR" : "en_US",
        type: "article",
        publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
        modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
        images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: post.title }] : [],
        tags: tagArr,
      },
      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description: metaDescription,
        images: ogImage ? [ogImage] : [],
      },
    };

    if (raw.noIndex) {
      metadata.robots = { index: false, follow: false, googleBot: { index: false, follow: false } };
    }

    return metadata;
  } catch {
    return { title: "Blog - SoleVault" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale: paramLocale } = await params;
  const locale = await getLocale();
  const isFr = locale === "fr";

  let post: BlogPost;
  let author: Author | null = null;
  let relatedPosts: BlogPost[] = [];

  try {
    let result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    if (result.length === 0) {
      try {
        result = await db.select().from(blogPosts).where(eq(blogPosts.id, slug));
      } catch {}
    }
    if (result.length === 0 || !result[0].published) notFound();
    if (isFr && !result[0].titleFr) notFound();

    post = localizePost(result[0], isFr);

    if (post.authorId) {
      const aRes = await db.select().from(authors).where(eq(authors.id, post.authorId));
      author = aRes[0] || null;
    }

    // Related posts: same category, not this one
    const conditions = [
      eq(blogPosts.published, true),
      eq(blogPosts.category, post.category),
      ne(blogPosts.id, post.id),
    ];
    if (isFr) conditions.push(isNotNull(blogPosts.titleFr));

    const relatedRaw = await db.select().from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(3);

    relatedPosts = relatedRaw.map(p => localizePost(p, isFr));
  } catch {
    notFound();
  }

  const postUrl = `${SITE_URL}/${paramLocale}/blog/${slug}`;

  // Article JSON-LD
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage || undefined,
    url: postUrl,
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    author: author ? {
      "@type": "Person",
      name: author.name,
      url: `${SITE_URL}/${paramLocale}/blog/author/${author.slug}`,
      image: author.avatar || undefined,
    } : {
      "@type": "Organization",
      name: "SoleVault",
    },
    publisher: {
      "@type": "Organization",
      name: "SoleVault",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    articleSection: post.category,
    wordCount: post.content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isFr ? "Accueil" : "Home", item: `${SITE_URL}/${paramLocale}` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/${paramLocale}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="pt-20 lg:pt-24">
        <BlogPostContent
          post={post}
          author={author}
          relatedPosts={relatedPosts}
          locale={paramLocale}
        />
      </div>
      <Footer />
    </main>
  );
}