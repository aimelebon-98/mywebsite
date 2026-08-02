import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customerSessions } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { cookies } from "next/headers";

const SESSION_COOKIE = "ndz_customer_session";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const sessions = await db.select({
      token: customerSessions.token,
      ipAddress: customerSessions.ipAddress,
      userAgent: customerSessions.userAgent,
      createdAt: customerSessions.createdAt,
      expiresAt: customerSessions.expiresAt,
    })
    .from(customerSessions)
    .where(and(
      eq(customerSessions.customerId, customer.id),
      gte(customerSessions.expiresAt, now)
    ));

    // Get current token to mark active session
    const cookieStore = await cookies();
    const currentToken = cookieStore.get(SESSION_COOKIE)?.value || "";

    const result = sessions.map(s => ({
      ...s,
      isCurrent: s.token === currentToken,
      // Mask token for security - only send first 8 chars
      token: s.token.slice(0, 8) + "...",
      tokenFull: s.token, // needed for delete
    }));

    return NextResponse.json({ sessions: result });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { token, all } = body;

    if (all) {
      // Sign out of all sessions
      await db.delete(customerSessions).where(eq(customerSessions.customerId, customer.id));
      // Clear current cookie
      const cookieStore = await cookies();
      cookieStore.delete(SESSION_COOKIE);
      return NextResponse.json({ ok: true, signedOut: true });
    }

    if (token) {
      // Delete specific session - verify it belongs to this customer
      await db.delete(customerSessions).where(
        and(eq(customerSessions.token, token), eq(customerSessions.customerId, customer.id))
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "token or all required" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
