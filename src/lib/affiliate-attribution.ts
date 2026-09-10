import { cookies } from "next/headers";
import { db } from "@/db";
import { affiliates, affiliateOrders, subscriptions, orders } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";

interface AffiliateOrderParams {
  orderId: string;
  orderNumber?: string | null;
  subtotalUsd: number;
  customerEmail?: string | null;
  customerPhone?: string | null;
  affiliateCode?: string | null;
  currency?: string;
}

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
  orderNumber,
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
      console.log(`[Affiliate] No referral code found for order ${orderId} (${orderNumber || "no-num"})`);
      return { success: false, reason: "No affiliate referral code found" };
    }

    const cleanCode = String(code).trim().toLowerCase();

    // 2. Fetch Level 1 Affiliate
    const [l1Affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(sql`LOWER(${affiliates.code})`, cleanCode))
      .limit(1);

    if (!l1Affiliate) {
      console.warn(`[Affiliate] No affiliate found matching code '${code}'`);
      return { success: false, reason: `Affiliate matching code '${code}' not found` };
    }

    if (l1Affiliate.status === "suspended" || l1Affiliate.status === "rejected") {
      console.warn(`[Affiliate] Affiliate ${cleanCode} is ${l1Affiliate.status}`);
      return { success: false, reason: `Affiliate is ${l1Affiliate.status}` };
    }

    // 3. Duplicate attribution prevention (check both orderId and orderNumber)
    const trackedOrderRef = String(orderNumber || orderId);
    const existing = await db
      .select()
      .from(affiliateOrders)
      .where(eq(affiliateOrders.orderId, trackedOrderRef))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, reason: "Order already attributed" };
    }

    // 4. Check if the order contains SMZ AI Trading Bot
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

    // Commission rate: 50% for SMZ Bot, or affiliate rate, default 5%
    let l1Rate = isSmzBot ? 50.0 : parseFloat(l1Affiliate.commissionRate || "5.00");
    if (isNaN(l1Rate) || l1Rate <= 0) l1Rate = 5.0;

    const l1CommissionNum = Math.round(subtotalUsd * (l1Rate / 100) * 100) / 100;
    const l1CommissionStr = l1CommissionNum.toFixed(2);
    const subtotalStr = subtotalUsd.toFixed(2);

    // 5. Insert Level 1 affiliate order
    const [l1AffOrder] = await db
      .insert(affiliateOrders)
      .values({
        orderId: trackedOrderRef,
        affiliateId: l1Affiliate.id,
        subtotal: subtotalStr,
        commissionRate: String(l1Rate),
        commissionAmount: l1CommissionStr,
        currency,
        status: "pending",
      })
      .returning();

    // 6. Update affiliate balances & total orders
    const curEarnings = parseFloat(l1Affiliate.totalEarnings || "0");
    const curPending = parseFloat(l1Affiliate.pendingPayout || "0");

    await db
      .update(affiliates)
      .set({
        totalOrders: sql`COALESCE(${affiliates.totalOrders}, 0) + 1`,
        totalEarnings: (curEarnings + l1CommissionNum).toFixed(2),
        pendingPayout: (curPending + l1CommissionNum).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(affiliates.id, l1Affiliate.id));

    console.log(`[Affiliate] SUCCESS! Credited order ${trackedOrderRef} ($${subtotalUsd}) to ${l1Affiliate.email} (${cleanCode}) -> +$${l1CommissionStr} (${l1Rate}%)`);

    const resultSummary: Record<string, any> = {
      success: true,
      isSmzBot,
      level1: {
        affiliateId: l1Affiliate.id,
        code: l1Affiliate.code,
        rate: l1Rate,
        commission: l1CommissionStr,
        orderId: l1AffOrder?.id || trackedOrderRef,
      },
    };

    // -------------------------------------------------------------
    // MULTI-TIER COMMISSION (SMZ BOT ONLY)
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
            orderId: `${trackedOrderRef}_L2`,
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
      }
    }

    return resultSummary;
  } catch (error) {
    console.error("Affiliate attribution error:", error);
    return { success: false, error: String(error) };
  }
}