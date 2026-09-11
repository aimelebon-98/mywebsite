import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brokerClaims } from "@/db/schema";
import { ensureBrokerClaimTablesExist } from "@/lib/ensure-broker-tables";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await ensureBrokerClaimTablesExist();

    const formData = await req.formData();
    const customerName = (formData.get("customerName") as string) || "";
    const customerEmail = (formData.get("customerEmail") as string) || "";
    const customerPhone = (formData.get("customerPhone") as string) || "";
    const brokerName = (formData.get("brokerName") as string) || "Pocket Option";
    const brokerAccountId = (formData.get("brokerAccountId") as string) || "";
    const depositAmount = (formData.get("depositAmount") as string) || "20.00";
    const file = formData.get("proofFile") as File | null;

    if (!customerName.trim() || !customerEmail.trim() || !brokerAccountId.trim()) {
      return NextResponse.json(
        { error: "Name, email, and broker account ID are required" },
        { status: 400 }
      );
    }

    let proofImage: string | null = null;

    if (file && file.size > 0) {
      try {
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const blob = await put(`broker-proofs/${Date.now()}-${cleanFileName}`, file, {
          access: "public",
        });
        proofImage = blob.url;
      } catch (e) {
        console.error("Vercel blob upload error:", e);
      }
    }

    const [claim] = await db
      .insert(brokerClaims)
      .values({
        customerName: customerName.trim(),
        customerEmail: customerEmail.toLowerCase().trim(),
        customerPhone: customerPhone.trim() || null,
        brokerName: brokerName.trim(),
        brokerAccountId: brokerAccountId.trim(),
        depositAmount: depositAmount.trim(),
        proofImage,
        status: "pending",
      })
      .returning();

    return NextResponse.json({
      success: true,
      claimId: claim.id,
      message: "Claim submitted successfully",
    });
  } catch (error) {
    console.error("Broker claim submit error:", error);
    const msg = error instanceof Error ? error.message : "Failed to submit broker claim";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}