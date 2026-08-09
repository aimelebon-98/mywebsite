import { cookies, headers } from "next/headers";
import { CURRENCIES, COUNTRY_TO_CURRENCY, type CurrencyCode } from "@/lib/currency";

const COOKIE_KEY = "ndz_currency";

const AFRICAN_COUNTRIES = new Set([
  "NG", "GH", "KE", "ZA",
  "BJ", "BF", "CI", "GW", "ML", "NE", "SN", "TG",
  "CM", "CD", "CG", "GA", "TD", "CF", "GQ",
  "MA", "DZ", "TN", "LY", "EG", "SD", "SS", "ET", "SO", "DJ", "ER",
  "UG", "RW", "BI", "TZ", "MW", "MZ", "ZM", "ZW", "BW", "NA", "LS", "SZ", "MG", "MU", "SC", "KM",
  "AO", "LR", "SL", "GM", "MR",
]);

function isPrivateOrCloudflareIp(ip: string): boolean {
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip === "::1" || ip === "127.0.0.1") return true;
  if (ip.startsWith("172.16.") || ip.startsWith("172.17.") || ip.startsWith("172.18.") ||
      ip.startsWith("172.19.") || ip.startsWith("172.2") || ip.startsWith("172.30.") || ip.startsWith("172.31.")) return true;
  if (ip.startsWith("104.16.") || ip.startsWith("104.17.") || ip.startsWith("104.18.") ||
      ip.startsWith("104.19.") || ip.startsWith("104.20.") || ip.startsWith("104.21.") ||
      ip.startsWith("104.22.") || ip.startsWith("104.23.") || ip.startsWith("104.24.") ||
      ip.startsWith("104.25.") || ip.startsWith("104.26.") || ip.startsWith("104.27.") ||
      ip.startsWith("104.28.") || ip.startsWith("172.64.") || ip.startsWith("172.65.") ||
      ip.startsWith("172.66.") || ip.startsWith("172.67.") || ip.startsWith("172.68.") ||
      ip.startsWith("172.69.") || ip.startsWith("172.70.") || ip.startsWith("172.71.") ||
      ip.startsWith("162.158.") || ip.startsWith("108.162.") || ip.startsWith("173.245.")) return true;
  return false;
}

function getRealClientIpFromHeaders(h: Headers): string {
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  const xff = h.get("x-forwarded-for") || "";
  const chain = xff.split(",").map(s => s.trim()).filter(Boolean);
  for (const ip of chain) if (!isPrivateOrCloudflareIp(ip)) return ip;
  return chain[0] || "";
}

export async function getServerCurrency(): Promise<CurrencyCode> {
  try {
    const store = await cookies();
    const cookieVal = store.get(COOKIE_KEY)?.value;
    if (cookieVal && cookieVal in CURRENCIES) return cookieVal as CurrencyCode;

    const h = await headers();
    const vercelCountry = (h.get("x-vercel-ip-country") || "").toUpperCase();
    const cfCountry = (h.get("cf-ipcountry") || "").toUpperCase();
    const ip = getRealClientIpFromHeaders(h as unknown as Headers);

    let country = cfCountry || vercelCountry;

    if (ip && (!country || !AFRICAN_COUNTRIES.has(country))) {
      try {
        const r = await fetch(`https://ipwho.is/${ip}?fields=country_code,success`, {
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(3000),
        });
        const data = await r.json();
        if (data.success && data.country_code) country = data.country_code.toUpperCase();
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

export async function getServerCountry(): Promise<string> {
  try {
    const h = await headers();
    const cfCountry = (h.get("cf-ipcountry") || "").toUpperCase();
    const vercelCountry = (h.get("x-vercel-ip-country") || "").toUpperCase();
    const ip = getRealClientIpFromHeaders(h as unknown as Headers);

    let country = cfCountry || vercelCountry;

    if (ip && (!country || !AFRICAN_COUNTRIES.has(country))) {
      try {
        const r = await fetch(`https://ipwho.is/${ip}?fields=country_code,success`, {
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(3000),
        });
        const data = await r.json();
        if (data.success && data.country_code) country = data.country_code.toUpperCase();
      } catch { /* ignore */ }
    }

    return country || "";
  } catch {
    return "";
  }
}
