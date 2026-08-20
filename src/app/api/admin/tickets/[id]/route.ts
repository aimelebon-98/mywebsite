import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const { id } = await params;
    const body = await req.json();
    await db.update(supportTickets).set(body).where(eq(supportTickets.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const { id } = await params;
    await db.delete(supportTickets).where(eq(supportTickets.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 });
  }
}