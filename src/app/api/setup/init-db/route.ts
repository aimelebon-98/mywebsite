import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { settings, categories, authors } from "@/db/schema";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SETUP_KEY = process.env.SETUP_SECRET || "ndz-init-2026";

async function run(label: string, query: ReturnType<typeof sql>) {
  try {
    await db.execute(query);
    return { label, ok: true };
  } catch (e: any) {
    return { label, ok: false, error: e?.message || String(e) };
  }
}

export async function POST(req: NextRequest) {
  const key =
    req.headers.get("x-setup-key") ||
    new URL(req.url).searchParams.get("key") ||
    "";

  if (key !== SETUP_KEY) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const steps: Array<{ label: string; ok: boolean; error?: string }> = [];

  steps.push(await run("extension_pgcrypto", sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`));

  steps.push(await run("products", sql`
    CREATE TABLE IF NOT EXISTS products (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      slug text NOT NULL DEFAULT '',
      slug_fr text,
      description text NOT NULL DEFAULT '',
      short_description text NOT NULL DEFAULT '',
      long_description text NOT NULL DEFAULT '',
      name_fr text,
      description_fr text,
      short_description_fr text,
      long_description_fr text,
      tags_fr text,
      price numeric(10,2) NOT NULL,
      cost_price numeric(12,2) NOT NULL DEFAULT 0,
      compare_price numeric(10,2),
      category text NOT NULL DEFAULT 'sneakers',
      brand text NOT NULL DEFAULT '',
      sizes text NOT NULL DEFAULT '[]',
      colors text NOT NULL DEFAULT '[]',
      image_url text NOT NULL DEFAULT '',
      images text NOT NULL DEFAULT '[]',
      stock integer NOT NULL DEFAULT 0,
      featured boolean NOT NULL DEFAULT false,
      meta_eligible boolean NOT NULL DEFAULT true,
      meta_exclusion_reason text DEFAULT '',
      sale_ends_at timestamp,
      active boolean NOT NULL DEFAULT true,
      rating numeric(2,1) NOT NULL DEFAULT 0,
      review_count integer NOT NULL DEFAULT 0,
      tags text NOT NULL DEFAULT '[]',
      material text NOT NULL DEFAULT '',
      weight text NOT NULL DEFAULT '',
      sku text NOT NULL DEFAULT '',
      seo_title text,
      meta_description text,
      focus_keyphrase text,
      og_image text,
      canonical_url text,
      no_index boolean NOT NULL DEFAULT false,
      seo_title_fr text,
      meta_description_fr text,
      focus_keyphrase_fr text,
      origin_country text NOT NULL DEFAULT 'NG',
      origin_city text NOT NULL DEFAULT 'Abuja',
      supplier_price numeric(12,2) NOT NULL DEFAULT 0,
      supplier_currency text NOT NULL DEFAULT 'NGN',
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("categories", sql`
    CREATE TABLE IF NOT EXISTS categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text NOT NULL UNIQUE,
      name_en text NOT NULL,
      name_fr text,
      image_product_id uuid,
      active boolean NOT NULL DEFAULT true,
      sort_order integer NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("reviews", sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id uuid NOT NULL,
      customer_id uuid,
      customer_name text NOT NULL,
      rating integer NOT NULL DEFAULT 5,
      comment text NOT NULL DEFAULT '',
      comment_fr text,
      avatar text NOT NULL DEFAULT '',
      verified boolean NOT NULL DEFAULT true,
      approved boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("newsletter", sql`
    CREATE TABLE IF NOT EXISTS newsletter (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL UNIQUE,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("settings", sql`
    CREATE TABLE IF NOT EXISTS settings (
      id integer PRIMARY KEY DEFAULT 1,
      store_name text NOT NULL DEFAULT 'NewDealZone',
      whatsapp_number text NOT NULL DEFAULT '',
      currency text NOT NULL DEFAULT '$',
      admin_password text NOT NULL DEFAULT 'admin123',
      admin_access_code text NOT NULL DEFAULT '',
      admin_path text NOT NULL DEFAULT 'admin',
      session_secret text NOT NULL DEFAULT '',
      max_login_attempts integer NOT NULL DEFAULT 5,
      lockout_minutes integer NOT NULL DEFAULT 15
    )
  `));

  steps.push(await run("admin_sessions", sql`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      token text NOT NULL UNIQUE,
      ip_address text NOT NULL DEFAULT '',
      user_agent text NOT NULL DEFAULT '',
      created_at timestamp NOT NULL DEFAULT now(),
      expires_at timestamp NOT NULL
    )
  `));

  steps.push(await run("login_attempts", sql`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      ip_address text NOT NULL,
      success boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("wishlist", sql`
    CREATE TABLE IF NOT EXISTS wishlist (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      visitor_id text,
      customer_id uuid,
      product_id uuid NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("authors", sql`
    CREATE TABLE IF NOT EXISTS authors (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      slug text NOT NULL UNIQUE,
      avatar text NOT NULL DEFAULT '',
      email text NOT NULL DEFAULT '',
      bio text NOT NULL DEFAULT '',
      bio_fr text,
      role text NOT NULL DEFAULT '',
      role_fr text,
      twitter text NOT NULL DEFAULT '',
      instagram text NOT NULL DEFAULT '',
      linkedin text NOT NULL DEFAULT '',
      website text NOT NULL DEFAULT '',
      active boolean NOT NULL DEFAULT true,
      sort_order integer NOT NULL DEFAULT 100,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("authors_twitter", sql`ALTER TABLE authors ADD COLUMN IF NOT EXISTS twitter text NOT NULL DEFAULT ''`));
  steps.push(await run("authors_instagram", sql`ALTER TABLE authors ADD COLUMN IF NOT EXISTS instagram text NOT NULL DEFAULT ''`));
  steps.push(await run("authors_linkedin", sql`ALTER TABLE authors ADD COLUMN IF NOT EXISTS linkedin text NOT NULL DEFAULT ''`));
  steps.push(await run("authors_website", sql`ALTER TABLE authors ADD COLUMN IF NOT EXISTS website text NOT NULL DEFAULT ''`));
  steps.push(await run("authors_sort_order", sql`ALTER TABLE authors ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 100`));

  steps.push(await run("blog_posts", sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text NOT NULL UNIQUE,
      slug_fr text,
      title text NOT NULL,
      title_fr text,
      excerpt text DEFAULT '',
      excerpt_fr text,
      content text DEFAULT '',
      content_fr text,
      cover_image text DEFAULT '',
      cover_alt text DEFAULT '',
      cover_alt_fr text,
      category text DEFAULT '',
      tags text DEFAULT '[]',
      tags_fr text DEFAULT '[]',
      author_id uuid,
      read_time integer DEFAULT 5,
      published boolean NOT NULL DEFAULT false,
      featured boolean NOT NULL DEFAULT false,
      view_count integer NOT NULL DEFAULT 0,
      seo_title text,
      seo_title_fr text,
      meta_description text,
      meta_description_fr text,
      focus_keyphrase text,
      focus_keyphrase_fr text,
      og_image text,
      canonical_url text,
      no_index boolean NOT NULL DEFAULT false,
      published_at timestamp,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("blog_comments", sql`
    CREATE TABLE IF NOT EXISTS blog_comments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id uuid NOT NULL,
      parent_id uuid,
      author_name text NOT NULL,
      content text NOT NULL DEFAULT '',
      approved boolean NOT NULL DEFAULT false,
      likes integer NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("blog_categories", sql`
    CREATE TABLE IF NOT EXISTS blog_categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text NOT NULL UNIQUE,
      name_en text NOT NULL,
      name_fr text,
      active boolean NOT NULL DEFAULT true,
      sort_order integer NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("orders", sql`
    CREATE TABLE IF NOT EXISTS orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number text,
      customer_id uuid,
      customer_name text DEFAULT '',
      customer_email text DEFAULT '',
      customer_phone text DEFAULT '',
      items text NOT NULL DEFAULT '[]',
      subtotal numeric(12,2) DEFAULT 0,
      shipping numeric(12,2) DEFAULT 0,
      total numeric(12,2) DEFAULT 0,
      currency text DEFAULT 'USD',
      status text NOT NULL DEFAULT 'pending',
      payment_method text DEFAULT '',
      shipping_address text DEFAULT '',
      notes text DEFAULT '',
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("product_faqs", sql`
    CREATE TABLE IF NOT EXISTS product_faqs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id uuid NOT NULL,
      question text NOT NULL,
      question_fr text,
      answer text NOT NULL,
      answer_fr text,
      sort_order integer NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("analytics_events", sql`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      event_name text NOT NULL,
      path text DEFAULT '',
      locale text DEFAULT '',
      meta text DEFAULT '{}',
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("bundles", sql`
    CREATE TABLE IF NOT EXISTS bundles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      name_fr text,
      slug text NOT NULL UNIQUE,
      description text DEFAULT '',
      description_fr text,
      product_ids text NOT NULL DEFAULT '[]',
      price numeric(10,2),
      active boolean NOT NULL DEFAULT true,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("customers", sql`
    CREATE TABLE IF NOT EXISTS customers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL UNIQUE,
      password_hash text NOT NULL DEFAULT '',
      name text NOT NULL DEFAULT '',
      phone text DEFAULT '',
      locale text DEFAULT 'en',
      active boolean NOT NULL DEFAULT true,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("customer_sessions", sql`
    CREATE TABLE IF NOT EXISTS customer_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      token text NOT NULL UNIQUE,
      customer_id uuid NOT NULL,
      expires_at timestamp NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("customer_addresses", sql`
    CREATE TABLE IF NOT EXISTS customer_addresses (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id uuid NOT NULL,
      label text DEFAULT '',
      line1 text NOT NULL DEFAULT '',
      line2 text DEFAULT '',
      city text DEFAULT '',
      state text DEFAULT '',
      country text DEFAULT '',
      postal_code text DEFAULT '',
      phone text DEFAULT '',
      is_default boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("password_reset_tokens", sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id uuid,
      email text NOT NULL,
      token text NOT NULL UNIQUE,
      expires_at timestamp NOT NULL,
      used boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("support_tickets", sql`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id uuid,
      email text DEFAULT '',
      subject text NOT NULL DEFAULT '',
      status text NOT NULL DEFAULT 'open',
      priority text DEFAULT 'normal',
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("support_messages", sql`
    CREATE TABLE IF NOT EXISTS support_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id uuid NOT NULL,
      sender text NOT NULL DEFAULT 'customer',
      body text NOT NULL DEFAULT '',
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("coupons", sql`
    CREATE TABLE IF NOT EXISTS coupons (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      code text NOT NULL UNIQUE,
      type text NOT NULL DEFAULT 'percent',
      value numeric(10,2) NOT NULL DEFAULT 0,
      active boolean NOT NULL DEFAULT true,
      max_uses integer,
      used_count integer NOT NULL DEFAULT 0,
      expires_at timestamp,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("customer_coupons", sql`
    CREATE TABLE IF NOT EXISTS customer_coupons (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id uuid NOT NULL,
      coupon_id uuid NOT NULL,
      used_at timestamp,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("vendors", sql`
    CREATE TABLE IF NOT EXISTS vendors (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL UNIQUE,
      password_hash text NOT NULL DEFAULT '',
      store_name text NOT NULL DEFAULT '',
      store_slug text NOT NULL UNIQUE,
      store_description text DEFAULT '',
      store_description_fr text,
      logo text DEFAULT '',
      banner text DEFAULT '',
      trust_tagline text DEFAULT '',
      trust_tagline_fr text,
      contact_name text DEFAULT '',
      phone text DEFAULT '',
      whatsapp text DEFAULT '',
      country text DEFAULT '',
      city text DEFAULT '',
      bank_name text DEFAULT '',
      bank_account text DEFAULT '',
      bank_account_name text DEFAULT '',
      commission_rate numeric(5,2) NOT NULL DEFAULT 10,
      status text NOT NULL DEFAULT 'pending',
      fulfillment_rate numeric(5,2) DEFAULT 100,
      total_sales integer NOT NULL DEFAULT 0,
      total_earnings numeric(12,2) NOT NULL DEFAULT 0,
      pending_payout numeric(12,2) NOT NULL DEFAULT 0,
      total_paid_out numeric(12,2) NOT NULL DEFAULT 0,
      concierge_debt numeric(12,2) NOT NULL DEFAULT 0,
      concierge_paid_total numeric(12,2) NOT NULL DEFAULT 0,
      preferred_currency text DEFAULT 'USD',
      must_change_password boolean NOT NULL DEFAULT true,
      admin_note text DEFAULT '',
      approved_at timestamp,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("vendor_sessions", sql`
    CREATE TABLE IF NOT EXISTS vendor_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      token text NOT NULL UNIQUE,
      vendor_id uuid NOT NULL,
      ip_address text DEFAULT '',
      user_agent text DEFAULT '',
      expires_at timestamp NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("vendor_applications", sql`
    CREATE TABLE IF NOT EXISTS vendor_applications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      applicant_name text NOT NULL DEFAULT '',
      email text NOT NULL,
      phone text DEFAULT '',
      whatsapp text DEFAULT '',
      store_name text NOT NULL DEFAULT '',
      store_description text DEFAULT '',
      product_categories text DEFAULT '',
      country text DEFAULT '',
      city text DEFAULT '',
      instagram_url text DEFAULT '',
      website_url text DEFAULT '',
      additional_info text DEFAULT '',
      status text NOT NULL DEFAULT 'pending',
      admin_note text DEFAULT '',
      reviewed_at timestamp,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("vendor_products", sql`
    CREATE TABLE IF NOT EXISTS vendor_products (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id uuid NOT NULL,
      vendor_id uuid NOT NULL,
      status text NOT NULL DEFAULT 'pending',
      admin_note text DEFAULT '',
      submitted_at timestamp NOT NULL DEFAULT now(),
      approved_at timestamp
    )
  `));

  steps.push(await run("vendor_orders", sql`
    CREATE TABLE IF NOT EXISTS vendor_orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id uuid NOT NULL,
      vendor_id uuid NOT NULL,
      items text NOT NULL DEFAULT '[]',
      subtotal numeric(12,2) NOT NULL DEFAULT 0,
      commission_rate numeric(5,2) NOT NULL DEFAULT 10,
      commission_amount numeric(12,2) NOT NULL DEFAULT 0,
      vendor_earning numeric(12,2) NOT NULL DEFAULT 0,
      currency text DEFAULT 'USD',
      status text NOT NULL DEFAULT 'pending',
      created_at timestamp NOT NULL DEFAULT now()
    )
  `));

  steps.push(await run("vendor_payouts", sql`
    CREATE TABLE IF NOT EXISTS vendor_payouts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      vendor_id uuid NOT NULL,
      amount numeric(12,2) NOT NULL,
      currency text DEFAULT 'USD',
      method text DEFAULT 'bank',
      reference text DEFAULT '',
      note text DEFAULT '',
      status text NOT NULL DEFAULT 'pending',
      requested_at timestamp NOT NULL DEFAULT now(),
      paid_at timestamp,
      processed_by text DEFAULT ''
    )
  `));

  steps.push(await run("concierge_requests", sql`
    CREATE TABLE IF NOT EXISTS concierge_requests (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      vendor_id uuid NOT NULL,
      tier text NOT NULL DEFAULT 'basic',
      fee numeric(10,2) NOT NULL DEFAULT 0,
      product_name text DEFAULT '',
      product_brand text DEFAULT '',
      product_category text DEFAULT '',
      product_price text DEFAULT '',
      product_compare_price text DEFAULT '',
      product_material text DEFAULT '',
      product_sizes text DEFAULT '',
      product_colors text DEFAULT '',
      product_stock integer DEFAULT 0,
      source_images text DEFAULT '[]',
      notes text DEFAULT '',
      status text NOT NULL DEFAULT 'pending',
      admin_note text DEFAULT '',
      vendor_response text DEFAULT '',
      created_product_id uuid,
      created_at timestamp NOT NULL DEFAULT now(),
      completed_at timestamp,
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `));

  let seededSettings = false;
  try {
    const existing = await db.select().from(settings).limit(1);
    if (existing.length === 0) {
      await db.insert(settings).values({
        id: 1,
        storeName: "New Deal Zone",
        whatsappNumber: "+22891791492",
        currency: "NGN",
        adminPassword: "admin123",
        adminAccessCode: "",
        adminPath: "jevw",
        sessionSecret: crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, ""),
        maxLoginAttempts: 5,
        lockoutMinutes: 15,
      });
      seededSettings = true;
    }
  } catch (e: any) {
    steps.push({ label: "seed_settings", ok: false, error: e?.message });
  }

  let seededCategories = 0;
  try {
    const existingCats = await db.select().from(categories);
    if (existingCats.length === 0) {
      const cats = [
        { slug: "sneakers", nameEn: "Sneakers", nameFr: "Baskets", active: true, sortOrder: 1 },
        { slug: "running", nameEn: "Running", nameFr: "Course", active: true, sortOrder: 2 },
        { slug: "formal", nameEn: "Formal", nameFr: "Formelles", active: true, sortOrder: 3 },
        { slug: "boots", nameEn: "Boots", nameFr: "Bottes", active: true, sortOrder: 4 },
        { slug: "sandals", nameEn: "Sandals", nameFr: "Sandales", active: true, sortOrder: 5 },
        { slug: "casual", nameEn: "Casual", nameFr: "D\u00e9contract\u00e9es", active: true, sortOrder: 6 },
      ];
      await db.insert(categories).values(cats);
      seededCategories = cats.length;
    } else {
      seededCategories = existingCats.length;
    }
  } catch (e: any) {
    steps.push({ label: "seed_categories", ok: false, error: e?.message });
  }

  let seededAuthor = false;
  try {
    const existingAuthors = await db.select().from(authors).limit(1);
    if (existingAuthors.length === 0) {
      await db.insert(authors).values({
        id: "c412acd2-68c5-4105-8869-b143400d244a",
        name: "Aime Komlan",
        slug: "aime-komlan",
        email: "komlaimelebon@gmail.com",
        bio: "Founder of New Deal Zone",
        bioFr: "Fondateur de New Deal Zone",
        role: "Founder",
        roleFr: "Fondateur",
        active: true,
      });
      seededAuthor = true;
    }
  } catch (e: any) {
    steps.push({ label: "seed_author", ok: false, error: e?.message });
  }

  const failed = steps.filter((s) => !s.ok);

  return NextResponse.json({
    success: failed.length === 0,
    message: failed.length === 0 ? "Database schema initialized" : "Completed with some errors",
    seededSettings,
    seededCategories,
    seededAuthor,
    tablesOk: steps.filter((s) => s.ok).length,
    tablesFailed: failed,
    adminPath: "jevw",
    adminPasswordHint: "admin123 (change after login)",
    timestamp: new Date().toISOString(),
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: "POST /api/setup/init-db with header x-setup-key: ndz-init-2026",
  });
}
