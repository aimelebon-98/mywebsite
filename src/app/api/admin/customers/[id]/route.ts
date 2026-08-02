import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, customerAddresses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const customerOrders = await db.select().from(orders)
      .where(eq(orders.customerId, id))
      .orderBy(desc(orders.createdAt));

    const addresses = await db.select().from(customerAddresses)
      .where(eq(customerAddresses.customerId, id))
      .orderBy(desc(customerAddresses.createdAt));

    return NextResponse.json({ orders: customerOrders, addresses });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}