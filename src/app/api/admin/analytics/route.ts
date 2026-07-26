import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { and, gte, lt, desc } from "drizzle-orm";

type EventRow = typeof analyticsEvents.$inferSelect;

function computeKpis(events: EventRow[]) {
  return {
    uniqueVisitors: new Set(events.map(e => e.visitorId)).size,
    pageViews: events.filter(e => e.eventType === "page_view").length,
    productViews: events.filter(e => e.eventType === "product_view").length,
    addToCarts: events.filter(e => e.eventType === "add_to_cart").length,
    checkoutClicks: events.filter(e => e.eventType === "checkout_click").length,
    wishlistAdds: events.filter(e => e.eventType === "wishlist_add").length,
    newsletterSignups: events.filter(e => e.eventType === "newsletter_signup").length,
    searches: events.filter(e => e.eventType === "search").length,
    blogViews: events.filter(e => e.eventType === "blog_view").length,
    totalEvents: events.length,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7");
  const live = searchParams.get("live");
  if (live === "1") {
    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const active = await db
        .select()
        .from(analyticsEvents)
        .where(gte(analyticsEvents.createdAt, fiveMinAgo));
      const activeVisitors = new Set(active.map(e => e.visitorId)).size;

      const recent = await db
        .select()
        .from(analyticsEvents)
        .orderBy(desc(analyticsEvents.createdAt))
        .limit(15);

      return NextResponse.json({
        ok: true,
        live: true,
        activeVisitors,
        recentEvents: recent.map(e => ({
          eventType: e.eventType,
          path: e.path,
          productName: e.productName,
          searchQuery: e.searchQuery,
          createdAt: e.createdAt,
          visitorId: e.visitorId.slice(0, 10),
        })),
      });
    } catch (error) {
      return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
    }
  }


  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - days);
  currentStart.setHours(0, 0, 0, 0);

  const previousStart = new Date(currentStart);
  previousStart.setDate(previousStart.getDate() - days);

  try {
    // Fetch current period
    const current = await db
      .select()
      .from(analyticsEvents)
      .where(and(gte(analyticsEvents.createdAt, currentStart)))
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(50000);

    // Fetch previous period (same length window)
    const previous = await db
      .select()
      .from(analyticsEvents)
      .where(and(
        gte(analyticsEvents.createdAt, previousStart),
        lt(analyticsEvents.createdAt, currentStart)
      ))
      .limit(50000);

    const kpis = computeKpis(current);
    const previousKpis = computeKpis(previous);

    // Timeline
    const timeline: Record<string, { visits: number; carts: number; checkouts: number }> = {};
    current.forEach(e => {
      const day = e.createdAt.toISOString().slice(0, 10);
      if (!timeline[day]) timeline[day] = { visits: 0, carts: 0, checkouts: 0 };
      if (e.eventType === "page_view") timeline[day].visits++;
      if (e.eventType === "add_to_cart") timeline[day].carts++;
      if (e.eventType === "checkout_click") timeline[day].checkouts++;
    });

    // Top products
    const productMap: Record<string, { name: string; views: number; carts: number; checkouts: number }> = {};
    current.forEach(e => {
      if (!e.productId || !e.productName) return;
      if (!productMap[e.productId]) productMap[e.productId] = { name: e.productName, views: 0, carts: 0, checkouts: 0 };
      if (e.eventType === "product_view") productMap[e.productId].views++;
      if (e.eventType === "add_to_cart") productMap[e.productId].carts++;
      if (e.eventType === "checkout_click") productMap[e.productId].checkouts++;
    });
    const topProducts = Object.entries(productMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (b.views + b.carts * 3 + b.checkouts * 10) - (a.views + a.carts * 3 + a.checkouts * 10))
      .slice(0, 10);

    // Top blog posts
    const postMap: Record<string, { name: string; views: number }> = {};
    current.forEach(e => {
      if (e.eventType !== "blog_view" || !e.postId) return;
      if (!postMap[e.postId]) postMap[e.postId] = { name: e.productName || "Untitled", views: 0 };
      postMap[e.postId].views++;
    });
    const topPosts = Object.entries(postMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Top searches
    const searchMap: Record<string, number> = {};
    current.forEach(e => {
      if (e.eventType !== "search" || !e.searchQuery) return;
      const q = e.searchQuery.toLowerCase().trim();
      if (!q) return;
      searchMap[q] = (searchMap[q] || 0) + 1;
    });
    const topSearches = Object.entries(searchMap)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top referrers
    const host = req.headers.get("host")?.replace(/^www\./, "") || "";
    const referrerMap: Record<string, number> = {};
    current.forEach(e => {
      if (!e.referrer) return;
      try {
        const url = new URL(e.referrer);
        const domain = url.hostname.replace(/^www\./, "");
        if (domain.includes(host)) return;
        referrerMap[domain] = (referrerMap[domain] || 0) + 1;
      } catch { /* ignore */ }
    });
    const topReferrers = Object.entries(referrerMap)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Top pages
    const pageMap: Record<string, number> = {};
    current.forEach(e => {
      if (e.eventType !== "page_view") return;
      pageMap[e.path] = (pageMap[e.path] || 0) + 1;
    });
    const topPages = Object.entries(pageMap)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Funnel
    const funnel = {
      visitors: kpis.uniqueVisitors,
      productViews: kpis.productViews,
      addToCarts: kpis.addToCarts,
      checkoutClicks: kpis.checkoutClicks,
      cartRate: kpis.productViews > 0 ? (kpis.addToCarts / kpis.productViews * 100) : 0,
      checkoutRate: kpis.addToCarts > 0 ? (kpis.checkoutClicks / kpis.addToCarts * 100) : 0,
    };

    // Compute % changes for each KPI
    const changes: Record<string, number> = {};
    (Object.keys(kpis) as Array<keyof typeof kpis>).forEach(k => {
      const curr = kpis[k];
      const prev = previousKpis[k];
      if (prev === 0) changes[k] = curr > 0 ? 100 : 0;
      else changes[k] = ((curr - prev) / prev) * 100;
    });

    return NextResponse.json({
      ok: true,
      days,
      periodLabel: days === 1 ? "Today" : days === 7 ? "This week" : days === 30 ? "This month" : days === 90 ? "Last 90 days" : `Last ${days} days`,
      previousLabel: days === 1 ? "Yesterday" : days === 7 ? "Last week" : days === 30 ? "Last month" : `Previous ${days} days`,
      kpis,
      previousKpis,
      changes,
      timeline: Object.entries(timeline)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      topProducts,
      topPosts,
      topSearches,
      topReferrers,
      topPages,
      funnel,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
