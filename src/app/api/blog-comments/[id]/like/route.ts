import { NextResponse } from "next/server";
import { db } from "@/db";
import { blogComments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { isRateLimited } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const h = await headers();
    const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "";

    if (isRateLimited(ip, 15, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const { id } = await params;
    await db.update(blogComments)
      .set({ likes: sql`${blogComments.likes} + 1` })
      .where(eq(blogComments.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to like comment" }, { status: 500 });
  }
}