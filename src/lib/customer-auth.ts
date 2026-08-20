import { cookies } from "next/headers";
import { db } from "@/db";
import { customerSessions, customers, type Customer } from "@/db/schema";
import { eq, gte, and } from "drizzle-orm";

const SESSION_COOKIE = "ndz_customer_session";

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