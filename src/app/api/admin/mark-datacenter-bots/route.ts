import { requireAdmin } from "@/lib/admin-auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Known datacenter cities that ARE NOT legitimate residential locations for African e-commerce
// (These are cities that only appear as bot origins for our audience)
const DATACENTER_CITIES: Record<string, string[]> = {
  US: ["Ashburn", "Boydton", "Council Bluffs", "The Dalles", "Crooked River", "Kane", "Prineville", "Cheyenne", "Quincy", "Papillion", "Moncks Corner", "Berkeley County", "New Albany", "Reston", "Sterling", "Chantilly", "Hillsboro", "Boardman", "San Jose", "Mountain View", "Menlo Park", "Palo Alto", "North Bergen", "Piscataway", "Secaucus", "Weehawken"],
  SE: ["Lulea", "Luleaa"],
  IE: ["Dublin"],
  NL: ["Amsterdam", "Groningen", "Middenmeer"],
  DE: ["Frankfurt", "Nuremberg"],
  SG: ["Singapore"],
  JP: ["Osaka", "Tokyo"],
  BR: ["Sao Paulo"],
  AU: ["Sydney", "Melbourne"],
  IN: ["Mumbai", "Hyderabad", "Chennai"],
  CA: ["Montreal", "Toronto"],
  GB: ["London", "Slough"],
  KR: ["Seoul"],
  FI: ["Helsinki", "Hamina"],
};

export async function POST() {
  const authErr = await requireAdmin(); if (authErr) return authErr;
  try {
    const events = await db
      .select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.isBot, false))
      .limit(50000);

    let marked = 0;
    const byLocation: Record<string, number> = {};

    for (const e of events) {
      const ev = e as unknown as { country?: string; city?: string };
      const country = ev.country;
      const city = ev.city;
      if (!country || !city) continue;

      const knownDcCities = DATACENTER_CITIES[country];
      if (knownDcCities && knownDcCities.some(dc => city.toLowerCase() === dc.toLowerCase())) {
        await db.update(analyticsEvents).set({ isBot: true }).where(eq(analyticsEvents.id, e.id));
        const key = `${city}, ${country}`;
        byLocation[key] = (byLocation[key] || 0) + 1;
        marked++;
      }
    }

    return NextResponse.json({
      ok: true,
      scanned: events.length,
      markedAsDatacenterBot: marked,
      byLocation,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
