import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "all";
    const visitorId = searchParams.get("visitorId");

    if (mode === "visitor" && visitorId) {
      await db.delete(analyticsEvents).where(eq(analyticsEvents.visitorId, visitorId));
      return NextResponse.json({ ok: true, message: `Deleted events for visitor ${visitorId}` });
    }

    if (mode === "all") {
      await db.execute(sql`DELETE FROM analytics_events;`);
      return NextResponse.json({ ok: true, message: "All analytics data cleared" });
    }

    return NextResponse.json({ ok: false, error: "Invalid mode" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
