import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { adminSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;
    const session = await db.select().from(adminSessions).where(eq(adminSessions.token, token));
    if (session.length === 0) return false;
    return new Date(session[0].expiresAt) > new Date();
  } catch { return false; }
}

// Fix categories that were double-encoded during previous setup runs
// Using chr() codes which is bulletproof for Unicode
export async function POST() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const updates = [
      { slug: "sneakers", nameFr: "Baskets" },
      { slug: "running",  nameFr: "Course" },
      { slug: "boots",    nameFr: "Bottes" },
      { slug: "sandals",  nameFr: "Sandales" },
    ];

    // First: fix the ones without accents (safe direct update)
    for (const u of updates) {
      await db.execute(sql`UPDATE categories SET name_fr = ${u.nameFr} WHERE slug = ${u.slug}`);
    }

    // Then: fix the two with accents using chr() codes
    // Habille -> "Habill" + chr(233)
    await db.execute(sql.raw(`UPDATE categories SET name_fr = 'Habill' || chr(233) WHERE slug = 'formal'`));

    // Decontracte -> "D" + chr(233) + "contract" + chr(233)
    await db.execute(sql.raw(`UPDATE categories SET name_fr = 'D' || chr(233) || 'contract' || chr(233) WHERE slug = 'casual'`));

    // Verify
    const result = await db.execute(sql`SELECT slug, name_fr, encode(name_fr::bytea, 'hex') as hex_bytes FROM categories ORDER BY sort_order`);

    return NextResponse.json({
      success: true,
      message: "Category French names reset with proper UTF-8 encoding",
      categories: result.rows,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to fix categories",
      details: error instanceof Error ? error.message : "Unknown"
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    info: "POST as admin to reset all 6 categories with proper French accents via chr() codes",
  });
}
