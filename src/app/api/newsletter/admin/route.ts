import { requireAdmin } from "@/lib/admin-auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletter } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const subscribers = await db
      .select()
      .from(newsletter)
      .orderBy(newsletter.id);
    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("Newsletter GET error:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authErr = await requireAdmin(); if (authErr) return authErr;
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    await db.delete(newsletter).where(eq(newsletter.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 });
  }
}
