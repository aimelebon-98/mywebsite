import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await props.params;
    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    await db
      .update(supportTickets)
      .set({
        
        status: "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id));

    return NextResponse.json({ success: true, message: "Reply sent successfully" });
  } catch (error: any) {
    console.error("Error posting ticket reply:", error);
    return NextResponse.json(
      { error: "Failed to post reply", message: error?.message },
      { status: 500 }
    );
  }
}