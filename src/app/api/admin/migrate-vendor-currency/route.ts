import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Country -> default currency mapping (matches most-used currency per country)
const COUNTRY_CURRENCY: Record<string, string> = {
  NG: "NGN", GH: "GHS", KE: "KES", ZA: "ZAR", EG: "EGP",
  TG: "XOF", BJ: "XOF", BF: "XOF", CI: "XOF", GW: "XOF", ML: "XOF", NE: "XOF", SN: "XOF",
  CM: "XAF", CD: "CDF", CG: "XAF", GA: "XAF", TD: "XAF", CF: "XAF", GQ: "XAF",
  MA: "MAD", DZ: "DZD", TN: "TND", LY: "LYD",
  ET: "ETB", RW: "RWF", TZ: "TZS", UG: "UGX", BI: "BIF",
  MW: "MWK", MZ: "MZN", ZM: "ZMW", ZW: "USD",
  BW: "BWP", NA: "NAD", LS: "LSL", SZ: "SZL",
  MG: "MGA", MU: "MUR", SC: "SCR",
  AO: "AOA", LR: "LRD", SL: "SLE", GM: "GMD", MR: "MRU",
  FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR", BE: "EUR", NL: "EUR", PT: "EUR", IE: "EUR", GR: "EUR", AT: "EUR", FI: "EUR",
  US: "USD", CA: "CAD", GB: "GBP", CH: "CHF", AU: "AUD",
};

export async function GET() {
  try {
    await db.execute(sql`
      ALTER TABLE "vendors"
      ADD COLUMN IF NOT EXISTS "preferred_currency" text NOT NULL DEFAULT 'USD';
    `);

    // Backfill: set based on country
    let updated = 0;
    for (const [country, currency] of Object.entries(COUNTRY_CURRENCY)) {
      const res = await db.execute(sql`
        UPDATE "vendors"
        SET "preferred_currency" = ${currency}
        WHERE "country" = ${country} AND "preferred_currency" = 'USD';
      `);
      updated += (res as unknown as { rowCount?: number }).rowCount ?? 0;
    }

    return NextResponse.json({ success: true, message: "Added preferred_currency + backfilled", updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}