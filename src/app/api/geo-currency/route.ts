import { NextRequest, NextResponse } from "next/server";
import { COUNTRY_TO_CURRENCY } from "@/lib/currency";

// Server-side cache for external geo lookups (per IP, 1 hour)
const geoCache = new Map<string, { country: string; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000;

async function externalGeo(ip: string): Promise<string> {
  if (!ip) return "";

  // Check cache
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.country;

  // Try ip-api.com (free, no key needed, 45 req/min)
  try {
    const r = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (r.ok) {
      const j = await r.json();
      if (j.countryCode && typeof j.countryCode === "string") {
        geoCache.set(ip, { country: j.countryCode, ts: Date.now() });
        return j.countryCode;
      }
    }
  } catch { /* ignore */ }

  // Fallback: ipwho.is (also free)
  try {
    const r = await fetch(`https://ipwho.is/${ip}?fields=country_code`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (r.ok) {
      const j = await r.json();
      if (j.country_code && typeof j.country_code === "string") {
        geoCache.set(ip, { country: j.country_code, ts: Date.now() });
        return j.country_code;
      }
    }
  } catch { /* ignore */ }

  return "";
}

export async function GET(req: NextRequest) {
  try {
    // Vercel's geo header (fast but sometimes wrong for African mobile IPs)
    const vercelCountry = req.headers.get("x-vercel-ip-country") || "";
    const cfCountry = req.headers.get("cf-ipcountry") || "";
    const primaryCountry = (vercelCountry || cfCountry || "").toUpperCase();

    // Get visitor's real IP
    const forwardedFor = req.headers.get("x-forwarded-for") || "";
    const realIp = req.headers.get("x-real-ip") || "";
    const ip = forwardedFor.split(",")[0].trim() || realIp;

    // If Vercel says FR/GB/DE/US (common misroutes for African mobile carriers),
    // double-check with external geo API
    const SUSPECT_MISROUTES = ["FR", "GB", "DE", "US", "NL", "IE"];
    let finalCountry = primaryCountry;

    if (ip && (!primaryCountry || SUSPECT_MISROUTES.includes(primaryCountry))) {
      const externalCountry = await externalGeo(ip);
      if (externalCountry) {
        // Prefer external result if it maps to a non-USD/EUR currency (specific mapping)
        const externalCurrency = COUNTRY_TO_CURRENCY[externalCountry.toUpperCase()];
        const primaryCurrency = COUNTRY_TO_CURRENCY[primaryCountry] || "USD";
        // If external gives us a more "local" currency (NGN, XOF, GHS, KES, ZAR), use it
        const LOCAL_CURRENCIES = ["NGN", "XOF", "GHS", "KES", "ZAR"];
        if (externalCurrency && LOCAL_CURRENCIES.includes(externalCurrency) && !LOCAL_CURRENCIES.includes(primaryCurrency)) {
          finalCountry = externalCountry.toUpperCase();
        }
      }
    }

    const currency = finalCountry && finalCountry in COUNTRY_TO_CURRENCY
      ? COUNTRY_TO_CURRENCY[finalCountry]
      : "USD";

    return NextResponse.json({
      country: finalCountry,
      currency,
      source: finalCountry === primaryCountry ? "vercel" : "external",
      vercelSaw: primaryCountry,
    });
  } catch {
    return NextResponse.json({ country: "", currency: "USD" });
  }
}