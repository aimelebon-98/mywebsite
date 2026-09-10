import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  affiliates,
  affiliateOrders,
  affiliateClicks,
  subscriptions,
} from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getCurrentAffiliate } from "@/lib/affiliate-auth";

export const dynamic = "force-dynamic";

function tierFromOrderId(orderId: string): 1 | 2 | 3 {
  if (orderId.endsWith("_L3")) return 3;
  if (orderId.endsWith("_L2")) return 2;
  return 1;
}

export async function GET() {
  try {
    const aff = await getCurrentAffiliate();
    if (!aff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check active subscription status & expiration date
    let isOverrideEligible = false;
    let subscriptionExpiresAt: string | null = null;
    try {
      const subRows = await db
        .select({ status: subscriptions.status, expiresAt: subscriptions.expiresAt })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.customerEmail, aff.email.toLowerCase().trim()),
            eq(subscriptions.status, "active")
          )
        )
        .orderBy(desc(subscriptions.expiresAt))
        .limit(1);

      if (subRows.length > 0) {
        const sub = subRows[0];
        if (sub.expiresAt && new Date(sub.expiresAt) > new Date()) {
          isOverrideEligible = true;
          subscriptionExpiresAt = new Date(sub.expiresAt).toISOString();
        }
      }
    } catch (e) {
      console.error("Subscription check error:", e);
    }

    // Team members (L2 downline)
    const team = await db.select({
      id: affiliates.id, name: affiliates.name, email: affiliates.email, code: affiliates.code,
      status: affiliates.status, totalClicks: affiliates.totalClicks, totalOrders: affiliates.totalOrders,
      totalEarnings: affiliates.totalEarnings, createdAt: affiliates.createdAt,
    }).from(affiliates).where(eq(affiliates.parentAffiliateId, aff.id)).orderBy(desc(affiliates.createdAt));

    const teamWithKids = await Promise.all(
      team.map(async (t) => {
        const kids = await db.select({ id: affiliates.id }).from(affiliates).where(eq(affiliates.parentAffiliateId, t.id));
        return { ...t, downlineCount: kids.length };
      })
    );

    // Commissions
    const myOrders = await db.select().from(affiliateOrders).where(eq(affiliateOrders.affiliateId, aff.id)).orderBy(desc(affiliateOrders.createdAt));

    let directComm = 0; let overrideL2 = 0; let overrideL3 = 0;
    let directCount = 0; let l2Count = 0; let l3Count = 0;

    for (const o of myOrders) {
      const tier = tierFromOrderId(o.orderId);
      const amt = parseFloat(o.commissionAmount || "0");
      if (tier === 1) { directComm += amt; directCount++; }
      else if (tier === 2) { overrideL2 += amt; l2Count++; }
      else { overrideL3 += amt; l3Count++; }
    }

    // Traffic
    const allClickRows = await db.select({ createdAt: affiliateClicks.createdAt, country: affiliateClicks.country })
      .from(affiliateClicks).where(eq(affiliateClicks.affiliateId, aff.id));

    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const clicks7 = allClickRows.filter((c) => c.createdAt && new Date(c.createdAt) >= since7).length;
    const clicks30 = allClickRows.filter((c) => c.createdAt && new Date(c.createdAt) >= since30).length;

    const countryMap: Record<string, number> = {};
    for (const c of allClickRows) {
      const k = (c.country || "Unknown").toUpperCase();
      countryMap[k] = (countryMap[k] || 0) + 1;
    }
    const topCountries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([country, count]) => ({ country, count }));

    return NextResponse.json({
      success: true,
      affiliate: {
        id: aff.id, name: aff.name, email: aff.email, code: aff.code, status: aff.status,
        commissionRate: aff.commissionRate, totalClicks: aff.totalClicks, totalOrders: aff.totalOrders,
        totalEarnings: aff.totalEarnings, pendingPayout: aff.pendingPayout, totalPaidOut: aff.totalPaidOut,
        isOverrideEligible,
        subscriptionExpiresAt,
      },
      team: teamWithKids,
      teamSize: teamWithKids.length,
      traffic: {
        total: aff.totalClicks || allClickRows.length,
        last7Days: clicks7,
        last30Days: clicks30,
        topCountries,
      },
      commissions: {
        level1: { label: "Direct Sales (L1)", count: directCount, amount: directComm.toFixed(2) },
        level2: { label: "Team Overrides (L2)", count: l2Count, amount: overrideL2.toFixed(2) },
        level3: { label: "Deep Overrides (L3)", count: l3Count, amount: overrideL3.toFixed(2) },
        total: (directComm + overrideL2 + overrideL3).toFixed(2),
      },
      recentOrders: myOrders.slice(0, 20).map((o) => ({
        id: o.id, orderId: o.orderId, tier: tierFromOrderId(o.orderId), subtotal: o.subtotal,
        commissionRate: o.commissionRate, commissionAmount: o.commissionAmount, currency: o.currency,
        status: o.status, createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}