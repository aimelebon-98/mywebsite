import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { and, gte, sql, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7");

  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const all = await db
      .select()
      .from(analyticsEvents)
      .where(and(gte(analyticsEvents.createdAt, since)))
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(50000);

    // Aggregate
    const totalEvents = all.length;
    const uniqueVisitors = new Set(all.map(e => e.visitorId)).size;
    const pageViews = all.filter(e => e.eventType === "page_view").length;
    const productViews = all.filter(e => e.eventType === "product_view").length;
    const addToCarts = all.filter(e => e.eventType === "add_to_cart").length;
    const checkoutClicks = all.filter(e => e.eventType === "checkout_click").length;
    const wishlistAdds = all.filter(e => e.eventType === "wishlist_add").length;
    const newsletterSignups = all.filter(e => e.eventType === "newsletter_signup").length;
    const searches = all.filter(e => e.eventType === "search").length;
    const blogViews = all.filter(e => e.eventType === "blog_view").length;

    // Timeline (per day)
    const timeline: Record<string, { visits: number; carts: number; checkouts: number }> = {};
    all.forEach(e => {
      const day = e.createdAt.toISOString().slice(0, 10);
      if (!timeline[day]) timeline[day] = { visits: 0, carts: 0, checkouts: 0 };
      if (e.eventType === "page_view") timeline[day].visits++;
      if (e.eventType === "add_to_cart") timeline[day].carts++;
      if (e.eventType === "checkout_click") timeline[day].checkouts++;
    });

    // Top products
    const productMap: Record<string, { name: string; views: number; carts: number; checkouts: number }> = {};
    all.forEach(e => {
      if (!e.productId || !e.productName) return;
      if (!productMap[e.productId]) {
        productMap[e.productId] = { name: e.productName, views: 0, carts: 0, checkouts: 0 };
      }
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
    all.forEach(e => {
      if (e.eventType !== "blog_view" || !e.postId) return;
      if (!postMap[e.postId]) postMap[e.postId] = { name: e.productName || "Untitled", views: 0 };
      postMap[e.postId].views++;
    });
    const topPosts = Object.entries(postMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Top search terms
    const searchMap: Record<string, number> = {};
    all.forEach(e => {
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
    const referrerMap: Record<string, number> = {};
    all.forEach(e => {
      if (!e.referrer) return;
      try {
        const url = new URL(e.referrer);
        const domain = url.hostname.replace(/^www\./, "");
        if (domain.includes(req.headers.get("host")?.replace(/^www\./, "") || "")) return;
        referrerMap[domain] = (referrerMap[domain] || 0) + 1;
      } catch { /* ignore */ }
    });
    const topReferrers = Object.entries(referrerMap)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Top pages
    const pageMap: Record<string, number> = {};
    all.forEach(e => {
      if (e.eventType !== "page_view") return;
      pageMap[e.path] = (pageMap[e.path] || 0) + 1;
    });
    const topPages = Object.entries(pageMap)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Conversion funnel
    const funnel = {
      visitors: uniqueVisitors,
      productViews,
      addToCarts,
      checkoutClicks,
      cartRate: productViews > 0 ? (addToCarts / productViews * 100) : 0,
      checkoutRate: addToCarts > 0 ? (checkoutClicks / addToCarts * 100) : 0,
    };

    return NextResponse.json({
      ok: true,
      days,
      kpis: {
        totalEvents,
        uniqueVisitors,
        pageViews,
        productViews,
        addToCarts,
        checkoutClicks,
        wishlistAdds,
        newsletterSignups,
        searches,
        blogViews,
      },
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
