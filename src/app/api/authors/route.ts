import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { authors } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") !== "false";
    const conditions = activeOnly ? [eq(authors.active, true)] : [];

    const result = await db
      .select()
      .from(authors)
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .orderBy(asc(authors.sortOrder), desc(authors.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json({ error: "Failed to fetch authors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  try {
    const body = await request.json();
    const {
      name, avatar, email, bio, bioFr, role, roleFr,
      twitter, instagram, linkedin, website, active, sortOrder,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = body.slug ? generateSlug(body.slug) : generateSlug(name);

    const result = await db.insert(authors).values({
      name,
      slug,
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111827&color=fff&bold=true&size=200`,
      email: email || "",
      bio: bio || "",
      bioFr: bioFr || null,
      role: role || "",
      roleFr: roleFr || null,
      twitter: twitter || "",
      instagram: instagram || "",
      linkedin: linkedin || "",
      website: website || "",
      active: active !== false,
      sortOrder: sortOrder || 100,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating author:", error);
    return NextResponse.json({ error: "Failed to create author" }, { status: 500 });
  }
}
