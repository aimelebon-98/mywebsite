import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets, supportMessages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const { id } = params;
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

    const ticket = ticketList[0];

    let messages: any[] = [];
    try {
      messages = await db
        .select()
        .from(supportMessages)
        .where(eq(supportMessages.ticketId, id))
        .orderBy(asc(supportMessages.createdAt));
    } catch (msgErr) {
      console.error("Failed to fetch ticket messages:", msgErr);
      messages = [];
    }

    return NextResponse.json({
      success: true,
      ticket: {
        ...ticket,
        messages: messages || [],
      },
      messages: messages || [],
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
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const { id } = params;
    const body = await request.json();
    const { status, priority, adminNote } = body;

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (adminNote !== undefined) updates.adminNote = adminNote;

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