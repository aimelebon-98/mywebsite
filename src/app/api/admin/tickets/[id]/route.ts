import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await props.params;

    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const ticketList = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id))
      .limit(1);

    if (!ticketList || ticketList.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticket = ticketList[0] as any;
    const messages: any[] = [];

    if (ticket.message) {
      messages.push({
        id: "msg-cust",
        senderType: "customer",
        senderName: ticket.customerName || "Customer",
        message: ticket.message,
        createdAt: ticket.createdAt,
      });
    }

    const adminReplyText = ticket.reply || ticket.response || ticket.adminResponse || ticket.adminNote;
    if (adminReplyText) {
      messages.push({
        id: "msg-admin",
        senderType: "admin",
        senderName: "Support Team",
        message: adminReplyText,
        createdAt: ticket.updatedAt || ticket.createdAt,
      });
    }

    return NextResponse.json({
      success: true,
      ticket: {
        ...ticket,
        messages,
      },
      messages,
    });
  } catch (error: any) {
    console.error("Error fetching admin support ticket details:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error?.message || "Failed to load ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await props.params;
    const body = await request.json();
    const { status, priority } = body;

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (priority) updates.priority = priority;

    await db
      .update(supportTickets)
      .set(updates)
      .where(eq(supportTickets.id, id));

    return NextResponse.json({ success: true, message: "Ticket updated" });
  } catch (error: any) {
    console.error("Error updating support ticket:", error);
    return NextResponse.json(
      { error: "Failed to update ticket", message: error?.message },
      { status: 500 }
    );
  }
}