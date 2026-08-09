import { NextRequest, NextResponse } from "next/server";
import { COUNTRY_TO_CURRENCY } from "@/lib/currency";

export const dynamic = "force-dynamic";

// African countries we serve directly. If Vercel returns anything else,
// verify with ipwho.is (Vercel's edge geo often misroutes African mobile traffic
// via random exit nodes: FR, ZA, DE, US, etc.)
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
    const forwardedFor = req.headers.get("x-forwarded-for") || "";
    const ip = forwardedFor.split(",")[0].trim();

    let country = vercelCountry;
    let ipwhoUsed = false;

    // Verify with ipwho.is UNLESS Vercel returned an African country we recognize.
    // Africa detection is where Vercel edge geo fails most often, so we double-check
    // any non-African result.
    if (ip && (!country || !AFRICAN_COUNTRIES.has(country))) {
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