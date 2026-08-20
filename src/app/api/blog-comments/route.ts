import { NextResponse } from "next/server";
import { db } from "@/db";
import { blogComments } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifyTurnstile } from "@/lib/turnstile";
import { isRateLimited } from "@/lib/rate-limit";
import { headers } from "next/headers";

// Strip all HTML tags to prevent stored XSS
function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const comments = await db.select().from(blogComments)
      .where(and(eq(blogComments.postId, postId), eq(blogComments.approved, true)))
      .orderBy(desc(blogComments.createdAt));

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const h = await headers();
    const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "";

    if (isRateLimited(ip, 10, 60000)) {
      return NextResponse.json({ error: "Too many comments submitted. Please wait a minute." }, { status: 429 });
    }

    const body = await req.json();
    const postId = body.postId ? String(body.postId) : "";
    const parentId = body.parentId ? String(body.parentId) : undefined;
    const authorName = body.authorName ? sanitizeHtml(String(body.authorName).slice(0, 100)) : "";
    const authorEmail = body.authorEmail ? String(body.authorEmail).trim().toLowerCase().slice(0, 100) : "";
    const content = body.content ? sanitizeHtml(String(body.content).slice(0, 2000)) : "";
    const turnstileToken = body.turnstileToken ? String(body.turnstileToken) : "";

    if (!postId || !authorName || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (turnstileToken) {
      const captchaOk = await verifyTurnstile(turnstileToken, ip);
      if (!captchaOk) {
        return NextResponse.json({ error: "Security check failed. Please refresh and try again." }, { status: 403 });
      }
    }

    const [inserted] = await db.insert(blogComments).values({
      postId,
      parentId,
      authorName,
      authorEmail,
      content,
      approved: true,
      likes: 0,
      ipAddress: ip.slice(0, 50),
    }).returning();

    return NextResponse.json({ success: true, comment: inserted });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to post comment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}