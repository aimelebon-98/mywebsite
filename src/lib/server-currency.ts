import { cookies, headers } from "next/headers";
import { CURRENCIES, COUNTRY_TO_CURRENCY, type CurrencyCode } from "@/lib/currency";

const COOKIE_KEY = "ndz_currency";

let cachedRates: Record<string, number> | null = null;
let cachedAt = 0;
const RATES_TTL = 60 * 60 * 1000;

// Per-IP geo cache to avoid repeated external lookups
const geoCache = new Map<string, { country: string; ts: number }>();
const GEO_TTL = 60 * 60 * 1000;

async function externalGeo(ip: string): Promise<string> {
  if (!ip) return "";
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.ts < GEO_TTL) return cached.country;

  try {
    const r = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    if (r.ok) {
      const j = await r.json();
      if (j.countryCode && typeof j.countryCode === "string") {
        geoCache.set(ip, { country: j.countryCode, ts: Date.now() });
        return j.countryCode;
      }
    }
  } catch { /* ignore */ }
  return "";
}

export async function getServerCurrency(): Promise<CurrencyCode> {
  try {
    // 1. Cookie (user's explicit choice) - highest priority
    const store = await cookies();
    const raw = store.get(COOKIE_KEY)?.value;
    if (raw && raw in CURRENCIES) return raw as CurrencyCode;

    // 2. Geo detection - Vercel header + fallback for African mobile IPs
    const h = await headers();
    const vercelCountry = (h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || "").toUpperCase();
    const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "";

    let finalCountry = vercelCountry;

    // If Vercel says a suspect misroute country, double-check with external geo
    const SUSPECT = ["FR", "GB", "DE", "US", "NL", "IE"];
    if (ip && (!vercelCountry || SUSPECT.includes(vercelCountry))) {
      const external = await externalGeo(ip);
      if (external) {
        const externalCurrency = COUNTRY_TO_CURRENCY[external.toUpperCase()];
        const vercelCurrency = COUNTRY_TO_CURRENCY[vercelCountry] || "USD";
        const LOCAL = ["NGN", "XOF", "GHS", "KES", "ZAR"];
        if (externalCurrency && LOCAL.includes(externalCurrency) && !LOCAL.includes(vercelCurrency)) {
          finalCountry = external.toUpperCase();
        }
      }
    }

    if (finalCountry && COUNTRY_TO_CURRENCY[finalCountry]) {
      return COUNTRY_TO_CURRENCY[finalCountry];
    }
  } catch { /* ignore */ }
  return "USD";
}

export async function getServerRates(baseUrl?: string): Promise<Record<string, number>> {
  if (cachedRates && Date.now() - cachedAt < RATES_TTL) return cachedRates;

  const SUPPORTED = ["USD", "EUR", "GBP", "NGN", "GHS", "XOF", "KES", "ZAR"];
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    if (data.result === "success" && data.rates) {
      const filtered: Record<string, number> = {};
      for (const code of SUPPORTED) {
        if (typeof data.rates[code] === "number") filtered[code] = data.rates[code];
      }
      cachedRates = filtered;
      cachedAt = Date.now();
      return filtered;
    }
  } catch (e) {
    console.warn("SSR rates fetch failed:", e);
  }
  if (cachedRates) return cachedRates;
  return { USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1500, GHS: 12.5, XOF: 600, KES: 128, ZAR: 18.5 };
}