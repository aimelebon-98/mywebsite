import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { sql, and, gte, lt } from "drizzle-orm";

// GET = seed fake data for yesterday
export async function GET() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 0, 0, 0); // 10 AM yesterday

    const fakeVisitors = ["fake_v1_test", "fake_v2_test", "fake_v3_test", "fake_v4_test", "fake_v5_test"];
    const paths = ["/en", "/en/shop", "/en/blog", "/en/product/nike-air-max", "/en/product/adidas-boost", "/en/contact"];
    const products = [
      { id: "00000000-0000-0000-0000-000000000001", name: "Nike Air Max" },
      { id: "00000000-0000-0000-0000-000000000002", name: "Adidas Boost" },
    ];

    let inserted = 0;

    // Spread events across the day (10am - 8pm)
    for (let hour = 0; hour < 10; hour++) {
      for (const visitor of fakeVisitors) {
        const t = new Date(yesterday);
        t.setHours(10 + hour, Math.floor(Math.random() * 60), 0, 0);

        // Page view
        await db.insert(analyticsEvents).values({
          eventType: "page_view",
          path: paths[Math.floor(Math.random() * paths.length)],
          visitorId: visitor,
          userAgent: "Mozilla/5.0 (seed test)",
          referrer: "https://google.com",
          metadata: "{}",
          createdAt: t,
        });
        inserted++;

        // Occasional product view
        if (Math.random() > 0.5) {
          const p = products[Math.floor(Math.random() * products.length)];
          await db.insert(analyticsEvents).values({
            eventType: "product_view",
            path: `/en/product/${p.name.toLowerCase().replace(/\s+/g, "-")}`,
            productId: p.id,
            productName: p.name,
            visitorId: visitor,
            userAgent: "Mozilla/5.0 (seed test)",
            referrer: "",
            metadata: "{}",
            createdAt: new Date(t.getTime() + 60000),
          });
          inserted++;
        }

        // Occasional add to cart
        if (Math.random() > 0.7) {
          const p = products[Math.floor(Math.random() * products.length)];
          await db.insert(analyticsEvents).values({
            eventType: "add_to_cart",
            path: `/en/product/${p.name.toLowerCase().replace(/\s+/g, "-")}`,
            productId: p.id,
            productName: p.name,
            visitorId: visitor,
            userAgent: "Mozilla/5.0 (seed test)",
            referrer: "",
            metadata: "{\"quantity\":1}",
            createdAt: new Date(t.getTime() + 120000),
          });
          inserted++;
        }

        // Rare checkout
        if (Math.random() > 0.85) {
          await db.insert(analyticsEvents).values({
            eventType: "checkout_click",
            path: "/en/cart",
            visitorId: visitor,
            userAgent: "Mozilla/5.0 (seed test)",
            referrer: "",
            metadata: "{\"itemCount\":2}",
            createdAt: new Date(t.getTime() + 180000),
          });
          inserted++;
        }

        // Blog view sometimes
        if (Math.random() > 0.6) {
          await db.insert(analyticsEvents).values({
            eventType: "blog_view",
            path: "/en/blog/some-post",
            postId: "00000000-0000-0000-0000-000000000010",
            productName: "How to Choose Sneakers",
            visitorId: visitor,
            userAgent: "Mozilla/5.0 (seed test)",
            referrer: "",
            metadata: "{}",
            createdAt: new Date(t.getTime() + 240000),
          });
          inserted++;
        }

        // Search sometimes
        if (Math.random() > 0.75) {
          const queries = ["nike", "running shoes", "adidas", "sneakers", "boots"];
          await db.insert(analyticsEvents).values({
            eventType: "search",
            path: "/en/shop",
            searchQuery: queries[Math.floor(Math.random() * queries.length)],
            visitorId: visitor,
            userAgent: "Mozilla/5.0 (seed test)",
            referrer: "",
            metadata: "{}",
            createdAt: new Date(t.getTime() + 300000),
          });
          inserted++;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      inserted,
      message: `Seeded ${inserted} fake events for yesterday. Visit Analytics -> Today range to see comparisons!`,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

// DELETE = remove all fake seed data (visitors start with fake_)
export async function DELETE() {
  try {
    const result = await db.execute(sql`DELETE FROM analytics_events WHERE visitor_id LIKE 'fake_%';`);
    return NextResponse.json({ ok: true, message: "Fake seed data removed", result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
