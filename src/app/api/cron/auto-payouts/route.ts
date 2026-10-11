import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliatePayouts } from "@/db/schema";
import { sql } from "drizzle-orm";
import { ensureAffiliateTablesExist } from "@/lib/ensure-affiliate-tables";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await ensureAffiliateTablesExist();

    // Fetch all affiliates who are not rejected/suspended
    const activeAffiliates = await db
      .select()
      .from(affiliates)
      .where(sql`${affiliates.status} NOT IN ('rejected', 'suspended') OR ${affiliates.status} IS NULL`);

    let processedCount = 0;
    let totalWithdrawnUsd = 0;
    const details = [];

    const todayStr = new Date().toISOString().split("T")[0].replace(/-/g, "");

    for (const aff of activeAffiliates) {
      const pendingVal = parseFloat(aff.pendingPayout || "0");
      if (pendingVal < 20) continue;

      const walletOrBank = aff.bankAccount || aff.bankName || aff.phone || aff.whatsapp;
      if (!walletOrBank) continue;

      const payoutRef = `AUTO-FRI-${todayStr}-${(aff.code || "NDZ").toUpperCase()}`;

      try {
        const [payoutRow] = await db
          .insert(affiliatePayouts)
          .values({
            affiliateId: aff.id,
            amount: pendingVal.toFixed(2),
            currency: aff.preferredCurrency || "USD",
            method: aff.bankAccount ? "USDT (TRC20)" : "bank_transfer",
            reference: payoutRef,
            note: "Automatic Friday 12 AM Commission Withdrawal",
            status: "pending",
          })
          .returning();

        const curPaid = parseFloat(aff.totalPaidOut || "0");
        await db
          .update(affiliates)
          .set({
            pendingPayout: "0.00",
            totalPaidOut: (curPaid + pendingVal).toFixed(2),
            updatedAt: new Date(),
          })
          .where(sql`${affiliates.id} = ${aff.id}`);

        processedCount++;
        totalWithdrawnUsd += pendingVal;
        details.push({
          affiliateId: aff.id,
          email: aff.email,
          code: aff.code,
          amount: pendingVal.toFixed(2),
          payoutId: payoutRow?.id,
        });
      } catch (itemErr) {
        console.error(`Error processing auto-payout for affiliate ${aff.id}:`, itemErr);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processedCount,
      totalWithdrawnUsd: totalWithdrawnUsd.toFixed(2),
      details,
    });
  } catch (error: any) {
    console.error("[Auto-Payouts Cron Error]:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}