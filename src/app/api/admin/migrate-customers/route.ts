import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT '',
        phone TEXT DEFAULT '',
        verified BOOLEAN NOT NULL DEFAULT FALSE,
        locale TEXT NOT NULL DEFAULT 'en',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS customer_sessions (
        token TEXT PRIMARY KEY,
        customer_id UUID NOT NULL,
        ip_address TEXT DEFAULT '',
        user_agent TEXT DEFAULT '',
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS customer_addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL,
        label TEXT NOT NULL DEFAULT 'Home',
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        street TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT DEFAULT '',
        country TEXT NOT NULL DEFAULT 'Nigeria',
        postal_code TEXT DEFAULT '',
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token TEXT PRIMARY KEY,
        customer_id UUID NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_sessions_customer ON customer_sessions(customer_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_addresses_customer ON customer_addresses(customer_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_reset_customer ON password_reset_tokens(customer_id);`);

    return NextResponse.json({ ok: true, message: "Customer tables created" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
