import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, customerSessions, customerAddresses, passwordResetTokens, wishlist, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentCustomer, verifyPassword } from "@/lib/customer-auth";
import { cookies } from "next/headers";

const SESSION_COOKIE = "ndz_customer_session";

export async function POST(request: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { password } = body;

    if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });

    // Verify password before deletion
    const valid = await verifyPassword(password, customer.passwordHash);
    if (!valid) return NextResponse.json({ error: "Incorrect password" }, { status: 403 });

    // Anonymize orders (keep order history, remove personal link)
    await db.update(orders).set({ customerId: null }).where(eq(orders.customerId, customer.id));

    // Delete all customer data
    await db.delete(wishlist).where(eq(wishlist.customerId, customer.id));
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.customerId, customer.id));
    await db.delete(customerAddresses).where(eq(customerAddresses.customerId, customer.id));
    await db.delete(customerSessions).where(eq(customerSessions.customerId, customer.id));
    await db.delete(customers).where(eq(customers.id, customer.id));

    // Clear session cookie
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Delete Account]", e instanceof Error ? e.message : "unknown");
    return NextResponse.json({ error: "Account deletion failed" }, { status: 500 });
  }
}
