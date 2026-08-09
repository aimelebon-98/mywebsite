import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Convert supplier price in any currency -> NGN using CURRENT live rates
function convertToNgn(amount: number, currency: string, rates: Record<string, number>): number {
  const cur = (currency || "NGN").toUpperCase();
  if (cur === "NGN") return Math.round(amount);
  const supplierRate = rates[cur];
  const ngnRate = rates.NGN;
  if (!supplierRate || !ngnRate) return 0;
  const usd = amount / supplierRate;
  return Math.round(usd * ngnRate);
}

async function fetchRates(): Promise<Record<string, number>> {
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
    const d = await r.json();
    if (d.result === "success" && d.rates) return d.rates;
  } catch { /* ignore */ }
  return {};
}

export async function GET(request: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const url = new URL(request.url);
    const thresholdPct = Number(url.searchParams.get("threshold") || 10);

    const rates = await fetchRates();
    if (!rates.NGN) {
      return NextResponse.json({
        success: false,
        error: "Could not fetch live exchange rates",
      }, { status: 500 });
    }

    const allProducts = await db.select().from(products).where(eq(products.active, true));

    const drifts: Array<{
      id: string;
      slug: string;
      name: string;
      imageUrl: string;
      originCountry: string;
      originCity: string;
      supplierPrice: number;
      supplierCurrency: string;
      snapshotCostNgn: number;
      currentLiveCostNgn: number;
      driftNgn: number;
      driftPct: number;
      direction: "up" | "down" | "same";
    }> = [];

    for (const p of allProducts) {
      const supplierPrice = Number(p.supplierPrice || 0);
      const supplierCurrency = p.supplierCurrency || "NGN";
      const snapshotCostNgn = Number(p.costPrice || 0);

      if (supplierPrice <= 0) continue;

      const currentLive = convertToNgn(supplierPrice, supplierCurrency, rates);
      if (currentLive <= 0) continue;

      const driftNgn = currentLive - snapshotCostNgn;
      const driftPct = snapshotCostNgn > 0 ? (driftNgn / snapshotCostNgn) * 100 : 0;

      if (Math.abs(driftPct) < thresholdPct) continue;

      drifts.push({
        id: p.id,
        slug: p.slug,
        name: p.name,
        imageUrl: p.imageUrl,
        originCountry: p.originCountry || "NG",
        originCity: p.originCity || "",
        supplierPrice,
        supplierCurrency,
        snapshotCostNgn,
        currentLiveCostNgn: currentLive,
        driftNgn,
        driftPct: Math.round(driftPct * 10) / 10,
        direction: driftNgn > 0 ? "up" : (driftNgn < 0 ? "down" : "same"),
      });
    }

    drifts.sort((a, b) => Math.abs(b.driftPct) - Math.abs(a.driftPct));

    return NextResponse.json({
      success: true,
      thresholdPct,
      checkedProducts: allProducts.length,
      driftedProducts: drifts.length,
      liveRates: {
        NGN: rates.NGN,
        XOF: rates.XOF,
        USD: 1,
        EUR: rates.EUR,
        GHS: rates.GHS,
      },
      drifts,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }, { status: 500 });
  }
}

// POST: One-click "fix all" - updates cost_price for drifted products
export async function POST(request: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const body = await request.json().catch(() => ({}));
    const thresholdPct = Number(body.threshold || 10);
    const productIds: string[] = Array.isArray(body.productIds) ? body.productIds : [];

    const rates = await fetchRates();
    if (!rates.NGN) {
      return NextResponse.json({ success: false, error: "Could not fetch rates" }, { status: 500 });
    }

    const allProducts = await db.select().from(products).where(eq(products.active, true));
    const targetProducts = productIds.length > 0
      ? allProducts.filter(p => productIds.includes(p.id))
      : allProducts;

    const updated: Array<{ id: string; name: string; oldCost: number; newCost: number; driftPct: number }> = [];

    for (const p of targetProducts) {
      const supplierPrice = Number(p.supplierPrice || 0);
      const supplierCurrency = p.supplierCurrency || "NGN";
      const snapshotCostNgn = Number(p.costPrice || 0);

      if (supplierPrice <= 0) continue;

      const currentLive = convertToNgn(supplierPrice, supplierCurrency, rates);
      if (currentLive <= 0) continue;

      const driftPct = snapshotCostNgn > 0 ? Math.abs((currentLive - snapshotCostNgn) / snapshotCostNgn) * 100 : 0;

      if (productIds.length > 0 || driftPct >= thresholdPct) {
        await db.update(products).set({
          costPrice: String(currentLive),
          updatedAt: new Date(),
        }).where(eq(products.id, p.id));

        updated.push({
          id: p.id,
          name: p.name,
          oldCost: snapshotCostNgn,
          newCost: currentLive,
          driftPct: Math.round(driftPct * 10) / 10,
        });
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: updated.length,
      updated,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }, { status: 500 });
  }
}