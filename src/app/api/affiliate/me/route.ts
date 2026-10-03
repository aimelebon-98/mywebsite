import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, affiliateOrders } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAffiliate } from "@/lib/affiliate-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const affiliate = await requireAffiliate();
  if (affiliate instanceof NextResponse) return affiliate;

  const { passwordHash: _, ...safeAffiliate } = affiliate;

  let isOverrideEligible = Boolean(affiliate.manualOverrideActive);
  let subscriptionExpiresAt: string | null = null;

  if (!isOverrideEligible) {
    try {
      const subRows = await db
        .select({ status: subscriptions.status, expiresAt: subscriptions.expiresAt })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.customerEmail, affiliate.email.toLowerCase().trim()),
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
      console.error("me API subscription check error:", e);
    }
  }

  // Calculate breakdown
  let l1Earnings = 0;
  let recurringEarnings = 0;
  let recurringLocked = 0;
  let l2Earnings = 0;
  let l3Earnings = 0;

  try {
    const affOrders = await db
      .select({
        orderId: affiliateOrders.orderId,
        commissionAmount: affiliateOrders.commissionAmount,
        status: affiliateOrders.status,
      })
      .from(affiliateOrders)
      .where(
        and(
          eq(affiliateOrders.affiliateId, affiliate.id),
          sql`${affiliateOrders.status} NOT IN ('cancelled', 'rejected')`
        )
      );

    affOrders.forEach((o) => {
      const amt = parseFloat(o.commissionAmount || "0");
      const isLocked = o.status === "locked";

      if (o.orderId.includes("_L2")) {
        if (!isLocked) l2Earnings += amt;
      } else if (o.orderId.includes("_L3")) {
        if (!isLocked) l3Earnings += amt;
      } else if (o.orderId.includes("_REC")) {
        if (isLocked) {
          recurringLocked += amt;
        } else {
          recurringEarnings += amt;
        }
      } else {
        l1Earnings += amt;
      }
    });
  } catch (e) {
    console.error("me API breakdown calculation error:", e);
  }

  const teamBonus = l2Earnings + l3Earnings;

  return NextResponse.json({
    success: true,
    affiliate: {
      ...safeAffiliate,
      isOverrideEligible,
      subscriptionExpiresAt,
      l1Earnings: l1Earnings.toFixed(2),
      recurringEarnings: recurringEarnings.toFixed(2),
      recurringLocked: recurringLocked.toFixed(2),
      l2Earnings: l2Earnings.toFixed(2),
      l3Earnings: l3Earnings.toFixed(2),
      teamBonus: teamBonus.toFixed(2),
    },
  });
}