import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendorPayouts, vendors } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { sendVendorPayoutProcessedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");

    let payouts;
    if (statusFilter && statusFilter !== "all") {
      payouts = await db.select().from(vendorPayouts).where(eq(vendorPayouts.status, statusFilter));
    } else {
      payouts = await db.select().from(vendorPayouts);
    }

    payouts.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    const vendorIds = Array.from(new Set(payouts.map(p => p.vendorId)));
    let vMap = new Map<string, { storeName: string; email: string; bankName: string; bankAccount: string; bankAccountName: string; contactName: string }>();
    if (vendorIds.length > 0) {
      const vs = await db.select().from(vendors).where(inArray(vendors.id, vendorIds));
      vMap = new Map(vs.map(v => [v.id, {
        storeName: v.storeName,
        email: v.email,
        bankName: v.bankName,
        bankAccount: v.bankAccount,
        bankAccountName: v.bankAccountName,
        contactName: v.contactName,
      }]));
    }

    const enriched = payouts.map(p => ({ ...p, vendor: vMap.get(p.vendorId) || null }));
    const pendingCount = payouts.filter(p => p.status === "pending").length;
    return NextResponse.json({ payouts: enriched, pendingCount });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { payoutId, action, reference, note } = await req.json();
    if (!payoutId || !["mark_paid", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const [payout] = await db.select().from(vendorPayouts).where(eq(vendorPayouts.id, payoutId)).limit(1);
    if (!payout) return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    if (payout.status !== "pending") return NextResponse.json({ error: "Payout already processed" }, { status: 400 });

    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, payout.vendorId)).limit(1);
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    if (action === "mark_paid") {
      if (!reference || !String(reference).trim()) return NextResponse.json({ error: "Bank reference required" }, { status: 400 });

      const amount = parseFloat(payout.amount);
      const currentPending = parseFloat(vendor.pendingPayout || "0");
      const currentPaid = parseFloat(vendor.totalPaidOut || "0");

      // Deduct from pending, add to paid total
      await db.update(vendorPayouts).set({
        status: "paid",
        reference: String(reference).slice(0, 100),
        note: String(note || "").slice(0, 500),
        paidAt: new Date(),
      }).where(eq(vendorPayouts.id, payoutId));

      await db.update(vendors).set({
        pendingPayout: Math.max(0, currentPending - amount).toFixed(2),
        totalPaidOut: (currentPaid + amount).toFixed(2),
        updatedAt: new Date(),
      }).where(eq(vendors.id, vendor.id));

      // Email vendor
      sendVendorPayoutProcessedEmail(vendor.email, vendor.contactName || vendor.storeName, amount.toFixed(2), payout.currency, String(reference), "en")
        .catch(e => console.error("[Email] Payout email failed:", e));

      return NextResponse.json({ success: true, message: "Payout marked as paid" });
    } else {
      await db.update(vendorPayouts).set({
        status: "rejected",
        note: String(note || "").slice(0, 500),
      }).where(eq(vendorPayouts.id, payoutId));
      return NextResponse.json({ success: true, message: "Payout rejected" });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}