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
    const denied = await requireAdmin();
    if (denied) return denied;

    await ensureTables();

    const { id } = await props.params;
    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const existing = await db
      .select({ id: supportTickets.id })
      .from(supportTickets)
      .where(eq(supportTickets.id, id))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    await db.insert(supportMessages).values({
      ticketId: id,
      senderType: "admin",
      senderName: "Support Team",
      message,
    });

    await db
      .update(supportTickets)
      .set({
        status: "in_progress",
        lastMessageAt: new Date(),
        unreadByCustomer: true,
        unreadByAdmin: false,
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