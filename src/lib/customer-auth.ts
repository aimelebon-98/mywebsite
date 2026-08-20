import { db } from "@/db";
import { customerSessions, customers, type Customer } from "@/db/schema";
import { eq, gte, and } from "drizzle-orm";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SESSION_COOKIE = "ndz_customer_session";
const SESSION_DURATION_DAYS = 30;

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase());
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(customerId: string, ipAddress: string = "", userAgent: string = ""): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(customerSessions).values({
    token,
    customerId,
    ipAddress: ipAddress.slice(0, 50),
    userAgent: userAgent.slice(0, 500),
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await db.delete(customerSessions).where(eq(customerSessions.token, token));
    } catch {}
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentCustomer(): Promise<Customer | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const [session] = await db.select().from(customerSessions)
      .where(and(eq(customerSessions.token, token), gte(customerSessions.expiresAt, new Date())))
      .limit(1);
    if (!session) return null;

    const [customer] = await db.select().from(customers).where(eq(customers.id, session.customerId)).limit(1);
    return customer || null;
  } catch {
    return null;
  }
}

export async function requireCustomer(): Promise<Customer> {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("UNAUTHORIZED");
  return customer;
}

// ── Auth helper for NextRequest / route handlers ──
export async function getCustomerFromRequest(request?: any) {
  try {
    const { db } = await import("@/db");
    const { customers, customerSessions } = await import("@/db/schema");
    const { eq, and, gt } = await import("drizzle-orm");
    const { cookies } = await import("next/headers");

    let token: string | undefined;

    if (request?.cookies) {
      token = request.cookies.get("ndz_customer_session")?.value ||
              request.cookies.get("customer_session")?.value ||
              request.cookies.get("session")?.value;
    }

    if (!token && request?.headers) {
      const auth = request.headers.get("authorization");
      if (auth?.startsWith("Bearer ")) {
        token = auth.slice(7).trim();
      }
    }

    if (!token) {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get("ndz_customer_session")?.value ||
                cookieStore.get("customer_session")?.value ||
                cookieStore.get("session")?.value;
      } catch {}
    }

    if (!token) return null;

    const [session] = await db
      .select()
      .from(customerSessions)
      .where(
        and(
          eq(customerSessions.token, token),
          gt(customerSessions.expiresAt, new Date())
        )
      );

    if (!session) return null;

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, session.customerId));

    return customer || null;
  } catch (error) {
    console.error("getCustomerFromRequest error:", error);
    return null;
  }
}