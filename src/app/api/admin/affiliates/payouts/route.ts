import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliatePayouts, affiliates } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const rows = await db
      .select({
        payout: affiliatePayouts,
        affiliate: affiliates,
      })
      .from(affiliatePayouts)
      .innerJoin(affiliates, eq(affiliatePayouts.affiliateId, affiliates.id))
      .orderBy(desc(affiliatePayouts.requestedAt));

    return NextResponse.json({ success: true, payouts: rows });
  } catch (error) {
    console.error("Admin fetch affiliate payouts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { payoutId, payoutIds, action, reference } = await req.json();

    const idsToProcess: string[] = Array.isArray(payoutIds) && payoutIds.length > 0
      ? payoutIds
      : payoutId
      ? [payoutId]
      : [];

    if (idsToProcess.length === 0 || !action) {
      return NextResponse.json({ error: "Missing payout ID(s) or action" }, { status: 400 });
    }

    const now = new Date();

    for (const id of idsToProcess) {
      const [row] = await db
        .select()
        .from(affiliatePayouts)
        .where(eq(affiliatePayouts.id, id))
        .limit(1);

      if (!row || row.status !== "pending") continue;

      if (action === "complete") {
        await db
          .update(affiliatePayouts)
          .set({
            status: "completed",
            reference: reference || "Bulk Paid by Admin",
            paidAt: now,
            processedBy: "Admin",
          })
          .where(eq(affiliatePayouts.id, id));

        const [aff] = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.id, row.affiliateId))
          .limit(1);

        if (aff) {
          const curPaidOut = parseFloat(aff.totalPaidOut || "0");
          const pAmount = parseFloat(row.amount || "0");

          await db
            .update(affiliates)
            .set({
              totalPaidOut: (curPaidOut + pAmount).toFixed(2),
              updatedAt: now,
            })
            .where(eq(affiliates.id, aff.id));
        }
      } else if (action === "reject") {
        await db
          .update(affiliatePayouts)
          .set({
            status: "rejected",
            processedBy: "Admin",
          })
          .where(eq(affiliatePayouts.id, id));

        // Refund pending balance back to affiliate
        const [aff] = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.id, row.affiliateId))
          .limit(1);

        if (aff) {
          const curPending = parseFloat(aff.pendingPayout || "0");
          const pAmount = parseFloat(row.amount || "0");

          await db
            .update(affiliates)
            .set({
              pendingPayout: (curPending + pAmount).toFixed(2),
              updatedAt: now,
            })
            .where(eq(affiliates.id, aff.id));
        }
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: idsToProcess.length,
      action,
    });
  } catch (error) {
    console.error("Admin process payouts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}