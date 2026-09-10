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

    // 1. Fetch Level 1 Affiliate
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

    // 2. Duplicate attribution prevention
    const trackedOrderRef = String(orderNumber || orderId);
    const existing = await db
      .select()
      .from(affiliateOrders)
      .where(eq(affiliateOrders.orderId, trackedOrderRef))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, reason: "Order already attributed" };
    }

    // 3. Check if order contains SMZ Bot or is a subscription
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

    if (!isSmzBot && (trackedOrderRef.startsWith("SUB-") || trackedOrderRef.toLowerCase().includes("sub"))) {
      isSmzBot = true;
    }

    // Rate: 50% for SMZ Bot (L1), 5% for Physical products
    let l1Rate = isSmzBot ? 50.0 : parseFloat(l1Affiliate.commissionRate || "5.00");
    if (isNaN(l1Rate) || l1Rate <= 0) l1Rate = 5.0;

    const l1CommissionNum = Math.round(subtotalUsd * (l1Rate / 100) * 100) / 100;
    const l1CommissionStr = l1CommissionNum.toFixed(2);
    const subtotalStr = subtotalUsd.toFixed(2);

    // DIGITAL/SUBSCRIPTIONS ARE CONFIRMED IMMEDIATELY ON PAYMENT
    // PHYSICAL COD ORDERS ARE 'PENDING' UNTIL DELIVERED
    const initialStatus = isSmzBot ? "confirmed" : "pending";

    // Insert Level 1 affiliate order
    const [l1AffOrder] = await db
      .insert(affiliateOrders)
      .values({
        orderId: trackedOrderRef,
        affiliateId: l1Affiliate.id,
        subtotal: subtotalStr,
        commissionRate: String(l1Rate),
        commissionAmount: l1CommissionStr,
        currency,
        status: initialStatus,
      })
      .returning();

    // Increment click/order counters
    await db
      .update(affiliates)
      .set({
        totalOrders: sql`COALESCE(${affiliates.totalOrders}, 0) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(affiliates.id, l1Affiliate.id));

    // ONLY CREDIT AVAILABLE BALANCE IMMEDIATELY IF CONFIRMED (DIGITAL)
    if (initialStatus === "confirmed") {
      const curEarnings = parseFloat(l1Affiliate.totalEarnings || "0");
      const curPending = parseFloat(l1Affiliate.pendingPayout || "0");

      await db
        .update(affiliates)
        .set({
          totalEarnings: (curEarnings + l1CommissionNum).toFixed(2),
          pendingPayout: (curPending + l1CommissionNum).toFixed(2),
        })
        .where(eq(affiliates.id, l1Affiliate.id));
    }

    console.log(`[Affiliate] Credited L1 order ${trackedOrderRef} ($${subtotalUsd}) to ${l1Affiliate.email} -> +$${l1CommissionStr} (${l1Rate}%, status: ${initialStatus})`);

    const resultSummary: Record<string, any> = {
      success: true,
      isSmzBot,
      status: initialStatus,
      level1: {
        affiliateId: l1Affiliate.id,
        code: l1Affiliate.code,
        rate: l1Rate,
        commission: l1CommissionStr,
        orderId: l1AffOrder?.id || trackedOrderRef,
      },
    };

    // MULTI-TIER OVERRIDES (SMZ BOT ONLY)
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
            status: "confirmed",
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

          resultSummary.level2 = { affiliateId: l2Affiliate.id, rate: l2Rate, commission: l2CommNum.toFixed(2) };

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
                  orderId: `${trackedOrderRef}_L3`,
                  affiliateId: l3Affiliate.id,
                  subtotal: subtotalStr,
                  commissionRate: String(l3Rate),
                  commissionAmount: l3CommNum.toFixed(2),
                  currency,
                  status: "confirmed",
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

                resultSummary.level3 = { affiliateId: l3Affiliate.id, rate: l3Rate, commission: l3CommNum.toFixed(2) };
              }
            }
          }
        }
      }
    }

    return resultSummary;
  } catch (error) {
    console.error("Affiliate attribution error:", error);
    return { success: false, error: String(error) };
  }
}

// Confirm pending physical commission on delivery
export async function confirmAffiliateCommissionOnDelivery(orderRef: string) {
  try {
    const pendingAffOrders = await db
      .select()
      .from(affiliateOrders)
      .where(and(eq(affiliateOrders.orderId, orderRef), eq(affiliateOrders.status, "pending")));

    for (const affOrder of pendingAffOrders) {
      const commAmount = parseFloat(affOrder.commissionAmount || "0");

      // Mark commission confirmed
      await db
        .update(affiliateOrders)
        .set({ status: "confirmed" })
        .where(eq(affiliateOrders.id, affOrder.id));

      // Credit affiliate available balance (pendingPayout)
      const [aff] = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.id, affOrder.affiliateId))
        .limit(1);

      if (aff) {
        const curE = parseFloat(aff.totalEarnings || "0");
        const curP = parseFloat(aff.pendingPayout || "0");

        await db
          .update(affiliates)
          .set({
            totalEarnings: (curE + commAmount).toFixed(2),
            pendingPayout: (curP + commAmount).toFixed(2),
            updatedAt: new Date(),
          })
          .where(eq(affiliates.id, aff.id));

        console.log(`[Affiliate Delivery] Confirmed $${commAmount} commission for affiliate ${aff.email} on order ${orderRef}`);
      }
    }
  } catch (e) {
    console.error("confirmAffiliateCommissionOnDelivery error:", e);
  }
}

// Cancel pending physical commission on order cancellation
export async function cancelAffiliateCommissionOnOrderCancel(orderRef: string) {
  try {
    await db
      .update(affiliateOrders)
      .set({ status: "cancelled" })
      .where(and(eq(affiliateOrders.orderId, orderRef), eq(affiliateOrders.status, "pending")));
  } catch (e) {
    console.error("cancelAffiliateCommissionOnOrderCancel error:", e);
  }
}