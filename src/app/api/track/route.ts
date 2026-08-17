import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import crypto from "crypto";

// LEVEL 3 BOT REGEX - includes Meta/Facebook validators, ad preview bots, headless browsers, click farms
const BOT_REGEX = /bot|crawl|spider|slurp|facebookexternalhit|meta-external|whatsapp|preview|prerender|lighthouse|headless|monitor|check|scraper|http-client|axios|node-fetch|curl|wget|python|java|ruby|go-http|okhttp|apache|jakarta|libwww|urllib|scrapy|httpunit|puppeteer|playwright|selenium|phantomjs|nightmare|zombie|casperjs|jsdom|cheerio|nutch|yandex|baiduspider|sogou|exabot|ia_archiver|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|dataforseobot|blexbot|serpstatbot|seokicks|pinterestbot|linkedinbot|slackbot|twitterbot|discordbot|telegrambot|applebot|duckduckbot|bingbot|googlebot|adsbot|mediapartners|feedfetcher|gtmetrix|pingdom|uptime|newrelic|datadog|statuscake|siteimprove|screaming|majestic|meta-externalagent|facebot|fbav\/0|instagramav\/0|hatena|feedly|inoreader|newsblur|feedspot|superfeedr|feedbin|rssowl|liferea|akregator|feedreader|feedvalidator|w3c_validator|wapiti|nikto|nessus|arachni|acunetix|zaproxy|owasp|dirbuster|wpscan|joomscan|drupwn|whatweb|sqlmap|jbrofuzz|paros|webinspect|appscan|contrast|checkmarx/i;

// Meta/Facebook specific bot signatures
const META_BOT_REGEX = /facebookexternalhit|meta-externalagent|meta-external|facebot|fbav\/0\.0|instagramav\/0\.0|fbcrawl|facebook-instant|facebook-preview/i;

// Hosting/datacenter keywords in UA
const HOSTING_KEYWORDS = /amazonaws|googleusercontent|azure|digitalocean|linode|vultr|hetzner|ovh|scaleway|choopa|contabo|leaseweb|serverion|hostwinds|colocrossing|amazon|google|microsoft/i;

// Rate limiting per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW = 60 * 1000;

// Visitor behavior tracking (for click fraud detection)
const visitorBehavior = new Map<string, { firstSeen: number; lastSeen: number; pageViews: number; interactions: number; ip: string }>();
const BEHAVIOR_TTL = 30 * 60 * 1000; // 30 min

// Geo cache
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

// Bot detection with multiple signals
function detectBot(
  ua: string,
  referrer: string,
  path: string,
  visitorId: string,
  ip: string,
  acceptLang: string
): { isBot: boolean; reason: string } {
  // 1. UA missing or too short
  if (!ua || ua.length < 20) return { isBot: true, reason: "ua_missing" };

  // 2. Known bot patterns (comprehensive)
  if (BOT_REGEX.test(ua)) return { isBot: true, reason: "ua_bot_signature" };

  // 3. Meta specific bots
  if (META_BOT_REGEX.test(ua)) return { isBot: true, reason: "meta_bot" };

  // 4. Missing browser tokens (real browsers always have these)
  const hasBrowserToken = /Mozilla|Chrome|Safari|Firefox|Edge|Opera|Chromium/i.test(ua);
  if (!hasBrowserToken) return { isBot: true, reason: "no_browser_token" };

  // 5. Hosting provider signature in UA (datacenter traffic)
  if (HOSTING_KEYWORDS.test(ua)) return { isBot: true, reason: "hosting_provider" };

  // 6. Attempts to hit vulnerability paths
  if (path.match(/\.php|wp-admin|\.env|xmlrpc|\.git|phpmyadmin|wp-login|xmlrpc\.php|\.htaccess|\.ssh|\.aws|config\.json/i)) {
    return { isBot: true, reason: "vuln_scan_path" };
  }

  // 7. Missing Accept-Language header (real browsers always send this)
  if (!acceptLang || acceptLang.length < 2) return { isBot: true, reason: "no_accept_language" };

  // 8. UA looks like real browser but with automation flags
  if (/HeadlessChrome|Chrome-Lighthouse|Chrome\/[\d.]+ Safari.*HeadlessChrome/i.test(ua)) {
    return { isBot: true, reason: "headless_chrome" };
  }

  // 9. Facebook in-app browser with tell-tale bot signature (fake ad clicks often have these)
  //    Real FB in-app: "FBAN/FBIOS;FBAV/[version];..." with valid version numbers
  //    Fake: FBAV/0.0.0 or missing version
  if (/FBAN|FBAV|Instagram/i.test(ua)) {
    if (/FBAV\/0\.0|FBAV\/1\.0\.0[^0-9]|Instagram [0-9]{1,3}\.0\.0[^0-9]/i.test(ua)) {
      return { isBot: true, reason: "fake_fb_inapp" };
    }
  }

  // 10. Very old / suspicious UA versions (bots often fake old versions)
  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  if (chromeMatch && parseInt(chromeMatch[1]) < 90) return { isBot: true, reason: "outdated_chrome" };

  return { isBot: false, reason: "" };
}

// Click fraud pattern detection (behavioral)
function detectClickFraud(visitorId: string, ip: string, path: string, referrer: string): { suspicious: boolean; reason: string } {
  const now = Date.now();
  const entry = visitorBehavior.get(visitorId);

  if (!entry) {
    visitorBehavior.set(visitorId, { firstSeen: now, lastSeen: now, pageViews: 1, interactions: 0, ip });
    return { suspicious: false, reason: "" };
  }

  // Same visitorId but different IP mid-session = suspicious (VPN switching or shared bot pool)
  if (entry.ip && entry.ip !== ip) {
    return { suspicious: true, reason: "ip_change_mid_session" };
  }

  // Update
  entry.lastSeen = now;
  entry.pageViews++;

  // Cleanup old entries
  if (visitorBehavior.size > 5000) {
    for (const [k, v] of visitorBehavior.entries()) {
      if (v.lastSeen < now - BEHAVIOR_TTL) visitorBehavior.delete(k);
    }
  }

  return { suspicious: false, reason: "" };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ua = req.headers.get("user-agent") || "";
    const acceptLang = req.headers.get("accept-language") || "";
    const path = body.path || "";
    const referrer = body.referrer || "";
    const visitorId = body.visitorId || "anonymous";

    // Skip admin/api paths
    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }

    if (visitorId === "anonymous" || visitorId.length < 5) {
      return NextResponse.json({ ok: true });
    }

    // Get client IP
    const clientIp = getClientIp(req);
    const ipHash = hashIp(clientIp);

    // Rate limit
    if (!checkRateLimit(ipHash)) {
      return NextResponse.json({ ok: true, rateLimited: true });
    }

    // Bot detection
    const botCheck = detectBot(ua, referrer, path, visitorId, clientIp, acceptLang);

    // Fraud detection (only for humans)
    let fraudReason = "";
    if (!botCheck.isBot) {
      const fraud = detectClickFraud(visitorId, clientIp, path, referrer);
      if (fraud.suspicious) fraudReason = fraud.reason;
    }

    // Flag as bot if either detection triggered
    const isBot = botCheck.isBot || !!fraudReason;
    const botReason = botCheck.reason || fraudReason;

    // Cloudflare country
    const cfCountryRaw = req.headers.get("cf-ipcountry") || "";
    const cfCountry = cfCountryRaw && cfCountryRaw.length === 2 && cfCountryRaw !== "XX" && cfCountryRaw !== "T1"
      ? cfCountryRaw.toUpperCase() : "";

    // Geo lookup only for legit page_view events
    let geo: GeoData = { country: cfCountry, region: "", city: "" };
    if (!isBot && body.eventType === "page_view") {
      geo = await lookupGeo(visitorId, clientIp, cfCountry);
    } else if (cfCountry) {
      geo.country = cfCountry;
    }

    // Store all events (including bots) with isBot flag for review
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
      metadata: JSON.stringify({ ...(body.metadata || {}), botReason: botReason || undefined }),
      country: geo.country,
      region: geo.region,
      city: geo.city,
      ipHash,
      isBot,
    });

    return NextResponse.json({ ok: true, isBot });
  } catch {
    return NextResponse.json({ ok: true });
  }
}