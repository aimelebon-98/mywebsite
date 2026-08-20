import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, customerAddresses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
    }

    const customerOrders = await db.select().from(orders)
      .where(eq(orders.customerId, id))
      .orderBy(desc(orders.createdAt));

    const addresses = await db.select().from(customerAddresses)
      .where(eq(customerAddresses.customerId, id))
      .orderBy(desc(customerAddresses.createdAt));

    return NextResponse.json({ orders: customerOrders, addresses });
  } catch (error) {
    console.error("[Admin Customer Detail] Error:", error);
    return NextResponse.json({ error: "Failed to fetch customer data" }, { status: 500 });
  }
}