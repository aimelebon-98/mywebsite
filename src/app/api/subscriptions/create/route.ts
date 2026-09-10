import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, subscriptions, cryptoPayments, affiliates } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { ensureSubscriptionTablesExist } from "@/lib/ensure-subscription-tables";
import { ensureAffiliateTablesExist } from "@/lib/ensure-affiliate-tables";
import { hashAffiliatePassword, generateAffiliateCode } from "@/lib/affiliate-auth";
import { getTierQuote, isSubscriptionProduct, parseSubscriptionConfig, addMonths, type SubscriptionTierMonths } from "@/lib/subscription-pricing";
import { createNowPayment, isNowPaymentsConfigured } from "@/lib/nowpayments";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function orderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `SUB-${ts}-${rnd}`;
}

export async function POST(request: NextRequest) {
  try {
    await ensureSubscriptionTablesExist();
    await ensureAffiliateTablesExist();

    if (!isNowPaymentsConfigured()) {
      return NextResponse.json({ error: "NOWPAYMENTS_API_KEY not configured." }, { status: 503 });
    }

    const body = await request.json();
    const {
      productId,
      months,
      payCurrency,
      customerName,
      customerEmail,
      customerPhone = "",
      autoAffiliate = true,
      refCode = "",
      locale = "en",
    } = body;

    if (!productId || !months || !payCurrency || !customerName || !customerEmail) {
      return NextResponse.json({ error: "productId, months, payCurrency, customerName and customerEmail are required" }, { status: 400 });
    }

    const monthsNum = Number(months) as SubscriptionTierMonths;
    if (![1, 3, 5, 12].includes(monthsNum)) {
      return NextResponse.json({ error: "months must be 1, 3, 5 or 12" }, { status: 400 });
    }

    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product || !product.active) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (!isSubscriptionProduct(product)) return NextResponse.json({ error: "Not a subscription product" }, { status: 400 });

    const config = parseSubscriptionConfig(product.subscriptionConfig);
    const payCur = String(payCurrency).toLowerCase();
    if (!config.allowedCryptos.map((c) => c.toLowerCase()).includes(payCur)) {
      return NextResponse.json({ error: "Unsupported crypto. Use BTC or USDT." }, { status: 400 });
    }

    const cleanEmail = String(customerEmail).toLowerCase().trim();
    const cleanName = String(customerName).trim();
    const cleanPhone = String(customerPhone || "").trim();
    const cleanRef = String(refCode || "").trim().toLowerCase();

    // AUTO-CREATE RECRUIT / DOWNLINE AFFILIATE ACCOUNT IF CHECKED
    let createdAffiliateId: string | null = null;

    if (autoAffiliate) {
      try {
        const existingAff = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.email, cleanEmail))
          .limit(1);

        if (!existingAff.length) {
          // Resolve parent affiliate ID from referrer code
          let parentAffiliateId: string | null = null;
          if (cleanRef) {
            const [parent] = await db
              .select({ id: affiliates.id })
              .from(affiliates)
              .where(
                or(
                  eq(sql`LOWER(${affiliates.code})`, cleanRef),
                  eq(sql`LOWER(${affiliates.email})`, cleanRef)
                )
              )
              .limit(1);
            if (parent) parentAffiliateId = parent.id;
          }

          const tempPassword = crypto.randomBytes(8).toString("hex");
          const passwordHash = await hashAffiliatePassword(tempPassword);

          let code = generateAffiliateCode(cleanName);
          let attempts = 0;
          while (attempts < 5) {
            const dup = await db
              .select({ id: affiliates.id })
              .from(affiliates)
              .where(eq(affiliates.code, code))
              .limit(1);
            if (!dup.length) break;
            code = generateAffiliateCode(cleanName);
            attempts++;
          }

          const [newAff] = await db
            .insert(affiliates)
            .values({
              email: cleanEmail,
              passwordHash,
              name: cleanName,
              code,
              phone: cleanPhone || null,
              commissionRate: "50.00",
              status: "incomplete",
              parentAffiliateId,
              mustChangePassword: true,
            })
            .returning();

          if (newAff) createdAffiliateId = newAff.id;
        } else if (existingAff[0] && !existingAff[0].parentAffiliateId && cleanRef) {
          // Attach parent to existing affiliate if not set yet
          const [parent] = await db
            .select({ id: affiliates.id })
            .from(affiliates)
            .where(
              or(
                eq(sql`LOWER(${affiliates.code})`, cleanRef),
                eq(sql`LOWER(${affiliates.email})`, cleanRef)
              )
            )
            .limit(1);

          if (parent && parent.id !== existingAff[0].id) {
            await db
              .update(affiliates)
              .set({ parentAffiliateId: parent.id })
              .where(eq(affiliates.id, existingAff[0].id));
          }
        }
      } catch (e) {
        console.error("Auto-affiliate recruitment error:", e);
      }
    }

    const quote = getTierQuote(config.monthlyPrice, monthsNum);
    const on = orderNumber();
    const expiresAt = addMonths(new Date(), monthsNum);

    const [sub] = await db
      .insert(subscriptions)
      .values({
        orderNumber: on,
        productId: product.id,
        productName: product.name,
        customerEmail: cleanEmail,
        customerName: cleanName,
        customerPhone: cleanPhone,
        months: monthsNum,
        monthlyPrice: String(quote.monthlyPrice),
        discountPercent: String(quote.discountPercent),
        discountFlat: String(quote.discountFlat),
        totalPaid: String(quote.total),
        currency: "USD",
        cryptoCurrency: payCur,
        status: "pending",
        startsAt: null,
        expiresAt,
        paymentProvider: "nowpayments",
        metadata: JSON.stringify({ locale, quote, autoAffiliate, refCode: cleanRef, createdAffiliateId }),
      })
      .returning();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.newdealzone.com";
    const payment = await createNowPayment({
      priceAmount: quote.total,
      priceCurrency: "usd",
      payCurrency: payCur,
      orderId: on,
      orderDescription: `${product.name} - ${monthsNum}mo subscription`,
      ipnCallbackUrl: `${siteUrl}/api/subscriptions/ipn`,
      successUrl: `${siteUrl}/${locale}/subscribe/success?order=${encodeURIComponent(on)}`,
      cancelUrl: `${siteUrl}/${locale}/product/${product.slug}`,
    });

    const [cryptoPay] = await db
      .insert(cryptoPayments)
      .values({
        subscriptionId: sub.id,
        orderNumber: on,
        provider: "nowpayments",
        providerPaymentId: String(payment.payment_id),
        payAddress: payment.pay_address || "",
        payCurrency: payment.pay_currency || payCur,
        payAmount: String(payment.pay_amount || ""),
        priceAmount: String(quote.total),
        priceCurrency: "USD",
        status: payment.payment_status || "waiting",
        expiresAt: payment.expiration_estimate_date ? new Date(payment.expiration_estimate_date) : null,
      })
      .returning();

    await db.update(subscriptions).set({ paymentId: String(payment.payment_id), updatedAt: new Date() }).where(eq(subscriptions.id, sub.id));

    return NextResponse.json({
      success: true,
      subscription: { id: sub.id, orderNumber: on, months: monthsNum, total: quote.total, expiresAt: expiresAt.toISOString(), status: sub.status },
      payment: { id: cryptoPay.id, providerPaymentId: String(payment.payment_id), payAddress: payment.pay_address, payAmount: payment.pay_amount, payCurrency: payment.pay_currency, status: payment.payment_status, expiresAt: payment.expiration_estimate_date || null },
      quote,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}