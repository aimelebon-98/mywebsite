import { NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Get all "bot" events
    const events = await db
      .select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.isBot, true));

    let unmarked = 0;
    const reasons: Record<string, number> = {};

    for (const e of events) {
      const ua = e.userAgent || "";
      
      // If UA has real browser signature and is not in known bot patterns, unmark
      const hasBrowser = /Mozilla|Chrome|Safari|Firefox|Edge|Opera|Chromium/i.test(ua);
      const isKnownBot = /bot|crawl|spider|slurp|facebookexternalhit|meta-external|headless|scraper|puppeteer|playwright|selenium|curl|wget|python/i.test(ua);
      
      // Real browser UA + not known bot pattern = likely false positive
      if (hasBrowser && !isKnownBot && ua.length > 30) {
        await db.update(analyticsEvents).set({ isBot: false }).where(eq(analyticsEvents.id, e.id));
        unmarked++;
        try {
          const meta = JSON.parse(e.metadata || "{}");
          const r = meta.botReason || "unknown";
          reasons[r] = (reasons[r] || 0) + 1;
        } catch { /* ignore */ }
      }
    }

    return NextResponse.json({
      ok: true,
      totalBots: events.length,
      unmarked,
      unmarkedByReason: reasons,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}