import { NextRequest, NextResponse } from "next/server";
import { COUNTRY_TO_CURRENCY } from "@/lib/currency";

export async function GET(req: NextRequest) {
  try {
    // Vercel adds country header automatically
    const country = req.headers.get("x-vercel-ip-country") || "";
    let currency = "USD";

    if (country && country in COUNTRY_TO_CURRENCY) {
      currency = COUNTRY_TO_CURRENCY[country];
    }

    return NextResponse.json({ country, currency });
  } catch {
    return NextResponse.json({ country: "", currency: "USD" });
  }
}
