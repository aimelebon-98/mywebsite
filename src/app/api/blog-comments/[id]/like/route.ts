import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogComments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const unlike = body.unlike === true;

    const delta = unlike ? -1 : 1;
    const result = await db.update(blogComments)
      .set({ likes: sql`GREATEST(0, ${blogComments.likes} + ${delta})` })
      .where(eq(blogComments.id, id))
      .returning({ likes: blogComments.likes });

    if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ likes: result[0].likes });
  } catch (error) {
    console.error("Error liking comment:", error);
    return NextResponse.json({ error: "Failed to like" }, { status: 500 });
  }
}