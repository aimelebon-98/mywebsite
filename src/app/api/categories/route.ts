import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { cookies } from "next/headers";
import { adminSessions } from "@/db/schema";
import { gte } from "drizzle-orm";

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;
    const session = await db.select().from(adminSessions)
      .where(eq(adminSessions.token, token));
    if (session.length === 0) return false;
    return new Date(session[0].expiresAt) > new Date();
  } catch {
    return false;
  }
}

// GET - Public: list active categories (used by frontend)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    let result;
    if (includeInactive) {
      // Admin can see all
      const isAdmin = await verifyAdmin();
      if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      result = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    } else {
      result = await db.select().from(categories)
        .where(eq(categories.active, true))
        .orderBy(asc(categories.sortOrder));
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST - Admin only: create new category
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { slug, nameEn, nameFr, active, sortOrder } = body;

    if (!slug || !nameEn) {
      return NextResponse.json({ error: "slug and nameEn are required" }, { status: 400 });
    }

    // Normalize slug: lowercase, no spaces
    const cleanSlug = String(slug).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

    const result = await db.insert(categories).values({
      slug: cleanSlug,
      nameEn: String(nameEn),
      nameFr: nameFr ? String(nameFr) : null,
      active: active !== false,
      sortOrder: sortOrder ? parseInt(String(sortOrder)) : 999,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "A category with that slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create category", details: msg }, { status: 500 });
  }
}
