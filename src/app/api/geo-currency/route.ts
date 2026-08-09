import { NextRequest, NextResponse } from "next/server";
import { COUNTRY_TO_CURRENCY } from "@/lib/currency";

export const dynamic = "force-dynamic";

// EU/US/proxy-prone countries that commonly misroute African mobile traffic.
const VERIFY_COUNTRIES = new Set([
  "FR", "DE", "IT", "ES", "BE", "NL", "GB", "IE", "PT", "AT",
  "CH", "SE", "NO", "DK", "FI", "PL", "GR", "CY", "LU", "MT",
  "US", "CA", "RO", "CZ", "HU",
]);

export async function GET(req: NextRequest) {
  try {
    const vercelCountry = (req.headers.get("x-vercel-ip-country") || "").toUpperCase();
    const forwardedFor = req.headers.get("x-forwarded-for") || "";
    const ip = forwardedFor.split(",")[0].trim();

    let country = vercelCountry;
    let ipwhoUsed = false;

    if (ip && (!country || VERIFY_COUNTRIES.has(country))) {
      try {
        const r = await fetch(`https://ipwho.is/${ip}?fields=country_code,success`, {
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(3000),
        });
        const data = await r.json();
        if (data.success && data.country_code) {
          country = data.country_code.toUpperCase();
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
      ipwhoUsed,
    });
  } catch {
    return NextResponse.json({ country: "US", currency: "USD" });
  }
}