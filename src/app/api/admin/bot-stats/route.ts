import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { and, gte, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7");

  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  try {
    // Total counts
    const [totalRow] = await db
      .select({ c: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, start));

    const [botRow] = await db
      .select({ c: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(and(gte(analyticsEvents.createdAt, start), eq(analyticsEvents.isBot, true)));

    const total = Number(totalRow?.c || 0);
    const bots = Number(botRow?.c || 0);
    const humans = total - bots;
    const botRate = total > 0 ? (bots / total * 100) : 0;

    // Bot events with reasons (last 50)
    const recentBots = await db
      .select()
      .from(analyticsEvents)
      .where(and(gte(analyticsEvents.createdAt, start), eq(analyticsEvents.isBot, true)))
      .orderBy(sql`created_at desc`)
      .limit(100);

    // Aggregate bot reasons
    const reasonMap: Record<string, number> = {};
    const uaMap: Record<string, number> = {};
    const botIpMap: Record<string, number> = {};
    recentBots.forEach(b => {
      try {
        const meta = JSON.parse(b.metadata || "{}");
        const r = meta.botReason || "unknown";
        reasonMap[r] = (reasonMap[r] || 0) + 1;
      } catch { /* ignore */ }
      const uaShort = (b.userAgent || "").slice(0, 60);
      if (uaShort) uaMap[uaShort] = (uaMap[uaShort] || 0) + 1;
      const ev = b as unknown as { ipHash?: string };
      if (ev.ipHash) botIpMap[ev.ipHash] = (botIpMap[ev.ipHash] || 0) + 1;
    });

    const topReasons = Object.entries(reasonMap)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);

    const topBotUAs = Object.entries(uaMap)
      .map(([ua, count]) => ({ ua, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const uniqueBotIps = Object.keys(botIpMap).length;

    return NextResponse.json({
      ok: true,
      days,
      total,
      bots,
      humans,
      botRate: Math.round(botRate * 10) / 10,
      uniqueBotIps,
      topReasons,
      topBotUAs,
      sampleBots: recentBots.slice(0, 20).map(b => ({
        eventType: b.eventType,
        path: b.path,
        ua: (b.userAgent || "").slice(0, 100),
        referrer: b.referrer,
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

// Mark existing events as bots retroactively based on UA patterns
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun !== false;

    // Fetch all non-bot events (potentially bots we missed)
    const events = await db
      .select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.isBot, false))
      .limit(50000);

    const BOT_REGEX = /bot|crawl|spider|slurp|facebookexternalhit|meta-external|whatsapp|preview|prerender|lighthouse|headless|monitor|check|scraper|http-client|axios|node-fetch|curl|wget|python|java|ruby|go-http|okhttp|apache|scrapy|puppeteer|playwright|selenium|phantomjs|pinterestbot|linkedinbot|slackbot|twitterbot|discordbot|telegrambot|applebot|duckduckbot|bingbot|googlebot|adsbot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|meta-externalagent|facebot|dataforseobot/i;

    const toMark: string[] = [];
    events.forEach(e => {
      const ua = e.userAgent || "";
      if (!ua || ua.length < 20) { toMark.push(e.id); return; }
      if (BOT_REGEX.test(ua)) { toMark.push(e.id); return; }
      const hasBrowser = /Mozilla|Chrome|Safari|Firefox|Edge|Opera|Chromium/i.test(ua);
      if (!hasBrowser) { toMark.push(e.id); return; }
      if (e.path.match(/\.php|wp-admin|\.env|xmlrpc|\.git|phpmyadmin|wp-login/i)) {
        toMark.push(e.id);
        return;
      }
    });

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        scanned: events.length,
        wouldMark: toMark.length,
        sample: toMark.slice(0, 5),
      });
    }

    // Actually mark them
    let updated = 0;
    for (const id of toMark) {
      await db.update(analyticsEvents).set({ isBot: true }).where(eq(analyticsEvents.id, id));
      updated++;
    }

    return NextResponse.json({
      ok: true,
      dryRun: false,
      scanned: events.length,
      marked: updated,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}