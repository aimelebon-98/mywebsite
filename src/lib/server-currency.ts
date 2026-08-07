import { cookies, headers } from "next/headers";
import { CURRENCIES, COUNTRY_TO_CURRENCY, type CurrencyCode } from "@/lib/currency";

const COOKIE_KEY = "ndz_currency";

export async function getServerCurrency(): Promise<CurrencyCode> {
  try {
    const store = await cookies();
    const cookieVal = store.get(COOKIE_KEY)?.value;
    if (cookieVal && cookieVal in CURRENCIES) return cookieVal as CurrencyCode;

    const h = await headers();
    const vercelCountry = (h.get("x-vercel-ip-country") || "").toUpperCase();
    const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim();

    let country = vercelCountry;

    if (ip && (vercelCountry === "FR" || !vercelCountry)) {
      try {
        const r = await fetch(`https://ipwho.is/${ip}?fields=country_code`, { next: { revalidate: 3600 } });
        const data = await r.json();
        if (data.country_code) country = data.country_code.toUpperCase();
      } catch { /* ignore */ }
    }

    if (country && COUNTRY_TO_CURRENCY[country]) return COUNTRY_TO_CURRENCY[country];
  } catch { /* ignore */ }
  return "USD";
}

export async function getServerRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.result === "success" && data.rates) return data.rates;
  } catch { /* ignore */ }
  return { USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1500, GHS: 12.5, XOF: 600, KES: 128, ZAR: 18.5 };
}