import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliatePayouts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAffiliate } from "@/lib/affiliate-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const affiliate = await requireAffiliate();
  if (affiliate instanceof NextResponse) return affiliate;

  try {
    const list = await db
      .select()
      .from(affiliatePayouts)
      .where(eq(affiliatePayouts.affiliateId, affiliate.id))
      .orderBy(desc(affiliatePayouts.requestedAt));

    return NextResponse.json({ success: true, payouts: list });
  } catch (error) {
    console.error("Affiliate fetch payouts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const affiliate = await requireAffiliate();
  if (affiliate instanceof NextResponse) return affiliate;

  try {
    const body = await request.json();
    const { amount, method = "USDT-TRC20", note } = body;

    const reqAmount = parseFloat(amount);
    const pending = parseFloat(affiliate.pendingPayout || "0");

    if (isNaN(reqAmount) || reqAmount < 20) {
      return NextResponse.json(
        { error: "Minimum payout request is $20.00 USD" },
        { status: 400 }
      );
    }

    if (reqAmount > pending) {
      return NextResponse.json(
        {
          error: `Requested amount ($${reqAmount.toFixed(2)}) exceeds pending balance ($${pending.toFixed(2)})`,
        },
        { status: 400 }
      );
    }

    if (!affiliate.bankAccount) {
      return NextResponse.json(
        {
          error:
            "Please configure your USDT (TRC20) wallet address in Settings before requesting a payout.",
        },
        { status: 400 }
      );
    }

    const [payout] = await db
      .insert(affiliatePayouts)
      .values({
        affiliateId: affiliate.id,
        amount: reqAmount.toFixed(2),
        currency: affiliate.preferredCurrency || "USD",
        method: "USDT-TRC20",
        note: note || null,
        status: "pending",
      })
      .returning();

    const newPending = (pending - reqAmount).toFixed(2);
    await db
      .update(affiliates)
      .set({
        pendingPayout: newPending,
        updatedAt: new Date(),
      })
      .where(eq(affiliates.id, affiliate.id));

    return NextResponse.json({
      success: true,
      message: "Payout request submitted successfully",
      payout,
      remainingPending: newPending,
    });
  } catch (error) {
    console.error("Affiliate payout request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}