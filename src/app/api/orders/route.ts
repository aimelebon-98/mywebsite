import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, customers } from "@/db/schema";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { sendOrderConfirmationEmail } from "@/lib/email";

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
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName, customerPhone, customerEmail, customerAddress,
      customerId,
      items, subtotal, discountAmount, discountCode, couponCode,
      shippingCost, total, currency,
      customerNotes, locale,
    } = body;

    if (!customerName || !customerPhone || !customerAddress || !items || total === undefined || total === null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const itemsArray = Array.isArray(items) ? items : [];
    const itemCount = itemsArray.reduce((sum: number, it: { quantity?: number }) => sum + (it.quantity || 1), 0);

    const orderNumber = await generateOrderNumber();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
               request.headers.get("x-real-ip") || "";

    let resolvedEmail = String(customerEmail || "").trim().slice(0, 200);
    if (!resolvedEmail && customerId) {
      try {
        const [cust] = await db.select().from(customers).where(eq(customers.id, String(customerId))).limit(1);
        if (cust?.email) resolvedEmail = cust.email;
      } catch { /* ignore */ }
    }

    const finalDiscountCode = couponCode || discountCode || "";
    const finalDiscountAmount = String(discountAmount || 0);

    const result = await db.insert(orders).values({
      orderNumber,
      customerName: String(customerName).trim().slice(0, 200),
      customerPhone: String(customerPhone).trim().slice(0, 50),
      customerEmail: resolvedEmail,
      customerId: customerId ? String(customerId) : null,
      customerAddress: String(customerAddress).trim().slice(0, 500),
      items: JSON.stringify(itemsArray),
      itemCount,
      subtotal: String(subtotal || total),
      discountAmount: finalDiscountAmount,
      discountCode: finalDiscountCode,
      shippingCost: String(shippingCost || 0),
      total: String(total),
      currency: currency || "$",
      status: "pending",
      customerNotes: (customerNotes || "").slice(0, 1000),
      locale: locale || "en",
      ipAddress: ip,
    }).returning();

    if (resolvedEmail) {
      sendOrderConfirmationEmail(
        resolvedEmail,
        String(customerName),
        {
          orderNumber: result[0].orderNumber,
          items: itemsArray,
          subtotal: Number(subtotal || total),
          discountAmount: Number(finalDiscountAmount),
          discountCode: finalDiscountCode,
          total: Number(total),
          currency: currency || "$",
          customerPhone: String(customerPhone),
          customerAddress: String(customerAddress),
        },
        locale === "fr" ? "fr" : "en"
      ).catch(err => console.error("[Order Confirmation Email]", err));
    }

    return NextResponse.json({
      success: true,
      order: { orderNumber: result[0].orderNumber, id: result[0].id },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
