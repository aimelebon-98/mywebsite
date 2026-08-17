import { NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const COUNTRY_CAPITALS: Record<string, { city: string; region: string }> = {
  NG: { city: "Lagos", region: "Lagos" },
  TG: { city: "Lome", region: "Maritime" },
  GH: { city: "Accra", region: "Greater Accra" },
  KE: { city: "Nairobi", region: "Nairobi" },
  ZA: { city: "Johannesburg", region: "Gauteng" },
  BJ: { city: "Cotonou", region: "Littoral" },
  BF: { city: "Ouagadougou", region: "Centre" },
  CI: { city: "Abidjan", region: "Lagunes" },
  SN: { city: "Dakar", region: "Dakar" },
  CM: { city: "Douala", region: "Littoral" },
  ML: { city: "Bamako", region: "Bamako" },
  NE: { city: "Niamey", region: "Niamey" },
  MA: { city: "Casablanca", region: "Casablanca-Settat" },
  DZ: { city: "Algiers", region: "Algiers" },
  TN: { city: "Tunis", region: "Tunis" },
  EG: { city: "Cairo", region: "Cairo" },
  ET: { city: "Addis Ababa", region: "Addis Ababa" },
  UG: { city: "Kampala", region: "Central" },
  RW: { city: "Kigali", region: "Kigali" },
  TZ: { city: "Dar es Salaam", region: "Dar es Salaam" },
  US: { city: "New York", region: "New York" },
  GB: { city: "London", region: "England" },
  FR: { city: "Paris", region: "Ile-de-France" },
  DE: { city: "Berlin", region: "Berlin" },
  CA: { city: "Toronto", region: "Ontario" },
  BR: { city: "Sao Paulo", region: "Sao Paulo" },
  IN: { city: "Mumbai", region: "Maharashtra" },
  CN: { city: "Beijing", region: "Beijing" },
  AE: { city: "Dubai", region: "Dubai" },
  AU: { city: "Sydney", region: "New South Wales" },
  JP: { city: "Tokyo", region: "Tokyo" },
  RU: { city: "Moscow", region: "Moscow" },
  MX: { city: "Mexico City", region: "CDMX" },
  ES: { city: "Madrid", region: "Madrid" },
  IT: { city: "Rome", region: "Lazio" },
  NL: { city: "Amsterdam", region: "North Holland" },
  PT: { city: "Lisbon", region: "Lisbon" },
  TR: { city: "Istanbul", region: "Istanbul" },
  SA: { city: "Riyadh", region: "Riyadh" },
  IL: { city: "Tel Aviv", region: "Tel Aviv" },
};

export async function GET() {
  // Check status
  try {
    const [totalRow] = await db.select({ c: sql<number>`count(*)` }).from(analyticsEvents).where(eq(analyticsEvents.isBot, false));
    const [withCityRow] = await db.select({ c: sql<number>`count(*)` }).from(analyticsEvents).where(and(eq(analyticsEvents.isBot, false), sql`city IS NOT NULL AND city != ''`));
    const [withCountryNoCityRow] = await db.select({ c: sql<number>`count(*)` }).from(analyticsEvents).where(and(eq(analyticsEvents.isBot, false), sql`country IS NOT NULL AND country != '' AND (city IS NULL OR city = '')`));
    const total = Number(totalRow?.c || 0);
    const withCity = Number(withCityRow?.c || 0);
    const withCountryNoCity = Number(withCountryNoCityRow?.c || 0);
    return NextResponse.json({
      ok: true,
      totalHumanEvents: total,
      withCity,
      withCountryButNoCity: withCountryNoCity,
      completeness: total > 0 ? Math.round((withCity / total) * 100) + "%" : "N/A",
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Auto-fill: any human event with country but no city gets country capital as best-guess
    const events = await db
      .select()
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.isBot, false),
        sql`country IS NOT NULL AND country != ''`,
        sql`(city IS NULL OR city = '')`
      ))
      .limit(50000);

    let updated = 0;
    const byCountry: Record<string, number> = {};

    for (const e of events) {
      const country = (e as unknown as { country?: string }).country;
      if (!country) continue;
      const capital = COUNTRY_CAPITALS[country];
      if (!capital) continue;

      await db
        .update(analyticsEvents)
        .set({ city: capital.city, region: capital.region })
        .where(eq(analyticsEvents.id, e.id));

      byCountry[country] = (byCountry[country] || 0) + 1;
      updated++;
    }

    return NextResponse.json({
      ok: true,
      scanned: events.length,
      updated,
      byCountry,
      note: "Old events enriched with country-capital fallback. NEW visits use real ipwho.is/ipapi lookups."
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}