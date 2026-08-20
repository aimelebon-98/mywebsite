import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogComments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { isRateLimited } from "@/lib/rate-limit";
import { sanitizeHtml } from "@/lib/sanitize";
import { z } from "zod";

const createCommentSchema = z.object({
  postId: z.string().uuid("Invalid blog post ID"),
  parentId: z.string().uuid().nullable().optional(),
  authorName: z.string().trim().min(2, "Name required").max(100),
  content: z.string().trim().min(3, "Comment required").max(2000),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 });
    }

    const comments = await db.select().from(blogComments)
      .where(eq(blogComments.postId, postId))
      .orderBy(desc(blogComments.createdAt));

    return NextResponse.json(comments);
  } catch (error) {
    console.error("[Blog Comments GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("cf-connecting-ip") ||
               req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
               req.headers.get("x-real-ip") || "";

    if (isRateLimited(ip, 5, 60000)) {
      return NextResponse.json({ error: "Too many comments. Please wait 1 minute." }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }

    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { postId, parentId, authorName, content } = parsed.data;

    const sanitizedAuthor = sanitizeHtml(authorName);
    const sanitizedContent = sanitizeHtml(content);

    const [comment] = await db.insert(blogComments).values({
      postId,
      parentId: parentId || null,
      authorName: sanitizedAuthor,
      content: sanitizedContent,
      approved: true,
      likes: 0,
    }).returning();

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error("[Blog Comments POST] Error:", error);
    return NextResponse.json({ error: "Failed to submit comment" }, { status: 500 });
  }
}