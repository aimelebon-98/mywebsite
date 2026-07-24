import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogComments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  try {
    const { id } = await params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.approved !== undefined) updates.approved = Boolean(body.approved);
    if (body.content !== undefined) updates.content = String(body.content);

    const result = await db.update(blogComments).set(updates).where(eq(blogComments.id, id)).returning();
    if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  try {
    const { id } = await params;
    // Also delete any replies (children)
    await db.delete(blogComments).where(eq(blogComments.parentId, id));
    const result = await db.delete(blogComments).where(eq(blogComments.id, id)).returning();
    if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}