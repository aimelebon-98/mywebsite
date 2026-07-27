import { NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { sql, gte, lt, and } from "drizzle-orm";

export async function GET() {
  const days = 1;
  const now = new Date();

  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - days);
  currentStart.setHours(0, 0, 0, 0);

  const previousStart = new Date(currentStart);
  previousStart.setDate(previousStart.getDate() - days);

  // Get sample event dates
  const recent = await db.execute(sql`
    SELECT visitor_id, event_type, created_at
    FROM analytics_events
    WHERE visitor_id LIKE 'fake_%'
    ORDER BY created_at DESC
    LIMIT 5;
  `);

  const currentCount = await db.select({ c: sql<number>`count(*)` }).from(analyticsEvents).where(gte(analyticsEvents.createdAt, currentStart));
  const previousCount = await db.select({ c: sql<number>`count(*)` }).from(analyticsEvents).where(and(gte(analyticsEvents.createdAt, previousStart), lt(analyticsEvents.createdAt, currentStart)));

  return NextResponse.json({
    now: now.toISOString(),
    currentStart: currentStart.toISOString(),
    previousStart: previousStart.toISOString(),
    windowExplanation: `Current period: ${currentStart.toISOString()} <= createdAt < now. Previous: ${previousStart.toISOString()} <= createdAt < ${currentStart.toISOString()}`,
    currentCount: currentCount[0]?.c,
    previousCount: previousCount[0]?.c,
    sampleFakeEvents: recent.rows || recent,
  });
}
