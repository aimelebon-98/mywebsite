import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`UPDATE reviews SET approved = true WHERE approved IS FALSE OR approved IS NULL`);
    return NextResponse.json({ success: true, message: "All existing reviews approved!" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}