import { NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { eq, and, like, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Unmark events that were flagged as fake_fb_inapp but have real iPhone UA (no FBAV token)
    // Real iOS Safari has: "iPhone; CPU iPhone OS X_X like Mac OS X" + Safari
    // If FBAV is not in UA, they can't possibly be "fake facebook in-app" - it was our bug
    
    const events = await db
      .select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.isBot, true));

    const toUnmark: string[] = [];
    events.forEach(e => {
      const ua = e.userAgent || "";
      // If UA doesn't contain FBAV/FBAN/Instagram, it can't be a "fake fb inapp" — clear false positive
      if (!/FBAN|FBAV|Instagram/i.test(ua)) {
        // Check metadata for the false-positive reason
        try {
          const meta = JSON.parse(e.metadata || "{}");
          if (meta.botReason === "fake_fb_inapp") {
            toUnmark.push(e.id);
          }
        } catch { /* ignore */ }
      }
    });

    let unmarked = 0;
    for (const id of toUnmark) {
      await db.update(analyticsEvents).set({ isBot: false }).where(eq(analyticsEvents.id, id));
      unmarked++;
    }

    return NextResponse.json({
      ok: true,
      totalBots: events.length,
      falsePositivesFound: toUnmark.length,
      unmarked,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}