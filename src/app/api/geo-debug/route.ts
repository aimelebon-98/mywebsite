import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
import { COUNTRY_TO_CURRENCY } from "@/lib/currency";

export const dynamic = "force-dynamic";

export async function GET() {
  const h = await headers();
  const store = await cookies();

  const vercelCountry = h.get("x-vercel-ip-country") || null;
  const vercelRegion = h.get("x-vercel-ip-country-region") || null;
  const vercelCity = h.get("x-vercel-ip-city") || null;
  const forwardedFor = h.get("x-forwarded-for") || null;
  const ip = forwardedFor?.split(",")[0].trim() || null;
  const cookieCurrency = store.get("ndz_currency")?.value || null;

  let ipwhoResult: unknown = null;
  if (ip) {
    try {
      const r = await fetch(`https://ipwho.is/${ip}`, { cache: "no-store" });
      ipwhoResult = await r.json();
    } catch (e) {
      ipwhoResult = { error: String(e) };
    }
  }

  const resolvedCountry = vercelCountry?.toUpperCase() || "";
  const resolvedCurrency = COUNTRY_TO_CURRENCY[resolvedCountry] || "USD (fallback)";

  return NextResponse.json({
    detected: {
      cookieCurrency,
      vercelCountry,
      vercelRegion,
      vercelCity,
      ip,
      resolvedCurrency,
    },
    ipwho: ipwhoResult,
    tip: "Clear your 'ndz_currency' cookie to force re-detection",
  }, { headers: { "Cache-Control": "no-store" } });
}