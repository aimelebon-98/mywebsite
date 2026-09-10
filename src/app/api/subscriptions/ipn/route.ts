import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, cryptoPayments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSubscriptionTablesExist } from "@/lib/ensure-subscription-tables";
import { isPaidStatus, mapNowStatusToLocal } from "@/lib/nowpayments";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function verifyIpnSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET || "";
  if (!secret) { console.warn("[IPN] NOWPAYMENTS_IPN_SECRET not set, skipping sig check"); return true; }
  if (!signature) return false;
  const hmac = crypto.createHmac("sha512", secret);
  hmac.update(rawBody);
  return hmac.digest("hex") === signature;
}

export async function POST(request: NextRequest) {
  try {
    await ensureSubscriptionTablesExist();
    const rawBody = await request.text();
    const signature = request.headers.get("x-nowpayments-sig");
    if (!verifyIpnSignature(rawBody, signature)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

    const payload = JSON.parse(rawBody);
    const paymentId = String(payload.payment_id || "");
    const orderId = String(payload.order_id || "");
    const paymentStatus = String(payload.payment_status || "");
    if (!paymentId && !orderId) return NextResponse.json({ error: "Missing identifiers" }, { status: 400 });

    let payRow: any = null;
    if (paymentId) { const r = await db.select().from(cryptoPayments).where(eq(cryptoPayments.providerPaymentId, paymentId)).limit(1); payRow = r[0] || null; }
    if (!payRow && orderId) { const r = await db.select().from(cryptoPayments).where(eq(cryptoPayments.orderNumber, orderId)).limit(1); payRow = r[0] || null; }
    if (!payRow) return NextResponse.json({ ok: true, ignored: true });

    const localStatus = mapNowStatusToLocal(paymentStatus);
    const paid = isPaidStatus(paymentStatus);

    await db.update(cryptoPayments).set({
      status: localStatus,
      actuallyPaid: String(payload.actually_paid ?? payRow.actuallyPaid ?? ""),
      outcomeAmount: String(payload.outcome_amount ?? payRow.outcomeAmount ?? ""),
      rawIpn: rawBody, confirmedAt: paid ? new Date() : payRow.confirmedAt, updatedAt: new Date(),
    }).where(eq(cryptoPayments.id, payRow.id));

    if (payRow.subscriptionId) {
      const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, payRow.subscriptionId)).limit(1);
      if (sub) {
        if (paid && sub.status !== "active") {
          await db.update(subscriptions).set({ status: "active", startsAt: new Date(), expiresAt: sub.expiresAt || new Date(), updatedAt: new Date() }).where(eq(subscriptions.id, sub.id));

          // Trigger multi-tier affiliate attribution
          try {
            let meta: any = {};
            try { meta = JSON.parse(sub.metadata || "{}"); } catch {}
            const { processAffiliateAttribution } = await import("@/lib/affiliate-attribution");
            await processAffiliateAttribution({
              orderId: sub.orderNumber,
              orderNumber: sub.orderNumber,
              subtotalUsd: parseFloat(sub.totalPaid || "0"),
              customerEmail: sub.customerEmail,
              customerPhone: sub.customerPhone,
              affiliateCode: meta?.refCode || null,
            });
          } catch (e) {
            console.error("[IPN] Affiliate attribution error:", e);
          }
        } else if (["failed", "expired", "refunded"].includes(localStatus)) {
          await db.update(subscriptions).set({ status: localStatus, updatedAt: new Date() }).where(eq(subscriptions.id, sub.id));
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("IPN error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "IPN failed" }, { status: 500 });
  }
}