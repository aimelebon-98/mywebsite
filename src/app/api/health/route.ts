import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return Response.json({ ok: true, status: "healthy", timestamp: new Date().toISOString() });
  } catch (error: any) {
    return Response.json({
      ok: false,
      error: error?.message || "Database connection error",
      cause: error?.cause?.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
