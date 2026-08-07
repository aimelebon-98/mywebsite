import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { gte } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// ============================================
// Live USD -> NGN rate (cached 1h) - only used to convert stored NGN cost -> USD
// All numbers returned to client are USD; client re-converts using live rates in useCurrency.
// ============================================
let cachedRate: number | null = null;
let cachedAt = 0;
const RATE_TTL = 60 * 60 * 1000;

async function getUsdToNgn(baseUrl: string): Promise<number> {
  if (cachedRate && Date.now() - cachedAt < RATE_TTL) return cachedRate;
  try {
    const res = await fetch(`${baseUrl}/api/exchange-rates`, { cache: "no-store" });
    const data = await res.json();
    const ngn = data?.rates?.NGN;
    if (typeof ngn === "number" && ngn > 0) {
      cachedRate = ngn;
      cachedAt = Date.now();
      return ngn;
    }
  } catch (e) {
    console.warn("Failed to fetch live NGN rate:", e);
  }
  if (cachedRate) return cachedRate;
  return 1500;
}

interface OrderItem {
  id?: string;
  productId?: string;
  name?: string;
  price?: number;      // USD
  quantity?: number;
  costPriceNgn?: number; // NGN snapshot
}

interface Metric {
  ordersCount: number;
  units: number;
  revenueUsd: number;
  costUsd: number;
  profitUsd: number;
  marginPct: number;
}

function emptyMetric(): Metric {
  return { ordersCount: 0, units: 0, revenueUsd: 0, costUsd: 0, profitUsd: 0, marginPct: 0 };
}

function computePeriod(
  rows: Array<{ items: string; createdAt: Date }>,
  costLookupNgn: Map<string, number>,
  ngnToUsd: number
): Metric {
  const m = emptyMetric();
  for (const r of rows) {
    m.ordersCount += 1;
    let items: OrderItem[] = [];
    try { items = JSON.parse(r.items || "[]"); } catch { /* skip */ }
    for (const it of items) {
      const qty = Number(it.quantity || 1);
      m.units += qty;
      // Revenue: item's stored USD price
      m.revenueUsd += Number(it.price || 0) * qty;
      // Cost: prefer snapshot; fallback to current product cost. Both in NGN. Convert to USD.
      let costNgn = Number(it.costPriceNgn || 0);
      if (!costNgn && it.id && costLookupNgn.has(String(it.id))) {
        costNgn = costLookupNgn.get(String(it.id)) || 0;
      }
      m.costUsd += costNgn * ngnToUsd * qty;
    }
  }
  m.profitUsd = m.revenueUsd - m.costUsd;
  m.marginPct = m.revenueUsd > 0 ? (m.profitUsd / m.revenueUsd) * 100 : 0;
  return m;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export async function GET(request: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    const usdToNgn = await getUsdToNgn(baseUrl);
    const ngnToUsd = 1 / usdToNgn;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
    const startOfThisWeek = new Date(startOfToday.getTime() - (dayOfWeek - 1) * 24 * 60 * 60 * 1000);
    const startOfLastWeek = new Date(startOfThisWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const oldestNeeded = new Date(Math.min(startOfLastMonth.getTime(), startOfLastWeek.getTime()));

    const allRows = await db.select({
      items: orders.items,
      createdAt: orders.createdAt,
      status: orders.status,
    }).from(orders).where(gte(orders.createdAt, oldestNeeded));

    const validRows = allRows.filter(r => r.status !== "cancelled");

    const prodRows = await db.select({ id: products.id, costPrice: products.costPrice, name: products.name, imageUrl: products.imageUrl }).from(products);
    const costLookupNgn = new Map<string, number>();
    const productMeta = new Map<string, { name: string; imageUrl: string; costNgn: number }>();
    for (const p of prodRows) {
      const c = parseFloat(p.costPrice || "0");
      costLookupNgn.set(p.id, c);
      productMeta.set(p.id, { name: p.name, imageUrl: p.imageUrl, costNgn: c });
    }

    const inRange = (d: Date, start: Date, end: Date) => d >= start && d < end;

    const today = computePeriod(validRows.filter(r => inRange(r.createdAt, startOfToday, now)), costLookupNgn, ngnToUsd);
    const yesterday = computePeriod(validRows.filter(r => inRange(r.createdAt, startOfYesterday, startOfToday)), costLookupNgn, ngnToUsd);
    const thisWeek = computePeriod(validRows.filter(r => inRange(r.createdAt, startOfThisWeek, now)), costLookupNgn, ngnToUsd);
    const lastWeek = computePeriod(validRows.filter(r => inRange(r.createdAt, startOfLastWeek, startOfThisWeek)), costLookupNgn, ngnToUsd);
    const thisMonth = computePeriod(validRows.filter(r => inRange(r.createdAt, startOfThisMonth, now)), costLookupNgn, ngnToUsd);
    const lastMonth = computePeriod(validRows.filter(r => inRange(r.createdAt, startOfLastMonth, startOfThisMonth)), costLookupNgn, ngnToUsd);

    const productSales = new Map<string, { units: number; revenueUsd: number; profitUsd: number; name: string; imageUrl: string }>();
    for (const r of validRows.filter(r => inRange(r.createdAt, startOfThisMonth, now))) {
      let items: OrderItem[] = [];
      try { items = JSON.parse(r.items || "[]"); } catch { continue; }
      for (const it of items) {
        const pid = String(it.id || it.productId || "");
        if (!pid) continue;
        const meta = productMeta.get(pid);
        const qty = Number(it.quantity || 1);
        const revUsd = Number(it.price || 0) * qty;
        const costUsd = (Number(it.costPriceNgn) || meta?.costNgn || 0) * ngnToUsd * qty;
        const existing = productSales.get(pid) || { units: 0, revenueUsd: 0, profitUsd: 0, name: meta?.name || (it.name || "Unknown"), imageUrl: meta?.imageUrl || "" };
        existing.units += qty;
        existing.revenueUsd += revUsd;
        existing.profitUsd += revUsd - costUsd;
        productSales.set(pid, existing);
      }
    }
    const topSellers = [...productSales.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
    const topMargins = [...productSales.entries()]
      .map(([id, v]) => ({ id, ...v, marginPct: v.revenueUsd > 0 ? (v.profitUsd / v.revenueUsd) * 100 : 0 }))
      .filter(v => v.revenueUsd > 0)
      .sort((a, b) => b.marginPct - a.marginPct)
      .slice(0, 5);

    const daily: Array<{ date: string; revenueUsd: number; profitUsd: number; orders: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const m = computePeriod(validRows.filter(r => inRange(r.createdAt, dayStart, dayEnd)), costLookupNgn, ngnToUsd);
      daily.push({
        date: dayStart.toISOString().slice(0, 10),
        revenueUsd: m.revenueUsd,
        profitUsd: m.profitUsd,
        orders: m.ordersCount,
      });
    }

    return NextResponse.json({
      usdToNgn,
      rateSource: "live (open.er-api.com, cached 1h)",
      periods: {
        today: { ...today, vsPrev: {
          orders: pctChange(today.ordersCount, yesterday.ordersCount),
          units: pctChange(today.units, yesterday.units),
          revenue: pctChange(today.revenueUsd, yesterday.revenueUsd),
          profit: pctChange(today.profitUsd, yesterday.profitUsd),
        } },
        yesterday,
        thisWeek: { ...thisWeek, vsPrev: {
          orders: pctChange(thisWeek.ordersCount, lastWeek.ordersCount),
          units: pctChange(thisWeek.units, lastWeek.units),
          revenue: pctChange(thisWeek.revenueUsd, lastWeek.revenueUsd),
          profit: pctChange(thisWeek.profitUsd, lastWeek.profitUsd),
        } },
        lastWeek,
        thisMonth: { ...thisMonth, vsPrev: {
          orders: pctChange(thisMonth.ordersCount, lastMonth.ordersCount),
          units: pctChange(thisMonth.units, lastMonth.units),
          revenue: pctChange(thisMonth.revenueUsd, lastMonth.revenueUsd),
          profit: pctChange(thisMonth.profitUsd, lastMonth.profitUsd),
        } },
        lastMonth,
      },
      topSellers,
      topMargins,
      daily,
    });
  } catch (error) {
    console.error("Profit analytics error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}