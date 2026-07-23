import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { authors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    let result = await db.select().from(authors).where(eq(authors.slug, id));
    if (result.length === 0) {
      try {
        result = await db.select().from(authors).where(eq(authors.id, id));
      } catch {}
    }
    if (result.length === 0) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching author:", error);
    return NextResponse.json({ error: "Failed to fetch author" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.slug !== undefined) updates.slug = generateSlug(body.slug);
    if (body.avatar !== undefined) updates.avatar = body.avatar;
    if (body.email !== undefined) updates.email = body.email;
    if (body.bio !== undefined) updates.bio = body.bio;
    if (body.bioFr !== undefined) updates.bioFr = body.bioFr || null;
    if (body.role !== undefined) updates.role = body.role;
    if (body.roleFr !== undefined) updates.roleFr = body.roleFr || null;
    if (body.twitter !== undefined) updates.twitter = body.twitter;
    if (body.instagram !== undefined) updates.instagram = body.instagram;
    if (body.linkedin !== undefined) updates.linkedin = body.linkedin;
    if (body.website !== undefined) updates.website = body.website;
    if (body.active !== undefined) updates.active = Boolean(body.active);
    if (body.sortOrder !== undefined) updates.sortOrder = parseInt(String(body.sortOrder));

    const result = await db.update(authors).set(updates).where(eq(authors.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating author:", error);
    return NextResponse.json({ error: "Failed to update author" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const result = await db.delete(authors).where(eq(authors.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted: result[0] });
  } catch (error) {
    console.error("Error deleting author:", error);
    return NextResponse.json({ error: "Failed to delete author" }, { status: 500 });
  }
}