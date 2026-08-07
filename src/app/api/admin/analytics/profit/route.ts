import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { gte } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// ============================================
// Live USD -> NGN rate (cached 1h)
// Uses the same source as the storefront currency switcher
// ============================================
let cachedRate: number | null = null;
let cachedAt = 0;
const RATE_TTL = 60 * 60 * 1000; // 1 hour

async function getUsdToNgn(baseUrl: string): Promise<number> {
  if (cachedRate && Date.now() - cachedAt < RATE_TTL) {
    return cachedRate;
  }
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
  // Emergency last-resort fallback if the rates endpoint itself is down
  if (cachedRate) return cachedRate; // stale cache is better than nothing
  return 1500;
}

interface OrderItem {
  id?: string;
  productId?: string;
  name?: string;
  price?: number;
  quantity?: number;
  costPriceNgn?: number;
}

interface Metric {
  orders: number;
  units: number;
  revenueNgn: number;
  costNgn: number;
  profitNgn: number;
  marginPct: number;
}

function emptyMetric(): Metric {
  return { orders: 0, units: 0, revenueNgn: 0, costNgn: 0, profitNgn: 0, marginPct: 0 };
}

function computePeriod(
  rows: Array<{ items: string; total: string; createdAt: Date }>,
  costLookup: Map<string, number>,
  usdToNgn: number
): Metric {
  const m = emptyMetric();
  for (const r of rows) {
    m.orders += 1;
    let items: OrderItem[] = [];
    try { items = JSON.parse(r.items || "[]"); } catch { /* skip */ }
    let orderRevenueNgn = 0;
    let orderCostNgn = 0;
    for (const it of items) {
      const qty = Number(it.quantity || 1);
      m.units += qty;
      const priceUsd = Number(it.price || 0);
      orderRevenueNgn += priceUsd * usdToNgn * qty;
      let costNgn = Number(it.costPriceNgn || 0);
      if (!costNgn && it.id && costLookup.has(String(it.id))) {
        costNgn = costLookup.get(String(it.id)) || 0;
      }
      orderCostNgn += costNgn * qty;
    }
    m.revenueNgn += orderRevenueNgn;
    m.costNgn += orderCostNgn;
  }
  m.profitNgn = m.revenueNgn - m.costNgn;
  m.marginPct = m.revenueNgn > 0 ? (m.profitNgn / m.revenueNgn) * 100 : 0;
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
    // Derive base URL from the incoming request (works in dev, preview, prod)
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    const usdToNgn = await getUsdToNgn(baseUrl);
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
      total: orders.total,
      createdAt: orders.createdAt,
      status: orders.status,
    }).from(orders).where(gte(orders.createdAt, oldestNeeded));

    const validRows = allRows.filter(r => r.status !== "cancelled");

    const prodRows = await db.select({ id: products.id, costPrice: products.costPrice, name: products.name, imageUrl: products.imageUrl }).from(products);
    const costLookup = new Map<string, number>();
    const productMeta = new Map<string, { name: string; imageUrl: string; costNgn: number }>();
    for (const p of prodRows) {
      const c = parseFloat(p.costPrice || "0");
      costLookup.set(p.id, c);
      productMeta.set(p.id, { name: p.name, imageUrl: p.imageUrl, costNgn: c });
    }

    const inRange = (d: Date, start: Date, end: Date) => d >= start && d < end;

    const today = computePeriod(validRows.filter(r => inRange(r.createdAt, startOfToday, now)), costLookup, usdToNgn);
    const yesterday = computePeriod(validRows.filter(r => inRange(r.createdAt, startOfYesterday, startOfToday)), costLookup, usdToNgn);
    const thisWeek = computePeriod(validRows.filter(r => inRange(r.createdAt, startOfThisWeek, now)), costLookup, usdToNgn);
    const lastWeek = computePeriod(validRows.filter(r => inRange(r.createdAt, startOfLastWeek, startOfThisWeek)), costLookup, usdToNgn);
    const thisMonth = computePeriod(validRows.filter(r => inRange(r.createdAt, startOfThisMonth, now)), costLookup, usdToNgn);
    const lastMonth = computePeriod(validRows.filter(r => inRange(r.createdAt, startOfLastMonth, startOfThisMonth)), costLookup, usdToNgn);

    const productSales = new Map<string, { units: number; revenueNgn: number; profitNgn: number; name: string; imageUrl: string }>();
    for (const r of validRows.filter(r => inRange(r.createdAt, startOfThisMonth, now))) {
      let items: OrderItem[] = [];
      try { items = JSON.parse(r.items || "[]"); } catch { continue; }
      for (const it of items) {
        const pid = String(it.id || it.productId || "");
        if (!pid) continue;
        const meta = productMeta.get(pid);
        const qty = Number(it.quantity || 1);
        const revNgn = Number(it.price || 0) * usdToNgn * qty;
        const costNgn = (Number(it.costPriceNgn) || meta?.costNgn || 0) * qty;
        const existing = productSales.get(pid) || { units: 0, revenueNgn: 0, profitNgn: 0, name: meta?.name || (it.name || "Unknown"), imageUrl: meta?.imageUrl || "" };
        existing.units += qty;
        existing.revenueNgn += revNgn;
        existing.profitNgn += revNgn - costNgn;
        productSales.set(pid, existing);
      }
    }
    const topSellers = [...productSales.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
    const topMargins = [...productSales.entries()]
      .map(([id, v]) => ({ id, ...v, marginPct: v.revenueNgn > 0 ? (v.profitNgn / v.revenueNgn) * 100 : 0 }))
      .filter(v => v.revenueNgn > 0)
      .sort((a, b) => b.marginPct - a.marginPct)
      .slice(0, 5);

    const daily: Array<{ date: string; revenueNgn: number; profitNgn: number; orders: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const m = computePeriod(validRows.filter(r => inRange(r.createdAt, dayStart, dayEnd)), costLookup, usdToNgn);
      daily.push({
        date: dayStart.toISOString().slice(0, 10),
        revenueNgn: m.revenueNgn,
        profitNgn: m.profitNgn,
        orders: m.orders,
      });
    }

    return NextResponse.json({
      usdToNgn,
      rateSource: "live (open.er-api.com, cached 1h)",
      periods: {
        today: { ...today, vsPrev: {
          orders: pctChange(today.orders, yesterday.orders),
          units: pctChange(today.units, yesterday.units),
          revenue: pctChange(today.revenueNgn, yesterday.revenueNgn),
          profit: pctChange(today.profitNgn, yesterday.profitNgn),
        } },
        yesterday,
        thisWeek: { ...thisWeek, vsPrev: {
          orders: pctChange(thisWeek.orders, lastWeek.orders),
          units: pctChange(thisWeek.units, lastWeek.units),
          revenue: pctChange(thisWeek.revenueNgn, lastWeek.revenueNgn),
          profit: pctChange(thisWeek.profitNgn, lastWeek.profitNgn),
        } },
        lastWeek,
        thisMonth: { ...thisMonth, vsPrev: {
          orders: pctChange(thisMonth.orders, lastMonth.orders),
          units: pctChange(thisMonth.units, lastMonth.units),
          revenue: pctChange(thisMonth.revenueNgn, lastMonth.revenueNgn),
          profit: pctChange(thisMonth.profitNgn, lastMonth.profitNgn),
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