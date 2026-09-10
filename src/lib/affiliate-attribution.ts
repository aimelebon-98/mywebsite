import { cookies } from "next/headers";
import { db } from "@/db";
import { affiliates, affiliateOrders, subscriptions, orders } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";

interface AffiliateOrderParams {
  orderId: string;
  subtotalUsd: number;
  customerEmail?: string | null;
  customerPhone?: string | null;
  affiliateCode?: string | null;
  currency?: string;
}

/**
 * Checks if an affiliate currently has an active subscription for SMZ AI Trading Bot.
 */
async function isAffiliateSubscriptionActive(affiliateEmail: string): Promise<boolean> {
  if (!affiliateEmail) return false;
  try {
    const cleanEmail = affiliateEmail.toLowerCase().trim();
    const rows = await db
      .select({ status: subscriptions.status, expiresAt: subscriptions.expiresAt })
      .from(subscriptions)
      .where(and(eq(subscriptions.customerEmail, cleanEmail), eq(subscriptions.status, "active")))
      .limit(1);

    if (rows.length === 0) return false;
    const sub = rows[0];
    if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) return false;
    return true;
  } catch (e) {
    console.error("[Affiliate] Active subscription check error:", e);
    return false;
  }
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

    // 1. Read from cookie if code not passed explicitly
    if (!code) {
      try {
        const cookieStore = await cookies();
        code = cookieStore.get("ndz_affiliate")?.value || null;
      } catch {
        code = null;
      }
    }

    if (!code) {
      console.log(`[Affiliate] No referral cookie found for order ${orderId}`);
      return { success: false, reason: "No affiliate referral code found" };
    }

    const cleanCode = String(code).trim().toLowerCase();

    // 2. Fetch Level 1 Affiliate (Case-insensitive match with LOWER)
    const [l1Affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(sql`LOWER(${affiliates.code})`, cleanCode))
      .limit(1);

    if (!l1Affiliate) {
      console.warn(`[Affiliate] No affiliate found matching code '${code}'`);
      return { success: false, reason: `Affiliate matching code '${code}' not found` };
    }

    // Allow approved or active affiliates (non-suspended/rejected)
    if (l1Affiliate.status === "suspended" || l1Affiliate.status === "rejected") {
      console.warn(`[Affiliate] Affiliate ${cleanCode} is ${l1Affiliate.status}`);
      return { success: false, reason: `Affiliate is ${l1Affiliate.status}` };
    }

    // 3. Anti-fraud self-referral prevention
    if (
      customerEmail &&
      l1Affiliate.email &&
      customerEmail.toLowerCase().trim() === l1Affiliate.email.toLowerCase().trim()
    ) {
      console.warn(`[Affiliate] Blocked self-referral by email for code ${cleanCode}`);
      return { success: false, reason: "Self-referral blocked (email match)" };
    }

    if (
      customerPhone &&
      l1Affiliate.phone &&
      customerPhone.replace(/\D/g, "") === l1Affiliate.phone.replace(/\D/g, "") &&
      customerPhone.replace(/\D/g, "").length >= 7
    ) {
      console.warn(`[Affiliate] Blocked self-referral by phone for code ${cleanCode}`);
      return { success: false, reason: "Self-referral blocked (phone match)" };
    }

    // 4. Duplicate attribution prevention
    const existing = await db
      .select()
      .from(affiliateOrders)
      .where(eq(affiliateOrders.orderId, String(orderId)))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, reason: "Order already attributed" };
    }

    // 5. Check if the order contains SMZ AI Trading Bot
    let isSmzBot = false;
    try {
      const [orderRow] = await db.select({ items: orders.items }).from(orders).where(eq(orders.id, orderId)).limit(1);
      if (orderRow?.items) {
        const parsedItems = typeof orderRow.items === "string" ? JSON.parse(orderRow.items) : orderRow.items;
        isSmzBot = Array.isArray(parsedItems) && parsedItems.some((it: any) =>
          (it.name || "").toLowerCase().includes("smz") ||
          (it.productId || "").toLowerCase().includes("smz") ||
          (it.slug || "").toLowerCase().includes("smz")
        );
      }
    } catch {
      isSmzBot = false;
    }

    // Rate: 50% for SMZ Bot, or custom affiliate rate / default 5%
    let l1Rate = isSmzBot ? 50.0 : parseFloat(l1Affiliate.commissionRate || "5.00");
    if (isNaN(l1Rate) || l1Rate <= 0) l1Rate = 5.0;

    const l1CommissionNum = Math.round(subtotalUsd * (l1Rate / 100) * 100) / 100;
    const l1CommissionStr = l1CommissionNum.toFixed(2);
    const subtotalStr = subtotalUsd.toFixed(2);

    // Record Level 1 order & update affiliate balances
    const [l1AffOrder] = await db
      .insert(affiliateOrders)
      .values({
        orderId: String(orderId),
        affiliateId: l1Affiliate.id,
        subtotal: subtotalStr,
        commissionRate: String(l1Rate),
        commissionAmount: l1CommissionStr,
        currency,
        status: "pending",
      })
      .returning();

    const curEarnings = parseFloat(l1Affiliate.totalEarnings || "0");
    const curPending = parseFloat(l1Affiliate.pendingPayout || "0");

    await db
      .update(affiliates)
      .set({
        totalOrders: sql`${affiliates.totalOrders} + 1`,
        totalEarnings: (curEarnings + l1CommissionNum).toFixed(2),
        pendingPayout: (curPending + l1CommissionNum).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(affiliates.id, l1Affiliate.id));

    console.log(`[Affiliate] Attributed order ${orderId} ($${subtotalUsd}) to ${l1Affiliate.email} (${cleanCode}) -> +$${l1CommissionStr} (${l1Rate}%)`);

    const resultSummary: Record<string, any> = {
      success: true,
      isSmzBot,
      level1: {
        affiliateId: l1Affiliate.id,
        code: l1Affiliate.code,
        rate: l1Rate,
        commission: l1CommissionStr,
        orderId: l1AffOrder.id,
      },
    };

    // -------------------------------------------------------------
    // LEVEL 2 & LEVEL 3 MULTI-TIER OVERRIDES (SMZ BOT ONLY)
    // -------------------------------------------------------------
    if (isSmzBot && l1Affiliate.parentAffiliateId) {
      const [l2Affiliate] = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.id, l1Affiliate.parentAffiliateId))
        .limit(1);

      if (l2Affiliate && l2Affiliate.status !== "suspended" && l2Affiliate.status !== "rejected") {
        const l2IsActive = await isAffiliateSubscriptionActive(l2Affiliate.email);
        if (l2IsActive) {
          const l2Rate = 10.0;
          const l2CommNum = Math.round(subtotalUsd * (l2Rate / 100) * 100) / 100;

          await db.insert(affiliateOrders).values({
            orderId: `${orderId}_L2`,
            affiliateId: l2Affiliate.id,
            subtotal: subtotalStr,
            commissionRate: String(l2Rate),
            commissionAmount: l2CommNum.toFixed(2),
            currency,
            status: "pending",
          });

          const l2CurE = parseFloat(l2Affiliate.totalEarnings || "0");
          const l2CurP = parseFloat(l2Affiliate.pendingPayout || "0");

          await db
            .update(affiliates)
            .set({
              totalEarnings: (l2CurE + l2CommNum).toFixed(2),
              pendingPayout: (l2CurP + l2CommNum).toFixed(2),
              updatedAt: new Date(),
            })
            .where(eq(affiliates.id, l2Affiliate.id));

          resultSummary.level2 = { affiliateId: l2Affiliate.id, rate: l2Rate, commission: l2CommNum.toFixed(2), active: true };
        }

        if (l2Affiliate.parentAffiliateId) {
          const [l3Affiliate] = await db
            .select()
            .from(affiliates)
            .where(eq(affiliates.id, l2Affiliate.parentAffiliateId))
            .limit(1);

          if (l3Affiliate && l3Affiliate.status !== "suspended" && l3Affiliate.status !== "rejected") {
            const l3IsActive = await isAffiliateSubscriptionActive(l3Affiliate.email);
            if (l3IsActive) {
              const l3Rate = 5.0;
              const l3CommNum = Math.round(subtotalUsd * (l3Rate / 100) * 100) / 100;

              await db.insert(affiliateOrders).values({
                orderId: `${orderId}_L3`,
                affiliateId: l3Affiliate.id,
                subtotal: subtotalStr,
                commissionRate: String(l3Rate),
                commissionAmount: l3CommNum.toFixed(2),
                currency,
                status: "pending",
              });

              const l3CurE = parseFloat(l3Affiliate.totalEarnings || "0");
              const l3CurP = parseFloat(l3Affiliate.pendingPayout || "0");

              await db
                .update(affiliates)
                .set({
                  totalEarnings: (l3CurE + l3CommNum).toFixed(2),
                  pendingPayout: (l3CurP + l3CommNum).toFixed(2),
                  updatedAt: new Date(),
                })
                .where(eq(affiliates.id, l3Affiliate.id));

              resultSummary.level3 = { affiliateId: l3Affiliate.id, rate: l3Rate, commission: l3CommNum.toFixed(2), active: true };
            }
          }
        }
      }
    }

    return resultSummary;
  } catch (error) {
    console.error("Affiliate attribution error:", error);
    return { success: false, error };
  }
}
