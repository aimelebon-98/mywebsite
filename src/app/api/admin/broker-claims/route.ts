import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brokerClaims, subscriptions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { ensureBrokerClaimTablesExist } from "@/lib/ensure-broker-tables";
import { ensureSubscriptionTablesExist } from "@/lib/ensure-subscription-tables";
import { addMonths } from "@/lib/subscription-pricing";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    await ensureBrokerClaimTablesExist();
    const claims = await db
      .select()
      .from(brokerClaims)
      .orderBy(desc(brokerClaims.createdAt));

    return NextResponse.json({ success: true, claims });
  } catch (error) {
    console.error("Admin fetch broker claims error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    await ensureBrokerClaimTablesExist();
    await ensureSubscriptionTablesExist();

    const { claimId, action, adminNote } = await req.json();

    if (!claimId || !action) {
      return NextResponse.json({ error: "Missing claimId or action" }, { status: 400 });
    }

    const [claim] = await db
      .select()
      .from(brokerClaims)
      .where(eq(brokerClaims.id, claimId))
      .limit(1);

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const now = new Date();

    if (action === "approve") {
      await db
        .update(brokerClaims)
        .set({
          status: "approved",
          adminNote: adminNote || "Approved by Admin - 1 Month Free granted",
          approvedAt: now,
        })
        .where(eq(brokerClaims.id, claimId));

      const orderNumber = `PROMO-BROKER-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
      const expiresAt = addMonths(now, 1);

      await db.insert(subscriptions).values({
        orderNumber,
        productId: "smz-bot-pro",
        productName: "SMZ AI Trading Bot Pro (1 Mo Free Broker Promo)",
        customerEmail: claim.customerEmail.toLowerCase().trim(),
        customerName: claim.customerName,
        customerPhone: claim.customerPhone || "",
        months: 1,
        monthlyPrice: "0.00",
        discountPercent: "100.00",
        discountFlat: "19.99",
        totalPaid: "0.00",
        currency: "USD",
        cryptoCurrency: "broker_promo",
        status: "active",
        startsAt: now,
        expiresAt,
        paymentProvider: "broker_promo",
        metadata: JSON.stringify({ brokerName: claim.brokerName, brokerAccountId: claim.brokerAccountId }),
      });

      return NextResponse.json({
        success: true,
        message: "Claim approved and 1 Month Free Subscription activated!",
      });
    } else {
      await db
        .update(brokerClaims)
        .set({
          status: "rejected",
          adminNote: adminNote || "Rejected - deposit or account not verified",
        })
        .where(eq(brokerClaims.id, claimId));

      return NextResponse.json({ success: true, message: "Claim rejected" });
    }
  } catch (error) {
    console.error("Admin process broker claim error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}