import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const tickets = await db
      .select()
      .from(supportTickets)
      .orderBy(desc(supportTickets.createdAt));

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    console.error("Error fetching support tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets", message: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    await db
      .delete(supportTickets)
      .where(eq(supportTickets.id, id));

    return NextResponse.json({ success: true, message: "Ticket deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting support ticket:", error);
    return NextResponse.json(
      { error: "Failed to delete ticket", message: error?.message },
      { status: 500 }
    );
  }
}