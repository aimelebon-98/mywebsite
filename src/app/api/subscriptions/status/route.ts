import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, cryptoPayments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSubscriptionTablesExist } from "@/lib/ensure-subscription-tables";
import { getNowPaymentStatus, isNowPaymentsConfigured, isPaidStatus, mapNowStatusToLocal } from "@/lib/nowpayments";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await ensureSubscriptionTablesExist();
    const orderNumber = request.nextUrl.searchParams.get("order");
    if (!orderNumber) return NextResponse.json({ error: "order is required" }, { status: 400 });

    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.orderNumber, orderNumber)).limit(1);
    if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    const [pay] = await db.select().from(cryptoPayments).where(eq(cryptoPayments.orderNumber, orderNumber)).limit(1);

    if (pay?.providerPaymentId && isNowPaymentsConfigured() && !["confirmed", "finished"].includes((pay.status || "").toLowerCase()) && sub.status !== "active") {
      try {
        const live = await getNowPaymentStatus(pay.providerPaymentId);
        const localStatus = mapNowStatusToLocal(live.payment_status);
        const paid = isPaidStatus(live.payment_status);
        await db.update(cryptoPayments).set({ status: localStatus, actuallyPaid: String(live.actually_paid ?? pay.actuallyPaid ?? ""), updatedAt: new Date(), confirmedAt: paid ? new Date() : pay.confirmedAt }).where(eq(cryptoPayments.id, pay.id));
        if (paid && sub.status !== "active") {
          await db.update(subscriptions).set({ status: "active", startsAt: new Date(), updatedAt: new Date() }).where(eq(subscriptions.id, sub.id));
          sub.status = "active"; sub.startsAt = new Date();
        }
        pay.status = localStatus;
      } catch (e) { console.error("Live status refresh error:", e); }
    }
    return NextResponse.json({ success: true, subscription: sub, payment: pay || null });
  } catch (error) {
    console.error("Status error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}