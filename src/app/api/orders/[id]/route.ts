import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    // Support lookup by ID or order number
    let result = await db.select().from(orders).where(eq(orders.orderNumber, id));
    if (result.length === 0) {
      try {
        result = await db.select().from(orders).where(eq(orders.id, id));
      } catch {}
    }
    if (result.length === 0) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.status !== undefined) {
      updates.status = String(body.status);
      // Auto-set shipped/delivered timestamps
      if (body.status === "shipped") updates.shippedAt = new Date();
      if (body.status === "delivered") updates.deliveredAt = new Date();
    }
    if (body.trackingNumber !== undefined) updates.trackingNumber = String(body.trackingNumber);
    if (body.trackingCarrier !== undefined) updates.trackingCarrier = String(body.trackingCarrier);
    if (body.adminNotes !== undefined) updates.adminNotes = String(body.adminNotes);
    if (body.customerName !== undefined) updates.customerName = String(body.customerName);
    if (body.customerPhone !== undefined) updates.customerPhone = String(body.customerPhone);
    if (body.customerEmail !== undefined) updates.customerEmail = String(body.customerEmail);
    if (body.customerAddress !== undefined) updates.customerAddress = String(body.customerAddress);

    updates.updatedAt = new Date();

    const result = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    if (result.length === 0) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const result = await db.delete(orders).where(eq(orders.id, id)).returning();
    if (result.length === 0) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}