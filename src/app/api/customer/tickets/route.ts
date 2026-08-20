import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets, supportMessages } from "@/db/schema";
import { getCustomerFromRequest } from "@/lib/customer-auth";
import { isRateLimited } from "@/lib/rate-limit";
import { stripHtml } from "@/lib/sanitize";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.customerId, customer.id))
      .orderBy(desc(supportTickets.createdAt));

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("[Tickets GET]", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    if (isRateLimited(ip, 10, 60000)) {
      return NextResponse.json({ error: "Too many ticket requests. Please wait a minute." }, { status: 429 });
    }

    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const subjectVal = stripHtml(String(body.subject || "")).trim().slice(0, 200);
    const categoryVal = stripHtml(String(body.category || "general")).trim() || "general";
    const messageVal = stripHtml(String(body.message || body.content || "")).trim().slice(0, 5000);

    if (!subjectVal) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    // Auto-ensure ALL Postgres table columns exist
    try {
      await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal'`);
      await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS unread_by_admin boolean NOT NULL DEFAULT true`);
      await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS unread_by_customer boolean NOT NULL DEFAULT false`);
      await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS last_message_at timestamp DEFAULT now()`);
      await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now()`);
    } catch { /* ignore */ }

    const now = new Date();
    const [inserted] = await db
      .insert(supportTickets)
      .values({
        customerId: customer.id,
        subject: subjectVal,
        category: categoryVal,
        status: "open",
        priority: "normal",
        unreadByAdmin: true,
        unreadByCustomer: false,
        lastMessageAt: now,
        createdAt: now,
        updatedAt: now,
      } as typeof supportTickets.$inferInsert)
      .returning();

    // Insert first message if provided
    if (messageVal && inserted?.id) {
      try {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS support_messages (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            ticket_id uuid NOT NULL,
            sender_type text NOT NULL,
            sender_name text NOT NULL DEFAULT '',
            message text NOT NULL,
            created_at timestamp DEFAULT now()
          );
        `);
      } catch { /* ignore */ }

      try {
        await db.insert(supportMessages).values({
          ticketId: inserted.id,
          senderType: "customer",
          senderName: customer.name || "Customer",
          message: messageVal,
          createdAt: now,
        });
      } catch (msgErr) {
        console.warn("[Tickets] supportMessages insert fallback:", msgErr);
        try {
          await db.execute(sql`
            INSERT INTO support_messages (ticket_id, sender_type, sender_name, message, created_at)
            VALUES (${inserted.id}, 'customer', ${customer.name || 'Customer'}, ${messageVal}, ${now})
          `);
        } catch { /* ignore */ }
      }
    }

    return NextResponse.json({ success: true, ticket: inserted }, { status: 201 });
  } catch (error) {
    console.error("[Tickets POST Error]", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}