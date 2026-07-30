import { NextResponse } from "next/server";

// Simple in-memory cache
let cachedRates: Record<string, number> | null = null;
let cacheTime = 0;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

const SUPPORTED = ["USD", "EUR", "GBP", "NGN", "GHS", "XOF", "KES", "ZAR"];

export async function GET() {
  // Return cached if fresh
  if (cachedRates && Date.now() - cacheTime < CACHE_TTL) {
    return NextResponse.json({ rates: cachedRates, cached: true });
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 43200 }, // 12h
    });
    const data = await res.json();

    if (data.result === "success" && data.rates) {
      const filtered: Record<string, number> = {};
      for (const code of SUPPORTED) {
        if (typeof data.rates[code] === "number") {
          filtered[code] = data.rates[code];
        }
      }
      cachedRates = filtered;
      cacheTime = Date.now();
      return NextResponse.json({ rates: filtered, cached: false, timestamp: data.time_last_update_unix });
    }

    // Fallback rates (approx as of 2024) if API fails
    const fallback = {
      USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1500, GHS: 12.5, XOF: 600, KES: 128, ZAR: 18.5,
    };
    return NextResponse.json({ rates: fallback, fallback: true });
  } catch {
    const fallback = {
      USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1500, GHS: 12.5, XOF: 600, KES: 128, ZAR: 18.5,
    };
    return NextResponse.json({ rates: fallback, fallback: true });
  }
}
