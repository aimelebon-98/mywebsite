import { NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { eq, and, or, isNull, sql } from "drizzle-orm";

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
};

export async function POST() {
  try {
    // Fetch events with country set but empty city
    const events = await db
      .select()
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.isBot, false),
        sql`country IS NOT NULL AND country != ''`,
        sql`(city IS NULL OR city = '')`
      ))
      .limit(10000);

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
      totalScanned: events.length,
      updated,
      byCountry,
      note: "Filled with country capital as fallback. New visits will get accurate city via ipwho.is."
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}