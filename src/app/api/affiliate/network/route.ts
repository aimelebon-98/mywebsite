import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  affiliates,
  affiliateOrders,
  affiliateClicks,
  subscriptions,
} from "@/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { getCurrentAffiliate } from "@/lib/affiliate-auth";

export const dynamic = "force-dynamic";

function tierFromOrderId(orderId: string): 1 | 2 | 3 {
  if (orderId.endsWith("_L3")) return 3;
  if (orderId.endsWith("_L2")) return 2;
  return 1;
}

async function checkAffiliateActive(email: string | null | undefined, manualOverride: boolean | null | undefined): Promise<{ isEligible: boolean; expiresAt: string | null }> {
  if (manualOverride) {
    return { isEligible: true, expiresAt: null };
  }
  if (!email) return { isEligible: false, expiresAt: null };
  try {
    const subRows = await db
      .select({ status: subscriptions.status, expiresAt: subscriptions.expiresAt })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.customerEmail, email.toLowerCase().trim()),
          eq(subscriptions.status, "active")
        )
      )
      .orderBy(desc(subscriptions.expiresAt))
      .limit(1);

    if (subRows.length > 0) {
      const sub = subRows[0];
      if (sub.expiresAt && new Date(sub.expiresAt) > new Date()) {
        return {
          isEligible: true,
          expiresAt: new Date(sub.expiresAt).toISOString()
        };
      }
    }
  } catch (e) {
    console.error("Subscription check error:", e);
  }
  return { isEligible: false, expiresAt: null };
}

export async function GET() {
  try {
    const aff = await getCurrentAffiliate();
    if (!aff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const selfActive = await checkAffiliateActive(aff.email, aff.manualOverrideActive);
    const isOverrideEligible = selfActive.isEligible;
    const subscriptionExpiresAt = selfActive.expiresAt;

    let l1Team: Array<{
      id: string;
      name: string;
      email: string;
      code: string;
      status: string | null;
      manualOverrideActive: boolean | null;
      totalClicks: number | null;
      totalOrders: number | null;
      totalEarnings: string | null;
      createdAt: Date | null;
      parentAffiliateId: string | null;
    }> = [];

    try {
      l1Team = await db.select({
        id: affiliates.id,
        name: affiliates.name,
        email: affiliates.email,
        code: affiliates.code,
        status: affiliates.status,
        manualOverrideActive: affiliates.manualOverrideActive,
        totalClicks: affiliates.totalClicks,
        totalOrders: affiliates.totalOrders,
        totalEarnings: affiliates.totalEarnings,
        createdAt: affiliates.createdAt,
        parentAffiliateId: affiliates.parentAffiliateId,
      }).from(affiliates).where(eq(affiliates.parentAffiliateId, aff.id)).orderBy(desc(affiliates.createdAt));
    } catch (e) {
      console.error("L1 query error:", e);
      l1Team = [];
    }

    const l1Ids = l1Team.map((t) => t.id);

    let l2Team: typeof l1Team = [];
    if (l1Ids.length > 0) {
      try {
        l2Team = await db.select({
          id: affiliates.id,
          name: affiliates.name,
          email: affiliates.email,
          code: affiliates.code,
          status: affiliates.status,
          manualOverrideActive: affiliates.manualOverrideActive,
          totalClicks: affiliates.totalClicks,
          totalOrders: affiliates.totalOrders,
          totalEarnings: affiliates.totalEarnings,
          createdAt: affiliates.createdAt,
          parentAffiliateId: affiliates.parentAffiliateId,
        }).from(affiliates).where(inArray(affiliates.parentAffiliateId, l1Ids));
      } catch (e) {
        console.error("L2 query error:", e);
        l2Team = [];
      }
    }
    const l2Ids = l2Team.map((t) => t.id);

    let l3Count = 0;
    if (l2Ids.length > 0) {
      try {
        const l3Rows = await db.select({ id: affiliates.id }).from(affiliates).where(inArray(affiliates.parentAffiliateId, l2Ids));
        l3Count = l3Rows.length;
      } catch (e) {
        console.error("L3 query error:", e);
        l3Count = 0;
      }
    }

    const teamWithKids = await Promise.all(
      l1Team.map(async (t) => {
        const kids = l2Team.filter((c) => c.parentAffiliateId === t.id);
        const memberActive = await checkAffiliateActive(t.email, t.manualOverrideActive);
        return {
          id: t.id,
          name: t.name,
          email: t.email,
          code: t.code,
          status: t.status,
          isOverrideEligible: memberActive.isEligible,
          totalClicks: t.totalClicks,
          totalOrders: t.totalOrders,
          totalEarnings: t.totalEarnings,
          createdAt: t.createdAt,
          downlineCount: kids.length,
        };
      })
    );

    let myOrders: Array<{
      id: string;
      orderId: string;
      subtotal: string;
      commissionRate: string;
      commissionAmount: string;
      currency: string | null;
      status: string | null;
      createdAt: Date | null;
    }> = [];

    try {
      myOrders = await db.select({
        id: affiliateOrders.id,
        orderId: affiliateOrders.orderId,
        subtotal: affiliateOrders.subtotal,
        commissionRate: affiliateOrders.commissionRate,
        commissionAmount: affiliateOrders.commissionAmount,
        currency: affiliateOrders.currency,
        status: affiliateOrders.status,
        createdAt: affiliateOrders.createdAt,
      }).from(affiliateOrders).where(eq(affiliateOrders.affiliateId, aff.id)).orderBy(desc(affiliateOrders.createdAt));
    } catch (e) {
      console.error("Orders query error:", e);
      myOrders = [];
    }

    let directComm = 0; let overrideL2 = 0; let overrideL3 = 0;
    let directCount = 0; let l2Count = 0; let l3OrderCount = 0;

    for (const o of myOrders) {
      const tier = tierFromOrderId(o.orderId);
      const amt = parseFloat(o.commissionAmount || "0");
      if (tier === 1) { directComm += amt; directCount++; }
      else if (tier === 2) { overrideL2 += amt; l2Count++; }
      else { overrideL3 += amt; l3OrderCount++; }
    }

    let allClickRows: Array<{ createdAt: Date | null; country: string | null }> = [];
    try {
      allClickRows = await db.select({
        createdAt: affiliateClicks.createdAt,
        country: affiliateClicks.country,
      }).from(affiliateClicks).where(eq(affiliateClicks.affiliateId, aff.id));
    } catch (e) {
      console.error("Clicks query error:", e);
      allClickRows = [];
    }

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

    const totalTeamClicks = l1Team.reduce((s, m) => s + (m.totalClicks || 0), 0);
    const totalTeamOrders = l1Team.reduce((s, m) => s + (m.totalOrders || 0), 0);

    return NextResponse.json({
      success: true,
      affiliate: {
        id: aff.id,
        name: aff.name,
        email: aff.email,
        code: aff.code,
        status: aff.status,
        commissionRate: aff.commissionRate,
        totalClicks: aff.totalClicks,
        totalOrders: aff.totalOrders,
        totalEarnings: aff.totalEarnings,
        pendingPayout: aff.pendingPayout,
        totalPaidOut: aff.totalPaidOut,
        isOverrideEligible,
        subscriptionExpiresAt,
      },
      team: teamWithKids,
      teamSize: teamWithKids.length,
      hierarchy: {
        l1Count: teamWithKids.length,
        l2Count: l2Team.length,
        l3Count,
        teamClicks: totalTeamClicks,
        teamOrders: totalTeamOrders,
      },
      traffic: {
        total: aff.totalClicks || allClickRows.length,
        last7Days: clicks7,
        last30Days: clicks30,
        topCountries,
      },
      commissions: {
        level1: { label: "Direct Sales (customer)", count: directCount, amount: directComm.toFixed(2) },
        level2: { label: "L1 Team Overrides", count: l2Count, amount: overrideL2.toFixed(2) },
        level3: { label: "L2 Team Overrides", count: l3OrderCount, amount: overrideL3.toFixed(2) },
        total: (directComm + overrideL2 + overrideL3).toFixed(2),
      },
      recentOrders: myOrders.slice(0, 20).map((o) => ({
        id: o.id,
        orderId: o.orderId,
        tier: tierFromOrderId(o.orderId),
        subtotal: o.subtotal,
        commissionRate: o.commissionRate,
        commissionAmount: o.commissionAmount,
        currency: o.currency,
        status: o.status,
        createdAt: o.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Network API error:", error);
    return NextResponse.json({
      error: error?.message || "Internal server error",
      detail: String(error)
    }, { status: 500 });
  }
}