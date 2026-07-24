import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogComments } from "@/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { requireAdmin, verifyAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const includeUnapproved = searchParams.get("all") === "true";

    // Admin-only if requesting unapproved (moderation view)
    if (includeUnapproved) {
      const isAdmin = await verifyAdmin();
      if (!isAdmin) return new NextResponse("Not Found", { status: 404 });
    }

    if (!postId && !includeUnapproved) {
      return NextResponse.json({ error: "postId required" }, { status: 400 });
    }

    const conditions = [];
    if (postId) conditions.push(eq(blogComments.postId, postId));
    if (!includeUnapproved) conditions.push(eq(blogComments.approved, true));

    const result = await db.select().from(blogComments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(blogComments.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, parentId, authorName, authorEmail, content } = body;

    if (!postId || !authorName || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Simple spam guard: content too short/long
    if (content.trim().length < 2 || content.length > 5000) {
      return NextResponse.json({ error: "Invalid content length" }, { status: 400 });
    }

    // Get IP for spam prevention
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
               request.headers.get("x-real-ip") || "";

    const result = await db.insert(blogComments).values({
      postId,
      parentId: parentId || null,
      authorName: authorName.trim().slice(0, 100),
      authorEmail: (authorEmail || "").trim().slice(0, 200),
      content: content.trim(),
      approved: false,
      likes: 0,
      ipAddress: ip,
    }).returning();

    return NextResponse.json({ success: true, comment: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to submit comment" }, { status: 500 });
  }
}
