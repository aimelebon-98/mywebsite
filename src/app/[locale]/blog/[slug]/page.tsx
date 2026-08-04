import { db } from "@/db";
import { blogPosts, authors, type BlogPost, type Author } from "@/db/schema";
import { eq, or, and, ne, isNotNull, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogPostContent from "@/components/BlogPostContent";
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.newdealzone.com";

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
    let result = await db.select().from(blogPosts).where(or(eq(blogPosts.slug, slug), eq(blogPosts.slugFr, slug)));
    if (result.length === 0) {
      result = await db.select().from(blogPosts).where(eq(blogPosts.id, slug));
    }
    if (result.length === 0 || !result[0].published) {
      return { title: isFr ? "Article introuvable - NewDealZone" : "Article Not Found - NewDealZone" };
    }

    const raw = result[0];
    const post = localizePost(raw, isFr);

    const seoTitle = isFr
      ? (raw.seoTitleFr || raw.seoTitle || `${post.title} - NewDealZone Blog`)
      : (raw.seoTitle || `${post.title} - NewDealZone Blog`);

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
      keywords: [focusKp, ...tagArr, "NewDealZone", "blog"].filter(Boolean).join(", "),
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
        siteName: "NewDealZone",
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
    return { title: "Blog - NewDealZone" };
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
    let result = await db.select().from(blogPosts).where(or(eq(blogPosts.slug, slug), eq(blogPosts.slugFr, slug)));
    if (result.length === 0) {
      try {
        result = await db.select().from(blogPosts).where(eq(blogPosts.id, slug));
      } catch {}
    }
    if (result.length === 0 || !result[0].published) notFound();

    const rawPost = result[0];

    // SEO: redirect if visitor is using wrong-locale slug
    // If FR user accesses EN slug, and post has a FR slug -> redirect to FR slug (301)
    // If EN user accesses FR slug, redirect to EN slug (301)
    if (isFr && rawPost.slugFr && slug === rawPost.slug && rawPost.slugFr !== rawPost.slug) {
      redirect(`/fr/blog/${rawPost.slugFr}`);
    }
    if (!isFr && rawPost.slugFr && slug === rawPost.slugFr && rawPost.slug !== rawPost.slugFr) {
      redirect(`/en/blog/${rawPost.slug}`);
    }

    // If FR requested but no FR content exists, show 404 (not enough translated data)
    if (isFr && !rawPost.titleFr) notFound();

    post = localizePost(rawPost, isFr);

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
  } catch (err) {
    // Re-throw Next.js redirect errors so redirect() works properly
    if (err && typeof err === "object" && "digest" in err && String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")) {
      throw err;
    }
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
      name: "NewDealZone",
    },
    publisher: {
      "@type": "Organization",
      name: "NewDealZone",
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

      <div>
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