import { requireAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogCategories } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select().from(blogCategories).orderBy(asc(blogCategories.sortOrder));
    return NextResponse.json(all);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  const authErr = await requireAdmin(); if (authErr) return authErr;
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const [created] = await db.insert(blogCategories).values({
      slug: body.slug ? slugify(body.slug) : slugify(name),
      name,
      nameFr: body.nameFr || null,
      color: body.color || "bg-gray-100 text-gray-700",
      sortOrder: body.sortOrder ?? 99,
      active: body.active ?? true,
    }).returning();
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
