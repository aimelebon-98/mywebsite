import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  affiliates,
  affiliateOrders,
  affiliateClicks,
  affiliatePayouts,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { ensureAffiliateTablesExist } from "@/lib/ensure-affiliate-tables";

export const dynamic = "force-dynamic";

function tierFromOrderId(orderId: string): 1 | 2 | 3 {
  if (orderId.endsWith("_L3")) return 3;
  if (orderId.endsWith("_L2")) return 2;
  return 1;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await ensureAffiliateTablesExist();

    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get("affiliateId");

    // Global overview
    if (!affiliateId) {
      const allAff = await db.select().from(affiliates);
      const allOrders = await db.select().from(affiliateOrders);
      const allClicks = await db.select().from(affiliateClicks);

      let l1Comm = 0; let l2Comm = 0; let l3Comm = 0;
      let l1Count = 0; let l2Count = 0; let l3Count = 0;

      for (const o of allOrders) {
        const amt = parseFloat(o.commissionAmount || "0");
        const t = tierFromOrderId(o.orderId);
        if (t === 1) { l1Comm += amt; l1Count++; }
        else if (t === 2) { l2Comm += amt; l2Count++; }
        else { l3Comm += amt; l3Count++; }
      }

      const withParent = allAff.filter((a) => a.parentAffiliateId).length;
      const approved = allAff.filter((a) => a.status === "approved").length;

      const top = [...allAff]
        .sort((a, b) => parseFloat(b.totalEarnings || "0") - parseFloat(a.totalEarnings || "0"))
        .slice(0, 10)
        .map((a) => ({
          id: a.id,
          name: a.name,
          email: a.email,
          code: a.code,
          status: a.status,
          totalEarnings: a.totalEarnings,
          totalClicks: a.totalClicks,
          totalOrders: a.totalOrders,
          teamSize: allAff.filter((x) => x.parentAffiliateId === a.id).length,
        }));

      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentClicks = allClicks.filter((c) => c.createdAt && new Date(c.createdAt) >= since).length;

      return NextResponse.json({
        success: true,
        overview: {
          totalAffiliates: allAff.length,
          approvedAffiliates: approved,
          withParent,
          totalClicks: allClicks.length,
          clicksLast30Days: recentClicks,
          totalOrders: allOrders.length,
          commissions: {
            level1: { count: l1Count, amount: l1Comm.toFixed(2) },
            level2: { count: l2Count, amount: l2Comm.toFixed(2) },
            level3: { count: l3Count, amount: l3Comm.toFixed(2) },
            total: (l1Comm + l2Comm + l3Comm).toFixed(2),
          },
          topEarners: top,
        },
      });
    }

    // Single Affiliate Network
    const [aff] = await db.select().from(affiliates).where(eq(affiliates.id, affiliateId)).limit(1);
    if (!aff) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });

    let parent = null;
    if (aff.parentAffiliateId) {
      const [p] = await db.select({
        id: affiliates.id, name: affiliates.name, email: affiliates.email, code: affiliates.code, status: affiliates.status,
      }).from(affiliates).where(eq(affiliates.id, aff.parentAffiliateId)).limit(1);
      parent = p || null;
    }

    const team = await db.select({
      id: affiliates.id, name: affiliates.name, email: affiliates.email, code: affiliates.code,
      status: affiliates.status, totalClicks: affiliates.totalClicks, totalOrders: affiliates.totalOrders,
      totalEarnings: affiliates.totalEarnings, createdAt: affiliates.createdAt,
    }).from(affiliates).where(eq(affiliates.parentAffiliateId, affiliateId)).orderBy(desc(affiliates.createdAt));

    const teamWithKids = await Promise.all(
      team.map(async (t) => {
        const kids = await db.select({ id: affiliates.id }).from(affiliates).where(eq(affiliates.parentAffiliateId, t.id));
        return { ...t, downlineCount: kids.length };
      })
    );

    const myOrders = await db.select().from(affiliateOrders).where(eq(affiliateOrders.affiliateId, affiliateId)).orderBy(desc(affiliateOrders.createdAt));

    let directComm = 0; let overrideL2 = 0; let overrideL3 = 0;
    let directCount = 0; let l2Count = 0; let l3Count = 0;

    for (const o of myOrders) {
      const tier = tierFromOrderId(o.orderId);
      const amt = parseFloat(o.commissionAmount || "0");
      if (tier === 1) { directComm += amt; directCount++; }
      else if (tier === 2) { overrideL2 += amt; l2Count++; }
      else { overrideL3 += amt; l3Count++; }
    }

    const allClickRows = await db.select({ createdAt: affiliateClicks.createdAt, country: affiliateClicks.country })
      .from(affiliateClicks).where(eq(affiliateClicks.affiliateId, affiliateId));

    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const clicks7 = allClickRows.filter((c) => c.createdAt && new Date(c.createdAt) >= since7).length;
    const clicks30 = allClickRows.filter((c) => c.createdAt && new Date(c.createdAt) >= since30).length;

    const countryMap: Record<string, number> = {};
    for (const c of allClickRows) {
      const k = (c.country || "Unknown").toUpperCase();
      countryMap[k] = (countryMap[k] || 0) + 1;
    }
    const topCountries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([country, count]) => ({ country, count }));

    return NextResponse.json({
      success: true,
      affiliate: {
        id: aff.id, name: aff.name, email: aff.email, code: aff.code, status: aff.status,
        commissionRate: aff.commissionRate, totalClicks: aff.totalClicks, totalOrders: aff.totalOrders,
        totalEarnings: aff.totalEarnings, pendingPayout: aff.pendingPayout, totalPaidOut: aff.totalPaidOut,
        country: aff.country, phone: aff.phone, createdAt: aff.createdAt,
      },
      upline: parent,
      team: teamWithKids,
      teamSize: teamWithKids.length,
      traffic: {
        total: aff.totalClicks || allClickRows.length,
        last7Days: clicks7,
        last30Days: clicks30,
        topCountries,
      },
      commissions: {
        level1: { label: "Direct (L1)", count: directCount, amount: directComm.toFixed(2) },
        level2: { label: "Team override (L2)", count: l2Count, amount: overrideL2.toFixed(2) },
        level3: { label: "Team override (L3)", count: l3Count, amount: overrideL3.toFixed(2) },
        total: (directComm + overrideL2 + overrideL3).toFixed(2),
      },
      recentOrders: myOrders.slice(0, 30).map((o) => ({
        id: o.id, orderId: o.orderId, tier: tierFromOrderId(o.orderId), subtotal: o.subtotal,
        commissionRate: o.commissionRate, commissionAmount: o.commissionAmount, currency: o.currency,
        status: o.status, createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}