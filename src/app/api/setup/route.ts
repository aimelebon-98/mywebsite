import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Create all tables if they don't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        short_description TEXT NOT NULL DEFAULT '',
        long_description TEXT NOT NULL DEFAULT '',
        price NUMERIC(10,2) NOT NULL,
        compare_price NUMERIC(10,2),
        category TEXT NOT NULL DEFAULT 'sneakers',
        brand TEXT NOT NULL DEFAULT '',
        sizes TEXT NOT NULL DEFAULT '[]',
        colors TEXT NOT NULL DEFAULT '[]',
        image_url TEXT NOT NULL DEFAULT '',
        images TEXT NOT NULL DEFAULT '[]',
        stock INTEGER NOT NULL DEFAULT 0,
        featured BOOLEAN NOT NULL DEFAULT false,
        active BOOLEAN NOT NULL DEFAULT true,
        rating NUMERIC(2,1) NOT NULL DEFAULT '0',
        review_count INTEGER NOT NULL DEFAULT 0,
        tags TEXT NOT NULL DEFAULT '[]',
        material TEXT NOT NULL DEFAULT '',
        weight TEXT NOT NULL DEFAULT '',
        sku TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
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
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS newsletter (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
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

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token TEXT NOT NULL UNIQUE,
        ip_address TEXT NOT NULL DEFAULT '',
        user_agent TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ip_address TEXT NOT NULL,
        success BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    return NextResponse.json({ success: true, message: "All tables created successfully" });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check if tables exist
    const result = await db.execute(sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('products', 'reviews', 'settings', 'newsletter', 'admin_sessions', 'login_attempts')
    `);
    
    const existingTables = (result.rows as Array<{ table_name: string }>).map(r => r.table_name);
    const requiredTables = ['products', 'reviews', 'settings', 'newsletter', 'admin_sessions', 'login_attempts'];
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    
    // Check if products exist
    let productCount = 0;
    if (existingTables.includes('products')) {
      try {
        const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM products`);
        productCount = parseInt(String((countResult.rows[0] as Record<string, unknown>).count) || "0");
      } catch { /* ignore */ }
    }

    return NextResponse.json({
      ready: missingTables.length === 0,
      existingTables,
      missingTables,
      productCount,
      needsSetup: missingTables.length > 0,
      needsSeed: missingTables.length === 0 && productCount === 0,
    });
  } catch (error) {
    console.error("Setup check error:", error);
    return NextResponse.json({ 
      ready: false, 
      needsSetup: true, 
      error: String(error),
      existingTables: [],
      missingTables: ['products', 'reviews', 'settings', 'newsletter', 'admin_sessions', 'login_attempts'],
      productCount: 0,
      needsSeed: false,
    });
  }
}
