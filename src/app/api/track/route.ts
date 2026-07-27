import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";

const BOT_REGEX = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|prerender|lighthouse|headless|monitor|check|scraper|http-client|axios|node-fetch|curl|wget|python|java|ruby|go-http/i;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ua = req.headers.get("user-agent") || "";

    // Enhanced bot detection
    if (BOT_REGEX.test(ua) || !ua || ua.length < 20) {
      return NextResponse.json({ ok: true });
    }

    // Skip admin paths at server level too (defense in depth)
    const path = body.path || "";
    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }

    // Skip if visitorId looks invalid
    const visitorId = body.visitorId || "anonymous";
    if (visitorId === "anonymous" || visitorId.length < 5) {
      return NextResponse.json({ ok: true });
    }

    await db.insert(analyticsEvents).values({
      eventType: body.eventType || "unknown",
      path,
      productId: body.productId || null,
      productName: body.productName || null,
      postId: body.postId || null,
      searchQuery: body.searchQuery || null,
      referrer: body.referrer || "",
      visitorId,
      userAgent: ua.slice(0, 200),
      metadata: JSON.stringify(body.metadata || {}),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
