import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bundles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const b = await req.json();
    const [updated] = await db.update(bundles).set({
      name: b.name,
      nameFr: b.nameFr,
      description: b.description,
      descriptionFr: b.descriptionFr,
      minItems: b.minItems,
      discountPercent: b.discountPercent,
      category: b.category,
      active: b.active,
      priority: b.priority,
    }).where(eq(bundles.id, id)).returning();
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(bundles).where(eq(bundles.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}