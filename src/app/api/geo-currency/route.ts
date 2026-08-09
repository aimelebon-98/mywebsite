import { NextRequest, NextResponse } from "next/server";
import { COUNTRY_TO_CURRENCY } from "@/lib/currency";

export const dynamic = "force-dynamic";

// Extract the REAL client IP from proxy chain headers.
// Priority: Cloudflare -> Vercel real-ip -> last x-forwarded-for -> first.
function getRealClientIp(req: NextRequest): string {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();

  const xff = req.headers.get("x-forwarded-for") || "";
  const chain = xff.split(",").map(s => s.trim()).filter(Boolean);
  // In a Cloudflare -> Vercel chain, real client is often the FIRST public IP,
  // but Vercel adds its own edge IP too. Take the first NON-private IP.
  for (const ip of chain) {
    if (!isPrivateIp(ip)) return ip;
  }
  return chain[0] || "";
}

function isPrivateIp(ip: string): boolean {
  // Skip common Cloudflare, private, and CDN ranges
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("172.16.") || ip.startsWith("172.17.") || ip.startsWith("172.18.") || ip.startsWith("172.19.") || ip.startsWith("172.2") || ip.startsWith("172.30.") || ip.startsWith("172.31.")) return true;
  if (ip === "::1" || ip === "127.0.0.1") return true;
  // Cloudflare IPv4 ranges (partial - only most common)
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

const AFRICAN_COUNTRIES = new Set([
  "NG", "GH", "KE", "ZA",
  "BJ", "BF", "CI", "GW", "ML", "NE", "SN", "TG",
  "CM", "CD", "CG", "GA", "TD", "CF", "GQ",
  "MA", "DZ", "TN", "LY", "EG", "SD", "SS", "ET", "SO", "DJ", "ER",
  "UG", "RW", "BI", "TZ", "MW", "MZ", "ZM", "ZW", "BW", "NA", "LS", "SZ", "MG", "MU", "SC", "KM",
  "AO", "LR", "SL", "GM", "MR",
]);

export async function GET(req: NextRequest) {
  try {
    const vercelCountry = (req.headers.get("x-vercel-ip-country") || "").toUpperCase();
    const cfCountry = (req.headers.get("cf-ipcountry") || "").toUpperCase();
    const ip = getRealClientIp(req);

    // Prefer Cloudflare's country header when present (it uses real client IP)
    let country = cfCountry || vercelCountry;
    let source = cfCountry ? "cf-ipcountry" : "vercel";
    let ipwhoUsed = false;

    // If still non-African (or empty), verify with ipwho.is using the REAL client IP
    if (ip && (!country || !AFRICAN_COUNTRIES.has(country))) {
      try {
        const r = await fetch(`https://ipwho.is/${ip}?fields=country_code,success`, {
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(3000),
        });
        const data = await r.json();
        if (data.success && data.country_code) {
          country = data.country_code.toUpperCase();
          source = "ipwho";
          ipwhoUsed = true;
        }
      } catch { /* ignore */ }
    }

    const currency = (country in COUNTRY_TO_CURRENCY) ? COUNTRY_TO_CURRENCY[country] : "USD";
    return NextResponse.json({
      country,
      currency,
      ip,
      vercelSaw: vercelCountry,
      cfSaw: cfCountry,
      source,
      ipwhoUsed,
    });
  } catch (e) {
    return NextResponse.json({ country: "US", currency: "USD", error: String(e) });
  }
}