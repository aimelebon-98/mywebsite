import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAffiliate } from "@/lib/affiliate-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const affiliate = await requireAffiliate();
  if (affiliate instanceof NextResponse) return affiliate;

  const { passwordHash: _, ...safeAffiliate } = affiliate;

  let isOverrideEligible = false;
  let subscriptionExpiresAt: string | null = null;
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

  return NextResponse.json({
    success: true,
    affiliate: {
      ...safeAffiliate,
      isOverrideEligible,
      subscriptionExpiresAt,
    },
  });
}