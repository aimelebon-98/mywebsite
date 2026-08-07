import { NextRequest, NextResponse } from "next/server";
import { COUNTRY_TO_CURRENCY } from "@/lib/currency";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const vercelCountry = (req.headers.get("x-vercel-ip-country") || "").toUpperCase();
    const forwardedFor = req.headers.get("x-forwarded-for") || "";
    const ip = forwardedFor.split(",")[0].trim();

    let country = vercelCountry;

    // Force check for Togo Mobile IPs misrouted to FR
    if (ip && (vercelCountry === "FR" || !vercelCountry)) {
      try {
        const r = await fetch(`https://ipwho.is/${ip}?fields=country_code`, {
          next: { revalidate: 3600 }
        });
        const data = await r.json();
        if (data.country_code) country = data.country_code.toUpperCase();
      } catch { /* ignore */ }
    }

    const currency = (country in COUNTRY_TO_CURRENCY) ? COUNTRY_TO_CURRENCY[country] : "USD";
    return NextResponse.json({ country, currency, ip, vercelSaw: vercelCountry });
  } catch {
    return NextResponse.json({ country: "US", currency: "USD" });
  }
}