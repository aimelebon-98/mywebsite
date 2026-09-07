import { cookies } from "next/headers";
import { db } from "@/db";
import { affiliates, affiliateOrders } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

interface AffiliateOrderParams {
  orderId: string;
  subtotalUsd: number;
  customerEmail?: string | null;
  customerPhone?: string | null;
  affiliateCode?: string | null;
  currency?: string;
}

export async function processAffiliateAttribution({
  orderId,
  subtotalUsd,
  customerEmail,
  customerPhone,
  affiliateCode,
  currency = "USD",
}: AffiliateOrderParams) {
  try {
    let code = affiliateCode;

    // If code was not passed explicitly, read from ndz_affiliate cookie
    if (!code) {
      try {
        const cookieStore = await cookies();
        code = cookieStore.get("ndz_affiliate")?.value || null;
      } catch {
        code = null;
      }
    }

    if (!code) {
      return { success: false, reason: "No affiliate referral code found" };
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Fetch affiliate
    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.code, cleanCode))
      .limit(1);

    if (!affiliate || affiliate.status !== "approved") {
      return { success: false, reason: "Affiliate not found or not approved" };
    }

    // 2. Self-referral prevention (anti-fraud)
    if (
      customerEmail &&
      affiliate.email &&
      customerEmail.toLowerCase().trim() === affiliate.email.toLowerCase().trim()
    ) {
      console.warn(`[Affiliate] Blocked self-referral by email for ${cleanCode}`);
      return { success: false, reason: "Self-referral blocked (email match)" };
    }

    if (
      customerPhone &&
      affiliate.phone &&
      customerPhone.replace(/\D/g, "") === affiliate.phone.replace(/\D/g, "") &&
      customerPhone.replace(/\D/g, "").length >= 7
    ) {
      console.warn(`[Affiliate] Blocked self-referral by phone for ${cleanCode}`);
      return { success: false, reason: "Self-referral blocked (phone match)" };
    }

    // 3. Duplicate attribution prevention
    const existing = await db
      .select()
      .from(affiliateOrders)
      .where(eq(affiliateOrders.orderId, String(orderId)))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, reason: "Order already attributed" };
    }

    // 4. Calculate commission
    const rateNum = parseFloat(affiliate.commissionRate || "5.00");
    const commissionNum = Math.round(subtotalUsd * (rateNum / 100) * 100) / 100;
    const commissionStr = commissionNum.toFixed(2);
    const subtotalStr = subtotalUsd.toFixed(2);

    // 5. Insert affiliateOrders record
    const [affOrder] = await db
      .insert(affiliateOrders)
      .values({
        orderId: String(orderId),
        affiliateId: affiliate.id,
        subtotal: subtotalStr,
        commissionRate: String(rateNum),
        commissionAmount: commissionStr,
        currency,
        status: "pending",
      })
      .returning();

    // 6. Credit affiliate balance & increment total orders
    const curEarnings = parseFloat(affiliate.totalEarnings || "0");
    const curPending = parseFloat(affiliate.pendingPayout || "0");
    const newEarnings = (curEarnings + commissionNum).toFixed(2);
    const newPending = (curPending + commissionNum).toFixed(2);

    await db
      .update(affiliates)
      .set({
        totalOrders: sql`${affiliates.totalOrders} + 1`,
        totalEarnings: newEarnings,
        pendingPayout: newPending,
        updatedAt: new Date(),
      })
      .where(eq(affiliates.id, affiliate.id));

    return {
      success: true,
      affiliateId: affiliate.id,
      code: affiliate.code,
      commissionAmount: commissionStr,
      affiliateOrderId: affOrder.id,
    };
  } catch (error) {
    console.error("Affiliate attribution error:", error);
    return { success: false, error };
  }
}