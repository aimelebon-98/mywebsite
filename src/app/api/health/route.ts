import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { Client } from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  let maskedUrl = "NOT SET";
  let host = "";
  let database = "";
  let user = "";
  
  if (dbUrl) {
    try {
      const u = new URL(dbUrl);
      host = u.host;
      database = u.pathname.replace(/^\//, "");
      user = u.username;
      maskedUrl = `${u.protocol}//${u.username}:***@${u.host}/${database}`;
    } catch {
      maskedUrl = "INVALID URL FORMAT";
    }
  }

  const result: Record<string, any> = {
    timestamp: new Date().toISOString(),
    databaseUrlMasked: maskedUrl,
    host,
    database,
    user,
  };

  // Test 1: Drizzle Query
  try {
    const drizzleRes = await db.execute(sql`SELECT current_database(), current_user, version()`);
    result.drizzle = {
      ok: true,
      data: drizzleRes.rows ? drizzleRes.rows[0] : drizzleRes,
    };
  } catch (err: any) {
    result.drizzle = {
      ok: false,
      message: err?.message,
      causeMessage: err?.cause?.message,
      causeCode: err?.cause?.code,
      causeDetail: err?.cause?.detail,
      code: err?.code,
    };
  }

  // Test 2: Direct pg.Client connection test with SSL
  if (dbUrl) {
    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
    });

    try {
      await client.connect();
      const rawRes = await client.query("SELECT 1 as connected, current_database() as db_name");
      result.directPgClient = {
        ok: true,
        data: rawRes.rows[0],
      };
      await client.end();
    } catch (pgErr: any) {
      result.directPgClient = {
        ok: false,
        message: pgErr?.message,
        code: pgErr?.code,
        detail: pgErr?.detail,
        hint: pgErr?.hint,
        severity: pgErr?.severity,
      };
      try { await client.end(); } catch {}
    }
  }

  return NextResponse.json(result, { status: 200 });
}
