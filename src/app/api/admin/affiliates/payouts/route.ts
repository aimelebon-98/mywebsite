import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliatePayouts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// GET: List all affiliate payouts with affiliate details
export async function GET() {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const list = await db
      .select({
        payout: affiliatePayouts,
        affiliate: {
          id: affiliates.id,
          name: affiliates.name,
          email: affiliates.email,
          code: affiliates.code,
          bankName: affiliates.bankName,
          bankAccount: affiliates.bankAccount,
          bankAccountName: affiliates.bankAccountName,
          preferredCurrency: affiliates.preferredCurrency,
        },
      })
      .from(affiliatePayouts)
      .innerJoin(affiliates, eq(affiliatePayouts.affiliateId, affiliates.id))
      .orderBy(desc(affiliatePayouts.requestedAt));

    return NextResponse.json({ success: true, payouts: list });
  } catch (error) {
    console.error("Admin fetch affiliate payouts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Process payout (approve & pay OR reject & refund)
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await request.json();
    const { payoutId, action, reference, note } = body;

    if (!payoutId || !["complete", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "payoutId and valid action (complete/reject) are required" },
        { status: 400 }
      );
    }

    const [payout] = await db
      .select()
      .from(affiliatePayouts)
      .where(eq(affiliatePayouts.id, payoutId))
      .limit(1);

    if (!payout) {
      return NextResponse.json(
        { error: "Payout request not found" },
        { status: 404 }
      );
    }

    if (payout.status !== "pending") {
      return NextResponse.json(
        { error: `Payout is already ${payout.status}` },
        { status: 400 }
      );
    }

    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.id, payout.affiliateId))
      .limit(1);

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    const payoutAmount = parseFloat(payout.amount);

    if (action === "complete") {
      // Mark as completed/paid
      const currentPaid = parseFloat(affiliate.totalPaidOut || "0");
      const newPaid = (currentPaid + payoutAmount).toFixed(2);

      await db
        .update(affiliates)
        .set({
          totalPaidOut: newPaid,
          updatedAt: new Date(),
        })
        .where(eq(affiliates.id, affiliate.id));

      const [updatedPayout] = await db
        .update(affiliatePayouts)
        .set({
          status: "completed",
          reference: reference || null,
          note: note || payout.note || null,
          paidAt: new Date(),
          processedBy: "Admin",
        })
        .where(eq(affiliatePayouts.id, payoutId))
        .returning();

      return NextResponse.json({
        success: true,
        message: "Payout marked as completed",
        payout: updatedPayout,
      });
    } else {
      // Reject payout: refund amount back to pendingPayout
      const currentPending = parseFloat(affiliate.pendingPayout || "0");
      const restoredPending = (currentPending + payoutAmount).toFixed(2);

      await db
        .update(affiliates)
        .set({
          pendingPayout: restoredPending,
          updatedAt: new Date(),
        })
        .where(eq(affiliates.id, affiliate.id));

      const [updatedPayout] = await db
        .update(affiliatePayouts)
        .set({
          status: "rejected",
          note: note || "Rejected by admin",
          processedBy: "Admin",
        })
        .where(eq(affiliatePayouts.id, payoutId))
        .returning();

      return NextResponse.json({
        success: true,
        message: "Payout rejected and balance refunded to affiliate",
        payout: updatedPayout,
      });
    }
  } catch (error) {
    console.error("Admin process affiliate payout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}