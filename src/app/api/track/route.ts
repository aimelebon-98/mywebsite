import { NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { isRateLimited } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function ensureAnalyticsTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        event_type text NOT NULL,
        path text NOT NULL DEFAULT '',
        product_id uuid,
        product_name text,
        post_id uuid,
        search_query text,
        referrer text DEFAULT '',
        visitor_id text NOT NULL DEFAULT '',
        country text DEFAULT '',
        region text DEFAULT '',
        city text DEFAULT '',
        ip_hash text DEFAULT '',
        is_bot boolean NOT NULL DEFAULT false,
        user_agent text DEFAULT '',
        created_at timestamp DEFAULT now() NOT NULL
      )
    `);
  } catch (e) {
    console.error("ensureAnalyticsTable error:", e);
  }
}

function isKnownBot(ua: string): boolean {
  if (!ua) return false;
  return /bot|spider|crawl|slurp|facebookexternalhit|meta-externalagent|twitterbot|pinterest|bytespider|gptbot|claudebot|perplexitybot|headless|phantom|puppeteer/i.test(ua);
}

const FOREIGN_DC_CITIES = new Set([
  "johannesburg", "paris", "london", "frankfurt", "washington", "dublin",
  "ashburn", "atlanta", "chicago", "dallas", "seattle", "amsterdam", "singapore"
]);

function sanitizeCity(city: string, country: string): string {
  const cCode = (country || "").toUpperCase().trim();
  const cName = (city || "").trim();
  const cLower = cName.toLowerCase();

  if (cCode === "TG") {
    if (!cName || FOREIGN_DC_CITIES.has(cLower)) return "Lomé";
  } else if (cCode === "NG") {
    if (!cName || FOREIGN_DC_CITIES.has(cLower)) return "Abuja";
  } else if (cCode === "GH") {
    if (!cName || FOREIGN_DC_CITIES.has(cLower)) return "Accra";
  } else if (cCode === "CI") {
    if (!cName || FOREIGN_DC_CITIES.has(cLower)) return "Abidjan";
  } else if (cCode === "SN") {
    if (!cName || FOREIGN_DC_CITIES.has(cLower)) return "Dakar";
  } else if (cCode === "BJ") {
    if (!cName || FOREIGN_DC_CITIES.has(cLower)) return "Cotonou";
  }

  return cName || (cCode === "TG" ? "Lomé" : cCode === "NG" ? "Abuja" : "Main Region");
}

export async function POST(req: Request) {
  try {
    const h = await headers();
    const cfIp = h.get("cf-connecting-ip");
    const xForwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
    const xReal = h.get("x-real-ip");
    const ip = cfIp || xForwarded || xReal || "127.0.0.1";

    if (isRateLimited(ip, 120, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const ua = h.get("user-agent") || "";
    const isBot = isKnownBot(ua);

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: true });
    }

    const eventType = typeof body.eventType === "string" ? body.eventType.trim() : typeof body.event === "string" ? body.event.trim() : "page_view";
    const path = typeof body.path === "string" ? body.path.trim().slice(0, 500) : "";
    const visitorId = typeof body.visitorId === "string" ? body.visitorId.trim().slice(0, 100) : ip;
    const productName = typeof body.productName === "string" ? body.productName.trim().slice(0, 200) : null;
    const searchQuery = typeof body.searchQuery === "string" ? body.searchQuery.trim().slice(0, 200) : null;
    const referrer = typeof body.referrer === "string" ? body.referrer.trim().slice(0, 500) : (h.get("referer") || "");

    const rawCountry = h.get("cf-ipcountry") || h.get("x-vercel-ip-country") || "TG";
    const rawCity = h.get("cf-ipcity") || h.get("x-vercel-ip-city") || "";

    const country = rawCountry.toUpperCase().trim();
    const city = sanitizeCity(rawCity, country);

    await ensureAnalyticsTable();

    await db.insert(analyticsEvents).values({
      eventType,
      path,
      productName,
      searchQuery,
      referrer,
      visitorId: visitorId || "anon",
      country,
      city,
      isBot,
      userAgent: ua.slice(0, 300),
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking API error:", error);
    return NextResponse.json({ error: "Tracking error" }, { status: 500 });
  }
}