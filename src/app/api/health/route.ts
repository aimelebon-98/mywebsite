import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  let maskedUrl = "NOT SET";
  if (dbUrl) {
    try {
      const u = new URL(dbUrl);
      maskedUrl = `${u.protocol}//${u.username}:***@${u.host}${u.pathname}`;
    } catch {
      maskedUrl = "INVALID URL FORMAT (length " + dbUrl.length + ")";
    }
  }

  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    databaseUrlMasked: maskedUrl,
  };

  try {
    const startTime = Date.now();
    const result = await db.execute(sql`SELECT current_database(), current_user, version()`);
    diagnostics.ok = true;
    diagnostics.latencyMs = Date.now() - startTime;
    diagnostics.dbInfo = result.rows ? result.rows[0] : result;
    return Response.json(diagnostics, { status: 200 });
  } catch (error: any) {
    diagnostics.ok = false;
    diagnostics.error = error?.message || String(error);
    diagnostics.code = error?.code;
    diagnostics.routine = error?.routine;
    diagnostics.detail = error?.detail;
    return Response.json(diagnostics, { status: 200 });
  }
}
