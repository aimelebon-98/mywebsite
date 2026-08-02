import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

const MIGRATION_KEY = "run-tickets-migration-2024";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== MIGRATION_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id uuid NOT NULL,
        subject text NOT NULL,
        category text NOT NULL DEFAULT 'general',
        status text NOT NULL DEFAULT 'open',
        priority text NOT NULL DEFAULT 'normal',
        last_message_at timestamp NOT NULL DEFAULT NOW(),
        unread_by_admin boolean NOT NULL DEFAULT true,
        unread_by_customer boolean NOT NULL DEFAULT false,
        created_at timestamp NOT NULL DEFAULT NOW(),
        updated_at timestamp NOT NULL DEFAULT NOW()
      )
    `);
    results.push("support_tickets table created");
  } catch (e) { results.push("support_tickets error: " + String(e)); }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS support_messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id uuid NOT NULL,
        sender_type text NOT NULL,
        sender_name text NOT NULL DEFAULT '',
        message text NOT NULL,
        created_at timestamp NOT NULL DEFAULT NOW()
      )
    `);
    results.push("support_messages table created");
  } catch (e) { results.push("support_messages error: " + String(e)); }

  try {
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_tickets_customer ON support_tickets(customer_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_messages_ticket ON support_messages(ticket_id)`);
    results.push("indexes created");
  } catch (e) { results.push("index error: " + String(e)); }

  return NextResponse.json({ success: true, results });
}