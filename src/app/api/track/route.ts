import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import crypto from "crypto";

// Expanded bot regex (Level 2)
const BOT_REGEX = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|prerender|lighthouse|headless|monitor|check|scraper|http-client|axios|node-fetch|curl|wget|python|java|ruby|go-http|okhttp|apache|jakarta|libwww|urllib|scrapy|httpunit|puppeteer|playwright|selenium|phantomjs|nightmare|zombie|casperjs|jsdom|cheerio|nutch|yandex|baiduspider|sogou|exabot|ia_archiver|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|dataforseobot|blexbot|serpstatbot|seokicks|pinterestbot|linkedinbot|slackbot|twitterbot|discordbot|telegrambot|applebot|duckduckbot|bingbot|googlebot|adsbot|mediapartners|feedfetcher|gtmetrix|pingdom|uptime|newrelic|datadog|statuscake|siteimprove|screaming|majestic/i;

// Hosting/datacenter ASN keywords in reverse DNS (common bot origins)
const HOSTING_KEYWORDS = /amazonaws|googleusercontent|azure|digitalocean|linode|vultr|hetzner|ovh|scaleway|choopa|contabo|leaseweb|serverion|hostwinds|colocrossing/i;

// Simple in-memory rate limit per IP hash (60 events per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW = 60 * 1000;

// City lookup cache (visitorId -> geo, TTL 1 hour)
type GeoData = { country: string; region: string; city: string };
const geoCache = new Map<string, { data: GeoData; expiresAt: number }>();
const GEO_TTL = 60 * 60 * 1000;

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip + "ndz-salt-v1").digest("hex").slice(0, 32);
}

function getClientIp(req: NextRequest): string {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map(s => s.trim()).filter(Boolean);
    // Last non-empty is usually closest to origin behind CF
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return "0.0.0.0";
}

function checkRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ipHash);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ipHash, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT) return false;
  return true;
}

async function lookupGeo(visitorId: string, ip: string, cfCountry: string): Promise<GeoData> {
  const cached = geoCache.get(visitorId);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  // Default from Cloudflare header (fast, no API call)
  const fallback: GeoData = { country: cfCountry || "", region: "", city: "" };

  if (!ip || ip === "0.0.0.0") {
    geoCache.set(visitorId, { data: fallback, expiresAt: Date.now() + GEO_TTL });
    return fallback;
  }

  try {
    const ctl = new AbortController();
    const timeout = setTimeout(() => ctl.abort(), 2500);
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country_code,region,city`, {
      signal: ctl.signal,
      headers: { "User-Agent": "NDZ-Analytics/1.0" }
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error("ipwho HTTP " + res.status);
    const data = await res.json();
    if (data.success === false) throw new Error("ipwho failed");
    const geo: GeoData = {
      country: (data.country_code || cfCountry || "").toUpperCase().slice(0, 2),
      region: (data.region || "").slice(0, 100),
      city: (data.city || "").slice(0, 100),
    };
    geoCache.set(visitorId, { data: geo, expiresAt: Date.now() + GEO_TTL });
    return geo;
  } catch {
    geoCache.set(visitorId, { data: fallback, expiresAt: Date.now() + GEO_TTL });
    return fallback;
  }
}

// Bot heuristic scoring
function detectBot(ua: string, referrer: string, path: string): boolean {
  if (!ua || ua.length < 20) return true;
  if (BOT_REGEX.test(ua)) return true;
  // Missing browser signature
  const hasBrowserToken = /Mozilla|Chrome|Safari|Firefox|Edge|Opera/i.test(ua);
  if (!hasBrowserToken) return true;
  // Hosting provider mentioned in UA
  if (HOSTING_KEYWORDS.test(ua)) return true;
  // Suspiciously perfect empty referrer + admin path attempts
  if (path.match(/\.php|wp-admin|\.env|xmlrpc|\.git|phpmyadmin/i)) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ua = req.headers.get("user-agent") || "";
    const path = body.path || "";
    const referrer = body.referrer || "";

    // Bot detection
    const isBot = detectBot(ua, referrer, path);

    // Skip storing obvious junk
    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }
    const visitorId = body.visitorId || "anonymous";
    if (visitorId === "anonymous" || visitorId.length < 5) {
      return NextResponse.json({ ok: true });
    }

    // Rate limit per IP (skip humans hitting refresh too aggressively too)
    const clientIp = getClientIp(req);
    const ipHash = hashIp(clientIp);
    if (!checkRateLimit(ipHash)) {
      return NextResponse.json({ ok: true, rateLimited: true });
    }

    // Cloudflare country header (fast path)
    const cfCountryRaw = req.headers.get("cf-ipcountry") || "";
    const cfCountry = cfCountryRaw && cfCountryRaw.length === 2 && cfCountryRaw !== "XX" && cfCountryRaw !== "T1"
      ? cfCountryRaw.toUpperCase() : "";

    // Geo lookup (city/region) - only for non-bot page_view events to save API calls
    let geo: GeoData = { country: cfCountry, region: "", city: "" };
    if (!isBot && body.eventType === "page_view") {
      geo = await lookupGeo(visitorId, clientIp, cfCountry);
    } else if (cfCountry) {
      geo.country = cfCountry;
    }

    await db.insert(analyticsEvents).values({
      eventType: body.eventType || "unknown",
      path,
      productId: body.productId || null,
      productName: body.productName || null,
      postId: body.postId || null,
      searchQuery: body.searchQuery || null,
      referrer,
      visitorId,
      userAgent: ua.slice(0, 200),
      metadata: JSON.stringify(body.metadata || {}),
      country: geo.country,
      region: geo.region,
      city: geo.city,
      ipHash,
      isBot,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}