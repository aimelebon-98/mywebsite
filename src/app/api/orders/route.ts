import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, customers, products as productsTable, coupons } from "@/db/schema";
import { eq, desc, and, or, ilike, sql, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from "@/lib/email";
import { z } from "zod";

export const dynamic = "force-dynamic";

let orderColsChecked = false;
async function ensureOrderColumns() {
  if (orderColsChecked) return;
  try {
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id uuid`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS items text NOT NULL DEFAULT '[]'`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS item_count integer NOT NULL DEFAULT 0`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal numeric(10,2) NOT NULL DEFAULT 0`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) NOT NULL DEFAULT 0`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost numeric(10,2) NOT NULL DEFAULT 0`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS total numeric(10,2) NOT NULL DEFAULT 0`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT '$'`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_carrier text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at timestamp`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at timestamp`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_notes text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'en'`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS ip_address text NOT NULL DEFAULT ''`);
    orderColsChecked = true;
  } catch (e) {
    console.error("[Orders] Failed to ensure order columns:", e);
  }
}

const orderItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  name: z.string().optional(),
  price: z.union([z.number(), z.string()]).optional(),
  quantity: z.number().int().min(1).max(100).default(1),
  size: z.string().max(20).optional(),
  color: z.string().max(50).optional(),
  image: z.string().optional(),
  imageUrl: z.string().optional(),
  costPriceNgn: z.number().optional(),
  subtotal: z.union([z.number(), z.string()]).optional(),
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
  discountCode: z.string().max(50).optional().nullable(),
  couponCode: z.string().max(50).optional().nullable(),
  shippingCost: z.union([z.number(), z.string()]).optional(),
  total: z.union([z.number(), z.string()]),
  currency: z.string().max(10).optional(),
  customerNotes: z.string().max(1000).optional().nullable(),
  locale: z.enum(["en", "fr"]).default("en"),
  displayCurrency: z.string().optional(),
  bundleName: z.string().optional().nullable(),
  couponDiscount: z.union([z.number(), z.string()]).optional(),
});

async function generateNextOrderNumber(offset = 0): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SV-${year}-`;
  try {
    const result = await db.execute(sql`
      SELECT order_number FROM orders
      WHERE order_number LIKE ${prefix + "%"}
      ORDER BY created_at DESC, id DESC
      LIMIT 100
    `);

    let maxNum = 0;
    const rows = (result.rows || result) as Array<{ order_number?: string }>;
    for (const row of rows) {
      if (row?.order_number) {
        const parts = row.order_number.split("-");
        const num = parseInt(parts[parts.length - 1] || "0", 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    const nextNum = maxNum + 1 + offset;
    return `${prefix}${String(nextNum).padStart(4, "0")}`;
  } catch (e) {
    const rnd = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${rnd}`;
  }
}

export async function GET(request: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    await ensureOrderColumns();
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
    await ensureOrderColumns();
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

    const itemCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

    const productIds = items
      .map(it => it.productId || it.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    const enrichedItems: Array<Record<string, unknown>> = [];

    if (productIds.length > 0) {
      try {
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
          enrichedItems.push({
            ...item,
            productId: pid,
            image: item.image || item.imageUrl || "",
            serverPrice: dbProd ? dbProd.price : item.price,
            costPriceNgn: dbProd ? parseFloat(dbProd.costPrice || "0") : (item.costPriceNgn || 0),
          });
        }
      } catch (enrichErr) {
        console.warn("[Orders] Product enrichment skipped:", enrichErr);
        enrichedItems.push(...items.map(it => ({ ...it, image: it.image || it.imageUrl || "" })));
      }
    } else {
      enrichedItems.push(...items.map(it => ({ ...it, image: it.image || it.imageUrl || "" })));
    }

    const activeCouponCode = (couponCode || discountCode || "").toString();
    let verifiedDiscountAmount = parseFloat(String(discountAmount || 0));
    if (isNaN(verifiedDiscountAmount)) verifiedDiscountAmount = 0;

    if (activeCouponCode) {
      try {
        const [coupon] = await db.select().from(coupons)
          .where(and(eq(coupons.code, activeCouponCode.toUpperCase().trim()), eq(coupons.active, true)))
          .limit(1);
        if (coupon && coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          verifiedDiscountAmount = 0;
        }
      } catch (couponErr) {
        console.warn("[Orders] Coupon check skipped:", couponErr);
      }
    }

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

    // Attempt insertion with retry on order_number collision
    let insertedOrder = null;
    let attempt = 0;
    while (!insertedOrder && attempt < 5) {
      const orderNumber = await generateNextOrderNumber(attempt);
      try {
        const [row] = await db.insert(orders).values({
          orderNumber,
          customerName,
          customerPhone,
          customerEmail: resolvedEmail || "",
          customerId: customerId || null,
          customerAddress,
          items: JSON.stringify(enrichedItems),
          itemCount,
          subtotal: String(subtotal || total),
          discountAmount: finalDiscountAmountStr,
          discountCode: finalDiscountCode,
          shippingCost: String(shippingCost || 0),
          total: String(total),
          currency: currency || "USD",
          status: "pending",
          customerNotes: customerNotes || "",
          locale: locale || "en",
          ipAddress: ip,
        }).returning();
        insertedOrder = row;
      } catch (insertErr: any) {
        if (insertErr?.message?.includes("unique") || insertErr?.message?.includes("order_number")) {
          attempt++;
        } else {
          throw insertErr;
        }
      }
    }

    if (!insertedOrder) {
      return NextResponse.json({ error: "Failed to generate unique order number. Try again." }, { status: 500 });
    }

    if (resolvedEmail) {
      sendOrderConfirmationEmail(
        resolvedEmail,
        customerName,
        {
          orderNumber: insertedOrder.orderNumber,
          items: enrichedItems,
          subtotal: Number(subtotal || total),
          discountAmount: Number(finalDiscountAmountStr),
          discountCode: finalDiscountCode,
          total: Number(total),
          currency: currency || "USD",
          customerPhone,
          customerAddress,
        },
        locale === "fr" ? "fr" : "en"
      ).catch(err => console.error("[Order Confirmation Email]", err));
    }

    // Send Admin Notification Email
    sendAdminNewOrderEmail(
      process.env.ADMIN_NOTIFICATION_EMAIL || "komlaimelebon@gmail.com",
      {
        orderNumber: insertedOrder.orderNumber,
        customerName,
        customerPhone,
        customerAddress,
        items: enrichedItems,
        subtotal: Number(subtotal || total),
        discountAmount: Number(finalDiscountAmountStr),
        discountCode: finalDiscountCode,
        total: Number(total),
        currency: currency || "USD",
        locale,
      }
    ).catch(err => console.error("[Admin Order Notification Email]", err));

    return NextResponse.json({
      success: true,
      order: { orderNumber: insertedOrder.orderNumber, id: insertedOrder.id },
    }, { status: 201 });
  } catch (error) {
    console.error("[Orders POST] Error creating order:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}