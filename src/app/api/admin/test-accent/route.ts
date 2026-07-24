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

export async function POST() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return new NextResponse("Not Found", { status: 404 });

    // Test 1: Write via raw SQL with chr() codes (SEEDING METHOD - known to work)
    // "cafe" + e-acute + " test"
    await db.execute(sql`
      UPDATE reviews SET comment_fr = 'caf' || chr(233) || ' qualit' || chr(233) || ' TEST_SQL'
      WHERE id = (SELECT id FROM reviews LIMIT 1)
    `);

    // Test 2: Write via Drizzle with template literal string (JSON API METHOD)
    const testString = "caf\u00e9 qualit\u00e9 TEST_DRIZZLE";
    await db.execute(sql`
      UPDATE reviews SET comment_fr = ${testString} || ' extra'
      WHERE id = (SELECT id FROM reviews OFFSET 1 LIMIT 1)
    `);

    // Read both back
    const readBack = await db.execute(sql`
      SELECT id, comment_fr, encode(comment_fr::bytea, 'hex') as hex_bytes
      FROM reviews
      WHERE comment_fr LIKE '%TEST_%'
    `);

    return NextResponse.json({
      success: true,
      results: readBack.rows,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown"
    }, { status: 500 });
  }
}
