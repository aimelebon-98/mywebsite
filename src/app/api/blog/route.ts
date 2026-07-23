import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, desc, and, ilike, or, isNotNull } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";

function calcReadTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const publishedOnly = searchParams.get("published") !== "false";
    const authorId = searchParams.get("authorId");
    const locale = searchParams.get("locale");
    const limit = parseInt(searchParams.get("limit") || "0");

    const conditions = [];
    if (publishedOnly) conditions.push(eq(blogPosts.published, true));
    if (category && category !== "all") conditions.push(eq(blogPosts.category, category));
    if (featured === "true") conditions.push(eq(blogPosts.featured, true));
    if (authorId) conditions.push(eq(blogPosts.authorId, authorId));

    if (locale === "fr") {
      conditions.push(isNotNull(blogPosts.titleFr));
    }

    if (search) {
      if (locale === "fr") {
        conditions.push(
          or(
            ilike(blogPosts.titleFr, `%${search}%`),
            ilike(blogPosts.excerptFr, `%${search}%`)
          )!
        );
      } else {
        conditions.push(
          or(
            ilike(blogPosts.title, `%${search}%`),
            ilike(blogPosts.excerpt, `%${search}%`)
          )!
        );
      }
    }

    let query = db
      .select()
      .from(blogPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
      .$dynamic();

    if (limit > 0) query = query.limit(limit);

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, excerpt, content, coverImage,
      titleFr, excerptFr, contentFr, tagsFr,
      category, tags, authorId,
      published, featured,
      seoTitle, metaDescription, focusKeyphrase, ogImage, canonicalUrl, noIndex,
      seoTitleFr, metaDescriptionFr, focusKeyphraseFr,
    } = body;

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const slug = body.slug ? generateSlug(body.slug) : generateSlug(title);
    const readTime = calcReadTime(content || "");
    const isPublished = Boolean(published);

    const result = await db.insert(blogPosts).values({
      title,
      slug,
      excerpt: excerpt || "",
      content: content || "",
      coverImage: coverImage || "",
      titleFr: titleFr || null,
      excerptFr: excerptFr || null,
      contentFr: contentFr || null,
      tagsFr: tagsFr ? JSON.stringify(Array.isArray(tagsFr) ? tagsFr : []) : null,
      category: category || "style-tips",
      tags: JSON.stringify(tags || []),
      authorId: authorId || null,
      readTime,
      published: isPublished,
      featured: Boolean(featured),
      publishedAt: isPublished ? new Date() : null,
      seoTitle: seoTitle || null,
      metaDescription: metaDescription || null,
      focusKeyphrase: focusKeyphrase || null,
      ogImage: ogImage || null,
      canonicalUrl: canonicalUrl || null,
      noIndex: Boolean(noIndex),
      seoTitleFr: seoTitleFr || null,
      metaDescriptionFr: metaDescriptionFr || null,
      focusKeyphraseFr: focusKeyphraseFr || null,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
