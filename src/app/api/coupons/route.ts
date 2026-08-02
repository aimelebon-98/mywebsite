import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons, customerCoupons } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentCustomer } from "@/lib/customer-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body.code || "").toUpperCase().trim();
    const orderTotal = parseFloat(String(body.orderTotal || "0"));
    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
    if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    if (!coupon.active) return NextResponse.json({ error: "Coupon is not active" }, { status: 400 });

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Coupon has reached its usage limit" }, { status: 400 });
    }

    const minOrder = parseFloat(String(coupon.minOrder || "0"));
    if (orderTotal < minOrder) {
      return NextResponse.json({
        error: "Minimum order of $" + minOrder.toFixed(2) + " required for this coupon",
      }, { status: 400 });
    }

    const customer = await getCurrentCustomer();
    if (customer) {
      const [used] = await db.select().from(customerCoupons).where(
        and(eq(customerCoupons.customerId, customer.id), eq(customerCoupons.couponId, coupon.id))
      ).limit(1);
      if (used && used.usedAt) {
        return NextResponse.json({ error: "You have already used this coupon" }, { status: 400 });
      }
    }

    const value = parseFloat(String(coupon.value));
    const discount = coupon.type === "percent"
      ? Math.min(orderTotal * (value / 100), orderTotal)
      : Math.min(value, orderTotal);

    return NextResponse.json({
      ok: true,
      coupon: { id: coupon.id, code: coupon.code, type: coupon.type, value, description: coupon.description, descriptionFr: coupon.descriptionFr },
      discount: parseFloat(discount.toFixed(2)),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
