import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ua = req.headers.get("user-agent") || "";

    // Ignore bots
    if (/bot|crawl|spider|slurp/i.test(ua)) {
      return NextResponse.json({ ok: true });
    }

    await db.insert(analyticsEvents).values({
      eventType: body.eventType || "unknown",
      path: body.path || "",
      productId: body.productId || null,
      productName: body.productName || null,
      postId: body.postId || null,
      searchQuery: body.searchQuery || null,
      referrer: body.referrer || "",
      visitorId: body.visitorId || "anonymous",
      userAgent: ua.slice(0, 200),
      metadata: JSON.stringify(body.metadata || {}),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Never fail on tracking
  }
}
