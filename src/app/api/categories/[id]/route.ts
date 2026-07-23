import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, adminSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;
    const session = await db.select().from(adminSessions).where(eq(adminSessions.token, token));
    if (session.length === 0) return false;
    return new Date(session[0].expiresAt) > new Date();
  } catch {
    return false;
  }
}

interface Params {
  params: Promise<{ id: string }>;
}

// PUT - update category
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const updates: Partial<typeof categories.$inferInsert> = {};
    if (body.nameEn !== undefined) updates.nameEn = String(body.nameEn);
    if (body.nameFr !== undefined) updates.nameFr = body.nameFr ? String(body.nameFr) : null;
    if (body.active !== undefined) updates.active = Boolean(body.active);
    if (body.sortOrder !== undefined) updates.sortOrder = parseInt(String(body.sortOrder));
    if (body.imageProductId !== undefined) {
      updates.imageProductId = body.imageProductId ? String(body.imageProductId) : null;
    }
    if (body.slug !== undefined) {
      updates.slug = String(body.slug).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    }

    const result = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();
    if (result.length === 0) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE - delete category
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    if (result.length === 0) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    return NextResponse.json({ success: true, deleted: result[0] });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
