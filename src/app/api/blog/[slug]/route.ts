import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";

function calcReadTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const trackView = searchParams.get("trackView") === "true";

    let result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    if (result.length === 0) {
      try {
        result = await db.select().from(blogPosts).where(eq(blogPosts.id, slug));
      } catch {}
    }
    if (result.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (trackView && result[0].published) {
      await db.update(blogPosts)
        .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
        .where(eq(blogPosts.id, result[0].id));
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { slug: idOrSlug } = await params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.slug !== undefined) updates.slug = generateSlug(body.slug);
    if (body.excerpt !== undefined) updates.excerpt = body.excerpt;
    if (body.content !== undefined) {
      updates.content = body.content;
      updates.readTime = calcReadTime(body.content);
    }
    if (body.coverImage !== undefined) updates.coverImage = body.coverImage;
    if (body.titleFr !== undefined) updates.titleFr = body.titleFr || null;
    if (body.excerptFr !== undefined) updates.excerptFr = body.excerptFr || null;
    if (body.contentFr !== undefined) updates.contentFr = body.contentFr || null;
    if (body.tagsFr !== undefined) {
      updates.tagsFr = body.tagsFr ? JSON.stringify(Array.isArray(body.tagsFr) ? body.tagsFr : []) : null;
    }
    if (body.category !== undefined) updates.category = body.category;
    if (body.tags !== undefined) updates.tags = JSON.stringify(body.tags || []);
    if (body.authorId !== undefined) updates.authorId = body.authorId || null;
    if (body.published !== undefined) {
      updates.published = Boolean(body.published);
      const existing = await db.select().from(blogPosts).where(eq(blogPosts.id, idOrSlug));
      if (existing.length > 0 && !existing[0].publishedAt && Boolean(body.published)) {
        updates.publishedAt = new Date();
      }
    }
    if (body.featured !== undefined) updates.featured = Boolean(body.featured);

    if (body.seoTitle !== undefined) updates.seoTitle = body.seoTitle || null;
    if (body.metaDescription !== undefined) updates.metaDescription = body.metaDescription || null;
    if (body.focusKeyphrase !== undefined) updates.focusKeyphrase = body.focusKeyphrase || null;
    if (body.ogImage !== undefined) updates.ogImage = body.ogImage || null;
    if (body.canonicalUrl !== undefined) updates.canonicalUrl = body.canonicalUrl || null;
    if (body.noIndex !== undefined) updates.noIndex = Boolean(body.noIndex);
    if (body.seoTitleFr !== undefined) updates.seoTitleFr = body.seoTitleFr || null;
    if (body.metaDescriptionFr !== undefined) updates.metaDescriptionFr = body.metaDescriptionFr || null;
    if (body.focusKeyphraseFr !== undefined) updates.focusKeyphraseFr = body.focusKeyphraseFr || null;

    updates.updatedAt = new Date();

    const result = await db.update(blogPosts).set(updates).where(eq(blogPosts.id, idOrSlug)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { slug: idOrSlug } = await params;
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, idOrSlug)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted: result[0] });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}