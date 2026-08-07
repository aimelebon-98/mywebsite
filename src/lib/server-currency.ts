import { cookies, headers } from "next/headers";
import { CURRENCIES, COUNTRY_TO_CURRENCY, type CurrencyCode } from "@/lib/currency";

const COOKIE_KEY = "ndz_currency";

// Server-side cache for rates (1 hour) - keeps SSR fast
let cachedRates: Record<string, number> | null = null;
let cachedAt = 0;
const RATES_TTL = 60 * 60 * 1000;

export async function getServerCurrency(): Promise<CurrencyCode> {
  try {
    const store = await cookies();
    const raw = store.get(COOKIE_KEY)?.value;
    if (raw && raw in CURRENCIES) return raw as CurrencyCode;

    const h = await headers();
    const country = h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || "";
    if (country && COUNTRY_TO_CURRENCY[country.toUpperCase()]) {
      return COUNTRY_TO_CURRENCY[country.toUpperCase()];
    }
  } catch { /* ignore */ }
  return "USD";
}

/**
 * Fetch live FX rates server-side so SSR can format prices correctly.
 * Cached in memory for 1 hour.
 * Falls back to hardcoded rates only if the FX API is totally unreachable.
 */
export async function getServerRates(baseUrl?: string): Promise<Record<string, number>> {
  if (cachedRates && Date.now() - cachedAt < RATES_TTL) {
    return cachedRates;
  }

  const SUPPORTED = ["USD", "EUR", "GBP", "NGN", "GHS", "XOF", "KES", "ZAR"];

  try {
    // Direct call to open-source FX API (same source as /api/exchange-rates)
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    if (data.result === "success" && data.rates) {
      const filtered: Record<string, number> = {};
      for (const code of SUPPORTED) {
        if (typeof data.rates[code] === "number") {
          filtered[code] = data.rates[code];
        }
      }
      cachedRates = filtered;
      cachedAt = Date.now();
      return filtered;
    }
  } catch (e) {
    console.warn("SSR rates fetch failed:", e);
  }

  if (cachedRates) return cachedRates; // stale is better than nothing

  // Emergency fallback (should never hit in practice)
  return { USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1500, GHS: 12.5, XOF: 600, KES: 128, ZAR: 18.5 };
}