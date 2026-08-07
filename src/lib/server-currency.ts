import { cookies, headers } from "next/headers";
import { CURRENCIES, COUNTRY_TO_CURRENCY, type CurrencyCode } from "@/lib/currency";

const COOKIE_KEY = "ndz_currency";

/**
 * Read currency from cookie (set by CurrencyProvider on client).
 * Falls back to geo-detection via Vercel headers if no cookie.
 * Falls back to USD otherwise.
 *
 * Call from ANY server component or layout.
 */
export async function getServerCurrency(): Promise<CurrencyCode> {
  try {
    const store = await cookies();
    const raw = store.get(COOKIE_KEY)?.value;
    if (raw && raw in CURRENCIES) return raw as CurrencyCode;

    // No cookie yet - try geo header (Vercel provides x-vercel-ip-country)
    const h = await headers();
    const country = h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || "";
    if (country && COUNTRY_TO_CURRENCY[country.toUpperCase()]) {
      return COUNTRY_TO_CURRENCY[country.toUpperCase()];
    }
  } catch {
    // ignore - headers/cookies may not be available in some contexts
  }
  return "USD";
}