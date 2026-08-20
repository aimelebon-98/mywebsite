import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const customer = await requireCustomer();
    const { name, phone } = await req.json();

    await db.update(customers)
      .set({
        name: String(name || "").slice(0, 100),
        phone: String(phone || "").slice(0, 30),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customer.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}