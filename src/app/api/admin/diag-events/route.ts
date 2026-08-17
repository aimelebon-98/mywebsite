import { NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await db
    .select()
    .from(analyticsEvents)
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(20);
  
  return NextResponse.json({
    count: events.length,
    events: events.map(e => ({
      time: e.createdAt,
      type: e.eventType,
      country: (e as unknown as { country?: string }).country || "(empty)",
      region: (e as unknown as { region?: string }).region || "(empty)",
      city: (e as unknown as { city?: string }).city || "(empty)",
      isBot: (e as unknown as { isBot?: boolean }).isBot,
      visitorId: e.visitorId.slice(0, 10),
      path: e.path.slice(0, 50),
    })),
  });
}