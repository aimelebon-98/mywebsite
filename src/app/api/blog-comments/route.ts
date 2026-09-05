import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogComments } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function cleanText(str: string): string {
  if (!str) return "";
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

const createCommentSchema = z.object({
  postId: z.string().min(1, "Post ID required"),
  parentId: z.string().nullable().optional(),
  authorName: z.string().trim().min(1, "Please enter your name").max(100),
  authorEmail: z.string().trim().max(200).optional().default(""),
  content: z.string().trim().min(1, "Please write a comment").max(5000),
  locale: z.enum(["en", "fr"]).optional().default("en"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const all = searchParams.get("all");

    // Admin request for all comments
    if (all === "true") {
      const unauth = await requireAdmin();
      if (unauth) return unauth;

      const comments = await db.select().from(blogComments)
        .orderBy(desc(blogComments.createdAt));

      return NextResponse.json(comments);
    }

    if (!postId) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 });
    }

    const locale = searchParams.get("locale");

    const conditions = [
      eq(blogComments.postId, postId),
      eq(blogComments.approved, true),
    ];

    if (locale && (locale === "en" || locale === "fr")) {
      conditions.push(eq(blogComments.locale, locale));
    }

    const comments = await db.select().from(blogComments)
      .where(and(...conditions))
      .orderBy(desc(blogComments.createdAt));

    return NextResponse.json(comments);
  } catch (error) {
    console.error("[Blog Comments GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }

    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid comment data" }, { status: 400 });
    }

    const { postId, parentId, authorName, authorEmail, content, locale } = parsed.data;

    const sanitizedAuthor = cleanText(authorName);
    const sanitizedContent = cleanText(content);

    if (!sanitizedAuthor || !sanitizedContent) {
      return NextResponse.json({ error: "Name and comment content are required" }, { status: 400 });
    }

    const [comment] = await db.insert(blogComments).values({
      postId,
      parentId: parentId || null,
      authorName: sanitizedAuthor,
      authorEmail: cleanText(authorEmail || ""),
      content: sanitizedContent,
      locale: locale || "en",
      approved: false,
      likes: 0,
    }).returning();

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error("[Blog Comments POST] Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to submit comment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}