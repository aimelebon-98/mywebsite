import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets, supportMessages } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

async function ensureTables() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS support_messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id uuid NOT NULL,
        sender_type text NOT NULL,
        sender_name text NOT NULL DEFAULT '',
        message text NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `);
  } catch (e) {
    console.error("ensureTables support_messages error:", e);
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await ensureTables();

    const { id } = await props.params;
    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const cleanMsg = message.trim();

    // Insert admin reply message into supportMessages table
    await db.insert(supportMessages).values({
      ticketId: id,
      senderType: "admin",
      senderName: "Support Team",
      message: cleanMsg,
      createdAt: new Date(),
    });

    // Update ticket metadata
    await db
      .update(supportTickets)
      .set({
        status: "in_progress",
        lastMessageAt: new Date(),
        unreadByCustomer: true,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id));

    return NextResponse.json({ success: true, message: "Reply sent successfully" });
  } catch (error: any) {
    console.error("Error posting ticket reply:", error);
    return NextResponse.json(
      { error: "Failed to post reply", message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}