import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogComments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

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

    const { postId, parentId, authorName, authorEmail, content } = parsed.data;

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
      approved: true,
      likes: 0,
    }).returning();

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error("[Blog Comments POST] Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to submit comment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}