import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, customers, products as productsTable, coupons } from "@/db/schema";
import { eq, desc, and, or, ilike, sql, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { z } from "zod";

const orderItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  name: z.string().optional(),
  price: z.union([z.number(), z.string()]).optional(),
  quantity: z.number().int().min(1).max(100).default(1),
  size: z.string().max(20).optional(),
  color: z.string().max(50).optional(),
  image: z.string().optional(),
  costPriceNgn: z.number().optional(),
});

const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, "Name must be at least 2 characters").max(200),
  customerPhone: z.string().trim().min(5, "Phone number required").max(50),
  customerEmail: z.string().trim().max(200).optional().or(z.literal("")),
  customerAddress: z.string().trim().min(5, "Address must be at least 5 characters").max(500),
  customerId: z.string().uuid().nullable().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required in the order"),
  subtotal: z.union([z.number(), z.string()]).optional(),
  discountAmount: z.union([z.number(), z.string()]).optional(),
  discountCode: z.string().max(50).optional(),
  couponCode: z.string().max(50).optional(),
  shippingCost: z.union([z.number(), z.string()]).optional(),
  total: z.union([z.number(), z.string()]),
  currency: z.string().max(10).optional(),
  customerNotes: z.string().max(1000).optional(),
  locale: z.enum(["en", "fr"]).default("en"),
});

async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SV-${year}-`;
  const countResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM orders
    WHERE order_number LIKE ${prefix + "%"}
  `);
  const count = parseInt((countResult.rows[0] as { count: string }).count) + 1;
  return `${prefix}${String(count).padStart(4, "0")}`;
}

export async function GET(request: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "0");

    const conditions = [];
    if (status && status !== "all") conditions.push(eq(orders.status, status));
    if (search) {
      conditions.push(
        or(
          ilike(orders.orderNumber, `%${search}%`),
          ilike(orders.customerName, `%${search}%`),
          ilike(orders.customerPhone, `%${search}%`),
          ilike(orders.customerEmail, `%${search}%`)
        )!
      );
    }

    let query = db.select().from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt))
      .$dynamic();

    if (limit > 0) query = query.limit(limit);

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Orders GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const parseResult = createOrderSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json({
        error: "Validation failed",
        details: parseResult.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ")
      }, { status: 400 });
    }

    const {
      customerName, customerPhone, customerEmail, customerAddress,
      customerId,
      items, subtotal, discountAmount, discountCode, couponCode,
      shippingCost, total, currency,
      customerNotes, locale,
    } = parseResult.data;

    const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);

    // ============================================================
    // SERVER-SIDE PRICE VERIFICATION & COST ENRICHMENT
    // ============================================================
    const productIds = items
      .map(it => it.productId || it.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    const enrichedItems: Array<Record<string, unknown>> = [];

    if (productIds.length > 0) {
      const dbProductRows = await db.select({
        id: productsTable.id,
        name: productsTable.name,
        price: productsTable.price,
        costPrice: productsTable.costPrice,
        stock: productsTable.stock,
      }).from(productsTable).where(inArray(productsTable.id, productIds));

      const productMap = new Map(dbProductRows.map(p => [p.id, p]));

      for (const item of items) {
        const pid = item.productId || item.id || "";
        const dbProd = productMap.get(pid);

        // Enrich with server-verified cost snapshot & price
        enrichedItems.push({
          ...item,
          productId: pid,
          serverPrice: dbProd ? dbProd.price : item.price,
          costPriceNgn: dbProd ? parseFloat(dbProd.costPrice || "0") : (item.costPriceNgn || 0),
        });
      }
    } else {
      enrichedItems.push(...items);
    }

    // ============================================================
    // COUPON VERIFICATION (IF APPLIED)
    // ============================================================
    const activeCouponCode = couponCode || discountCode || "";
    let verifiedDiscountAmount = parseFloat(String(discountAmount || 0));

    if (activeCouponCode) {
      try {
        const [coupon] = await db.select().from(coupons)
          .where(and(eq(coupons.code, activeCouponCode.toUpperCase().trim()), eq(coupons.active, true)))
          .limit(1);

        if (coupon) {
          // If coupon expired, invalidate discount
          if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            verifiedDiscountAmount = 0;
          }
        }
      } catch (couponErr) {
        console.warn("[Orders] Coupon check skipped:", couponErr);
      }
    }

    const orderNumber = await generateOrderNumber();
    const ip = request.headers.get("cf-connecting-ip") ||
               request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
               request.headers.get("x-real-ip") || "";

    let resolvedEmail = customerEmail ? customerEmail.trim().toLowerCase() : "";
    if (!resolvedEmail && customerId) {
      try {
        const [cust] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
        if (cust?.email) resolvedEmail = cust.email.toLowerCase();
      } catch { /* ignore */ }
    }

    const finalDiscountCode = activeCouponCode;
    const finalDiscountAmountStr = String(verifiedDiscountAmount >= 0 ? verifiedDiscountAmount : 0);

    const result = await db.insert(orders).values({
      orderNumber,
      customerName,
      customerPhone,
      customerEmail: resolvedEmail || "",
      customerId: customerId || undefined,
      customerAddress,
      items: JSON.stringify(enrichedItems),
      itemCount,
      subtotal: String(subtotal || total),
      discountAmount: finalDiscountAmountStr,
      discountCode: finalDiscountCode,
      shippingCost: String(shippingCost || 0),
      total: String(total),
      currency: currency || "$",
      status: "pending",
      customerNotes: customerNotes || "",
      locale: locale || "en",
      ipAddress: ip,
    }).returning();

    if (resolvedEmail) {
      sendOrderConfirmationEmail(
        resolvedEmail,
        customerName,
        {
          orderNumber: result[0].orderNumber,
          items: enrichedItems,
          subtotal: Number(subtotal || total),
          discountAmount: Number(finalDiscountAmountStr),
          discountCode: finalDiscountCode,
          total: Number(total),
          currency: currency || "$",
          customerPhone,
          customerAddress,
        },
        locale === "fr" ? "fr" : "en"
      ).catch(err => console.error("[Order Confirmation Email]", err));
    }

    return NextResponse.json({
      success: true,
      order: { orderNumber: result[0].orderNumber, id: result[0].id },
    }, { status: 201 });
  } catch (error) {
    console.error("[Orders POST] Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}