import { NextResponse } from "next/server";
import { db } from "@/db";
import { customerCoupons, coupons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentCustomer } from "@/lib/customer-auth";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db.select({
      id: customerCoupons.id,
      couponId: customerCoupons.couponId,
      usedAt: customerCoupons.usedAt,
      createdAt: customerCoupons.createdAt,
      code: coupons.code,
      type: coupons.type,
      value: coupons.value,
      minOrder: coupons.minOrder,
      expiresAt: coupons.expiresAt,
      description: coupons.description,
      descriptionFr: coupons.descriptionFr,
      active: coupons.active,
    })
    .from(customerCoupons)
    .leftJoin(coupons, eq(customerCoupons.couponId, coupons.id))
    .where(eq(customerCoupons.customerId, customer.id));

    return NextResponse.json({ coupons: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
