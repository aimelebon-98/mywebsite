import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, subscriptions, cryptoPayments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSubscriptionTablesExist } from "@/lib/ensure-subscription-tables";
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
    if (!isNowPaymentsConfigured()) {
      return NextResponse.json({ error: "NOWPAYMENTS_API_KEY not configured." }, { status: 503 });
    }
    const body = await request.json();
    const { productId, months, payCurrency, customerName, customerEmail, customerPhone = "", locale = "en" } = body;
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

    const quote = getTierQuote(config.monthlyPrice, monthsNum);
    const on = orderNumber();
    const expiresAt = addMonths(new Date(), monthsNum);

    const [sub] = await db.insert(subscriptions).values({
      orderNumber: on, productId: product.id, productName: product.name,
      customerEmail: String(customerEmail).toLowerCase().trim(),
      customerName: String(customerName).trim(),
      customerPhone: String(customerPhone || "").trim(),
      months: monthsNum, monthlyPrice: String(quote.monthlyPrice),
      discountPercent: String(quote.discountPercent), discountFlat: String(quote.discountFlat),
      totalPaid: String(quote.total), currency: "USD", cryptoCurrency: payCur,
      status: "pending", startsAt: null, expiresAt, paymentProvider: "nowpayments",
      metadata: JSON.stringify({ locale, quote }),
    }).returning();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.newdealzone.com";
    const payment = await createNowPayment({
      priceAmount: quote.total, priceCurrency: "usd", payCurrency: payCur,
      orderId: on, orderDescription: `${product.name} - ${monthsNum}mo subscription`,
      ipnCallbackUrl: `${siteUrl}/api/subscriptions/ipn`,
      successUrl: `${siteUrl}/${locale}/subscribe/success?order=${encodeURIComponent(on)}`,
      cancelUrl: `${siteUrl}/${locale}/product/${product.slug}`,
    });

    const [cryptoPay] = await db.insert(cryptoPayments).values({
      subscriptionId: sub.id, orderNumber: on, provider: "nowpayments",
      providerPaymentId: String(payment.payment_id),
      payAddress: payment.pay_address || "", payCurrency: payment.pay_currency || payCur,
      payAmount: String(payment.pay_amount || ""), priceAmount: String(quote.total),
      priceCurrency: "USD", status: payment.payment_status || "waiting",
      expiresAt: payment.expiration_estimate_date ? new Date(payment.expiration_estimate_date) : null,
    }).returning();

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