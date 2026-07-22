import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        short_description TEXT NOT NULL DEFAULT '',
        long_description TEXT NOT NULL DEFAULT '',
        price NUMERIC(10, 2) NOT NULL,
        compare_price NUMERIC(10, 2),
        category TEXT NOT NULL DEFAULT 'sneakers',
        brand TEXT NOT NULL DEFAULT '',
        sizes TEXT NOT NULL DEFAULT '[]',
        colors TEXT NOT NULL DEFAULT '[]',
        image_url TEXT NOT NULL DEFAULT '',
        images TEXT NOT NULL DEFAULT '[]',
        stock INTEGER NOT NULL DEFAULT 0,
        featured BOOLEAN NOT NULL DEFAULT false,
        active BOOLEAN NOT NULL DEFAULT true,
        rating NUMERIC(2, 1) NOT NULL DEFAULT 0,
        review_count INTEGER NOT NULL DEFAULT 0,
        tags TEXT NOT NULL DEFAULT '[]',
        material TEXT NOT NULL DEFAULT '',
        weight TEXT NOT NULL DEFAULT '',
        sku TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Additive: French columns for products
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS name_fr TEXT`);
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS description_fr TEXT`);
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description_fr TEXT`);
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS long_description_fr TEXT`);
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS tags_fr TEXT`);

    // Categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT NOT NULL UNIQUE,
        name_en TEXT NOT NULL,
        name_fr TEXT,
        active BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      INSERT INTO categories (slug, name_en, name_fr, sort_order) VALUES
      ('sneakers', 'Sneakers', 'Baskets', 1),
      ('running',  'Running',  'Course',  2),
      ('formal',   'Formal',   'Habill' || chr(233), 3),
      ('boots',    'Boots',    'Bottes',  4),
      ('sandals',  'Sandals',  'Sandales', 5),
      ('casual',   'Casual',   'D' || chr(233) || 'contract' || chr(233), 6)
      ON CONFLICT (slug) DO NOTHING
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL,
        customer_name TEXT NOT NULL,
        rating INTEGER NOT NULL DEFAULT 5,
        comment TEXT NOT NULL DEFAULT '',
        avatar TEXT NOT NULL DEFAULT '',
        verified BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Additive: French comment column
    await db.execute(sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment_fr TEXT`);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS newsletter (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        store_name TEXT NOT NULL DEFAULT 'SoleVault',
        whatsapp_number TEXT NOT NULL DEFAULT '',
        currency TEXT NOT NULL DEFAULT '$',
        admin_password TEXT NOT NULL DEFAULT 'admin123',
        admin_access_code TEXT NOT NULL DEFAULT '',
        admin_path TEXT NOT NULL DEFAULT 'admin',
        session_secret TEXT NOT NULL DEFAULT '',
        max_login_attempts INTEGER NOT NULL DEFAULT 5,
        lockout_minutes INTEGER NOT NULL DEFAULT 15
      )
    `);

    await db.execute(sql`INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token TEXT NOT NULL UNIQUE,
        ip_address TEXT NOT NULL DEFAULT '',
        user_agent TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        expires_at TIMESTAMP NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ip_address TEXT NOT NULL,
        success BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS wishlist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        visitor_id TEXT NOT NULL,
        product_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    return NextResponse.json({
      success: true,
      message: "Database setup complete. All tables + French columns (products + reviews) + categories seeded."
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Setup failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    info: "POST to this endpoint to initialize/migrate the database.",
    safe: "This is idempotent - safe to run multiple times.",
  });
}
