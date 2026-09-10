import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, subscriptions } from "@/db/schema";
import { eq, desc, inArray, and } from "drizzle-orm";
import { getCurrentAffiliate } from "@/lib/affiliate-auth";

export const dynamic = "force-dynamic";

interface NodeMember {
  id: string;
  name: string;
  email: string;
  code: string;
  status: string | null;
  level: number;
  totalEarnings: string;
  totalOrders: number;
  isOverrideEligible: boolean;
  createdAt: string | null;
  children: NodeMember[];
}

export async function GET() {
  try {
    const aff = await getCurrentAffiliate();
    if (!aff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    async function getSubscriptionStatus(email: string) {
      if (!email) return false;
      try {
        const rows = await db
          .select({ expiresAt: subscriptions.expiresAt })
          .from(subscriptions)
          .where(and(eq(subscriptions.customerEmail, email.toLowerCase().trim()), eq(subscriptions.status, "active")))
          .limit(1);
        if (rows.length === 0) return false;
        return Boolean(rows[0].expiresAt && new Date(rows[0].expiresAt) > new Date());
      } catch {
        return false;
      }
    }

    const selfActive = await getSubscriptionStatus(aff.email);

    const rootNode: NodeMember = {
      id: aff.id,
      name: aff.name,
      email: aff.email,
      code: aff.code,
      status: aff.status,
      level: 0,
      totalEarnings: aff.totalEarnings || "0.00",
      totalOrders: aff.totalOrders || 0,
      isOverrideEligible: selfActive,
      createdAt: aff.createdAt ? new Date(aff.createdAt).toISOString() : null,
      children: [],
    };

    // LEVEL 1
    const l1Rows = await db
      .select({
        id: affiliates.id,
        name: affiliates.name,
        email: affiliates.email,
        code: affiliates.code,
        status: affiliates.status,
        totalEarnings: affiliates.totalEarnings,
        totalOrders: affiliates.totalOrders,
        createdAt: affiliates.createdAt,
        parentAffiliateId: affiliates.parentAffiliateId,
      })
      .from(affiliates)
      .where(eq(affiliates.parentAffiliateId, aff.id))
      .orderBy(desc(affiliates.createdAt));

    const l1Ids = l1Rows.map((r) => r.id);

    // LEVEL 2
    let l2Rows: Array<{
      id: string;
      name: string;
      email: string;
      code: string;
      status: string | null;
      totalEarnings: string | null;
      totalOrders: number | null;
      createdAt: Date | null;
      parentAffiliateId: string | null;
    }> = [];

    if (l1Ids.length > 0) {
      l2Rows = await db
        .select({
          id: affiliates.id,
          name: affiliates.name,
          email: affiliates.email,
          code: affiliates.code,
          status: affiliates.status,
          totalEarnings: affiliates.totalEarnings,
          totalOrders: affiliates.totalOrders,
          createdAt: affiliates.createdAt,
          parentAffiliateId: affiliates.parentAffiliateId,
        })
        .from(affiliates)
        .where(inArray(affiliates.parentAffiliateId, l1Ids))
        .orderBy(desc(affiliates.createdAt));
    }

    const l2Ids = l2Rows.map((r) => r.id);

    // LEVEL 3
    let l3Rows: Array<{
      id: string;
      name: string;
      email: string;
      code: string;
      status: string | null;
      totalEarnings: string | null;
      totalOrders: number | null;
      createdAt: Date | null;
      parentAffiliateId: string | null;
    }> = [];

    if (l2Ids.length > 0) {
      l3Rows = await db
        .select({
          id: affiliates.id,
          name: affiliates.name,
          email: affiliates.email,
          code: affiliates.code,
          status: affiliates.status,
          totalEarnings: affiliates.totalEarnings,
          totalOrders: affiliates.totalOrders,
          createdAt: affiliates.createdAt,
          parentAffiliateId: affiliates.parentAffiliateId,
        })
        .from(affiliates)
        .where(inArray(affiliates.parentAffiliateId, l2Ids))
        .orderBy(desc(affiliates.createdAt));
    }

    // Build hierarchy tree
    for (const l1 of l1Rows) {
      const l1Active = await getSubscriptionStatus(l1.email);
      const l1Children: NodeMember[] = [];

      const myL2s = l2Rows.filter((r) => r.parentAffiliateId === l1.id);
      for (const l2 of myL2s) {
        const l2Active = await getSubscriptionStatus(l2.email);
        const myL3s = l3Rows.filter((r) => r.parentAffiliateId === l2.id);

        const l3Children: NodeMember[] = [];
        for (const l3 of myL3s) {
          const l3Active = await getSubscriptionStatus(l3.email);
          l3Children.push({
            id: l3.id,
            name: l3.name,
            email: l3.email,
            code: l3.code,
            status: l3.status,
            level: 3,
            totalEarnings: l3.totalEarnings || "0.00",
            totalOrders: l3.totalOrders || 0,
            isOverrideEligible: l3Active,
            createdAt: l3.createdAt ? new Date(l3.createdAt).toISOString() : null,
            children: [],
          });
        }

        l1Children.push({
          id: l2.id,
          name: l2.name,
          email: l2.email,
          code: l2.code,
          status: l2.status,
          level: 2,
          totalEarnings: l2.totalEarnings || "0.00",
          totalOrders: l2.totalOrders || 0,
          isOverrideEligible: l2Active,
          createdAt: l2.createdAt ? new Date(l2.createdAt).toISOString() : null,
          children: l3Children,
        });
      }

      rootNode.children.push({
        id: l1.id,
        name: l1.name,
        email: l1.email,
        code: l1.code,
        status: l1.status,
        level: 1,
        totalEarnings: l1.totalEarnings || "0.00",
        totalOrders: l1.totalOrders || 0,
        isOverrideEligible: l1Active,
        createdAt: l1.createdAt ? new Date(l1.createdAt).toISOString() : null,
        children: l1Children,
      });
    }

    return NextResponse.json({
      success: true,
      tree: rootNode,
      stats: {
        l1Count: l1Rows.length,
        l2Count: l2Rows.length,
        l3Count: l3Rows.length,
        totalNetworkSize: l1Rows.length + l2Rows.length + l3Rows.length,
      },
    });
  } catch (error) {
    console.error("Genealogy API error:", error);
    return NextResponse.json({ error: "Failed to load genealogy tree" }, { status: 500 });
  }
}