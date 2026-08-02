import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, or, desc } from "drizzle-orm";
import { getCurrentCustomer } from "@/lib/customer-auth";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  try {
    const customerOrders = await db.select().from(orders)
      .where(or(
        eq(orders.customerId, customer.id),
        eq(orders.customerEmail, customer.email)
      ))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({ orders: customerOrders });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
