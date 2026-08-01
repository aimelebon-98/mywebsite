import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const [updated] = await db.update(blogCategories).set({
      name: body.name,
      nameFr: body.nameFr,
      color: body.color,
      sortOrder: body.sortOrder,
      active: body.active,
    }).where(eq(blogCategories.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(blogCategories).where(eq(blogCategories.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}