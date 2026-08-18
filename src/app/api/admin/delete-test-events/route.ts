import { NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { like, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Count first
    const [beforeRow] = await db
      .select({ c: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(like(analyticsEvents.visitorId, "test_%"));
    const before = Number(beforeRow?.c || 0);

    await db.delete(analyticsEvents).where(like(analyticsEvents.visitorId, "test_%"));

    return NextResponse.json({
      ok: true,
      deleted: before,
      message: `Deleted ${before} test events (visitors starting with test_)`
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [row] = await db
      .select({ c: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(like(analyticsEvents.visitorId, "test_%"));
    return NextResponse.json({
      ok: true,
      testEventCount: Number(row?.c || 0)
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}