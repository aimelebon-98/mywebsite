import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendorPayouts, vendors } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentVendor } from "@/lib/vendor-auth";

export const dynamic = "force-dynamic";

const MIN_PAYOUT_USD = 20;

export async function GET() {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payouts = await db.select().from(vendorPayouts)
      .where(eq(vendorPayouts.vendorId, vendor.id))
      .orderBy(desc(vendorPayouts.requestedAt));

    return NextResponse.json({
      payouts,
      pendingPayout: vendor.pendingPayout,
      totalPaidOut: vendor.totalPaidOut,
      totalEarnings: vendor.totalEarnings,
      minPayoutUsd: MIN_PAYOUT_USD,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!vendor.bankAccount || !vendor.bankName || !vendor.bankAccountName) {
      return NextResponse.json({ error: "Please add your bank details in Settings before requesting a payout" }, { status: 400 });
    }

    const body = await req.json();
    const amount = parseFloat(String(body.amount || "0"));
    const pending = parseFloat(String(vendor.pendingPayout || "0"));

    if (isNaN(amount) || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    if (amount < MIN_PAYOUT_USD) return NextResponse.json({ error: `Minimum payout is $${MIN_PAYOUT_USD}` }, { status: 400 });
    if (amount > pending) return NextResponse.json({ error: "Amount exceeds pending balance" }, { status: 400 });

    // Check for existing pending request
    const [existing] = await db.select().from(vendorPayouts)
      .where(eq(vendorPayouts.vendorId, vendor.id))
      .orderBy(desc(vendorPayouts.requestedAt))
      .limit(1);

    if (existing && existing.status === "pending") {
      return NextResponse.json({ error: "You already have a pending payout request" }, { status: 409 });
    }

    const note = String(body.note || "").slice(0, 500);
    await db.insert(vendorPayouts).values({
      vendorId: vendor.id,
      amount: amount.toFixed(2),
      currency: "USD",
      method: "bank_transfer",
      note,
      status: "pending",
    });

    return NextResponse.json({ success: true, message: "Payout request submitted" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}