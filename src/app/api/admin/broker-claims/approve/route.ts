import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, subscriptions, brokerClaims } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const claims = await db
      .select()
      .from(brokerClaims)
      .orderBy(desc(brokerClaims.createdAt));
    return NextResponse.json({ claims });
  } catch (error: any) {
    console.error("Error fetching broker claims:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch claims" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const claimId = body.claimId || body.id;
    const action = body.action || (body.status === "rejected" ? "reject" : "approve");

    if (!claimId) {
      return NextResponse.json({ error: "Missing claimId" }, { status: 400 });
    }

    if (action === "reject" || body.status === "rejected") {
      await db
        .update(brokerClaims)
        .set({
          status: "rejected",
        })
        .where(eq(brokerClaims.id, claimId));

      return NextResponse.json({ success: true, message: "Claim rejected successfully" });
    }

    // 1. Fetch claim details
    const [claim] = await db
      .select()
      .from(brokerClaims)
      .where(eq(brokerClaims.id, claimId))
      .limit(1);

    if (!claim) {
      return NextResponse.json({ error: "Broker claim not found" }, { status: 404 });
    }

    // 2. Fetch SMZ product if needed
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.slug, "smz-ai-trading-bot-pro"))
      .limit(1);

    const productId = product ? product.id : "smz-bot-pro";
    const customerEmail = (claim as any).customerEmail || (claim as any).email || "customer@example.com";

    // 3. Create or update subscription using exact schema fields
    const [existingSub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.customerEmail, customerEmail))
      .limit(1);

    if (existingSub) {
      await db
        .update(subscriptions)
        .set({
          status: "active",
        })
        .where(eq(subscriptions.id, existingSub.id));
    } else {
      await db.insert(subscriptions).values({
        customerEmail: customerEmail,
        productId: productId,
        totalPaid: "0.00",
        status: "active",
      });
    }

    // 4. Mark broker claim as approved
    await db
      .update(brokerClaims)
      .set({
        status: "approved",
        approvedAt: new Date(),
      })
      .where(eq(brokerClaims.id, claimId));

    return NextResponse.json({
      success: true,
      message: "Broker claim approved & 1-Month subscription granted successfully!",
    });
  } catch (error: any) {
    console.error("Broker claim approval error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process broker claim approval" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return PATCH(req);
}