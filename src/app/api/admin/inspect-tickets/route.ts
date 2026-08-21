import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tickets = await db.execute(sql`SELECT * FROM support_tickets`);
    const messages = await db.execute(sql`SELECT * FROM support_messages`);
    const customers = await db.execute(sql`SELECT id, name, email FROM customers LIMIT 5`);
    return NextResponse.json({
      tickets: (tickets as any).rows || tickets,
      messages: (messages as any).rows || messages,
      customers: (customers as any).rows || customers,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}