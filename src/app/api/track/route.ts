import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import crypto from "crypto";

const BOT_REGEX = /bot|crawl|spider|slurp|facebookexternalhit|meta-external|whatsapp|preview|prerender|lighthouse|headless|monitor|check|scraper|http-client|axios|node-fetch|curl|wget|python|java|ruby|go-http|okhttp|apache|jakarta|libwww|urllib|scrapy|httpunit|puppeteer|playwright|selenium|phantomjs|nightmare|zombie|casperjs|jsdom|cheerio|nutch|yandex|baiduspider|sogou|exabot|ia_archiver|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|dataforseobot|blexbot|serpstatbot|seokicks|pinterestbot|linkedinbot|slackbot|twitterbot|discordbot|telegrambot|applebot|duckduckbot|bingbot|googlebot|adsbot|mediapartners|feedfetcher|gtmetrix|pingdom|uptime|newrelic|datadog|statuscake|siteimprove|screaming|majestic|meta-externalagent|facebot|dataforseobot/i;

const HOSTING_KEYWORDS = /amazonaws|googleusercontent|azure|digitalocean|linode|vultr|hetzner|ovh|scaleway|choopa|contabo|leaseweb|serverion|hostwinds|colocrossing/i;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW = 60 * 1000;

type GeoData = { country: string; region: string; city: string };
const geoCache = new Map<string, { data: GeoData; expiresAt: number }>();
const GEO_TTL = 30 * 60 * 1000; // 30 min

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
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return "";
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

// DUAL-API GEO LOOKUP: tries ipwho.is FIRST, ipapi.co as fallback, ip-api.com as last resort
async function lookupGeoWithFallbacks(ip: string, cfCountry: string): Promise<GeoData> {
  const fallback: GeoData = { country: cfCountry || "", region: "", city: "" };
  if (!ip) return fallback;

  // Attempt 1: ipwho.is (primary)
  try {
    const ctl = new AbortController();
    const timeout = setTimeout(() => ctl.abort(), 2000);
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country_code,region,city`, {
      signal: ctl.signal,
      headers: { "User-Agent": "NDZ/1.0" }
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data.success !== false && data.city) {
        return {
          country: (data.country_code || cfCountry || "").toUpperCase().slice(0, 2),
          region: String(data.region || "").slice(0, 100),
          city: String(data.city || "").slice(0, 100),
        };
      }
    }
  } catch { /* try next */ }

  // Attempt 2: ipapi.co (fallback)
  try {
    const ctl = new AbortController();
    const timeout = setTimeout(() => ctl.abort(), 2000);
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: ctl.signal,
      headers: { "User-Agent": "NDZ/1.0" }
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data && !data.error && data.city) {
        return {
          country: String(data.country_code || cfCountry || "").toUpperCase().slice(0, 2),
          region: String(data.region || "").slice(0, 100),
          city: String(data.city || "").slice(0, 100),
        };
      }
    }
  } catch { /* try next */ }

  // Attempt 3: ip-api.com (last resort, HTTP only)
  try {
    const ctl = new AbortController();
    const timeout = setTimeout(() => ctl.abort(), 2000);
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode,regionName,city`, {
      signal: ctl.signal,
      headers: { "User-Agent": "NDZ/1.0" }
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data.status === "success" && data.city) {
        return {
          country: String(data.countryCode || cfCountry || "").toUpperCase().slice(0, 2),
          region: String(data.regionName || "").slice(0, 100),
          city: String(data.city || "").slice(0, 100),
        };
      }
    }
  } catch { /* fall through */ }

  return fallback;
}

async function lookupGeo(ip: string, cfCountry: string): Promise<GeoData> {
  // Cache by IP hash (not visitorId) so multiple visitors from same IP share cache
  const cacheKey = hashIp(ip);
  const cached = geoCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() && cached.data.city) return cached.data;

  const geo = await lookupGeoWithFallbacks(ip, cfCountry);
  
  // Only cache if we got a city
  if (geo.city) {
    geoCache.set(cacheKey, { data: geo, expiresAt: Date.now() + GEO_TTL });
  }
  
  return geo;
}

function detectBot(ua: string, path: string, acceptLang: string): { isBot: boolean; reason: string } {
  if (!ua || ua.length < 20) return { isBot: true, reason: "ua_missing" };
  if (BOT_REGEX.test(ua)) return { isBot: true, reason: "ua_bot_signature" };
  const hasBrowserToken = /Mozilla|Chrome|Safari|Firefox|Edge|Opera|Chromium/i.test(ua);
  if (!hasBrowserToken) return { isBot: true, reason: "no_browser_token" };
  if (HOSTING_KEYWORDS.test(ua)) return { isBot: true, reason: "hosting_provider" };
  if (path.match(/\.php|wp-admin|\.env|xmlrpc|\.git|phpmyadmin|wp-login|xmlrpc\.php|\.htaccess|\.ssh|\.aws|config\.json/i)) {
    return { isBot: true, reason: "vuln_scan_path" };
  }
  if (!acceptLang || acceptLang.length < 2) return { isBot: true, reason: "no_accept_language" };
  if (/HeadlessChrome|Chrome-Lighthouse|Chrome\/[\d.]+ Safari.*HeadlessChrome/i.test(ua)) {
    return { isBot: true, reason: "headless_chrome" };
  }
  // Only real fake FB in-app: has FBAV token but missing FBAN prefix (impossible for real FB app)
  if (/FBAV/i.test(ua) && !/FBAN\/(FBIOS|FB4A|MessengerForiOS)/i.test(ua)) {
    return { isBot: true, reason: "fake_fb_inapp_no_fban" };
  }
  return { isBot: false, reason: "" };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ua = req.headers.get("user-agent") || "";
    const acceptLang = req.headers.get("accept-language") || "";
    const path = body.path || "";
    const referrer = body.referrer || "";
    const visitorId = body.visitorId || "anonymous";

    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }
    if (visitorId === "anonymous" || visitorId.length < 5) {
      return NextResponse.json({ ok: true });
    }

    const clientIp = getClientIp(req);
    const ipHash = clientIp ? hashIp(clientIp) : "";
    if (ipHash && !checkRateLimit(ipHash)) {
      return NextResponse.json({ ok: true, rateLimited: true });
    }

    const botCheck = detectBot(ua, path, acceptLang);
    const isBot = botCheck.isBot;

    const cfCountryRaw = req.headers.get("cf-ipcountry") || "";
    const cfCountry = cfCountryRaw && cfCountryRaw.length === 2 && cfCountryRaw !== "XX" && cfCountryRaw !== "T1"
      ? cfCountryRaw.toUpperCase() : "";

    let geo: GeoData = { country: cfCountry, region: "", city: "" };
    if (!isBot && clientIp && (body.eventType === "page_view" || body.eventType === "product_view")) {
      geo = await lookupGeo(clientIp, cfCountry);
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
      metadata: JSON.stringify({ ...(body.metadata || {}), botReason: botCheck.reason || undefined }),
      country: geo.country,
      region: geo.region,
      city: geo.city,
      ipHash,
      isBot,
    });

    return NextResponse.json({ ok: true, isBot, city: geo.city });
  } catch {
    return NextResponse.json({ ok: true });
  }
}