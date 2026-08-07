import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getServerCurrency } from "@/lib/server-currency";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await cookies();
  const h = await headers();

  return NextResponse.json({
    detectedCurrency: await getServerCurrency(),
    cookies: {
      ndz_currency: store.get("ndz_currency")?.value || null,
      all: store.getAll().map(c => ({ name: c.name, value: c.value })),
    },
    geoHeaders: {
      "x-vercel-ip-country": h.get("x-vercel-ip-country") || null,
      "cf-ipcountry": h.get("cf-ipcountry") || null,
      "x-forwarded-for": h.get("x-forwarded-for") || null,
    },
  });
}