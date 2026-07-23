import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { authors } from "@/db/schema";

export async function GET() {
  try {
    // Create authors table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS authors (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
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
        created_at timestamp DEFAULT NOW() NOT NULL
      )
    `);

    // Create blog_posts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        slug text NOT NULL UNIQUE,
        title text NOT NULL,
        excerpt text NOT NULL DEFAULT '',
        content text NOT NULL DEFAULT '',
        cover_image text NOT NULL DEFAULT '',
        title_fr text,
        excerpt_fr text,
        content_fr text,
        category text NOT NULL DEFAULT 'style-tips',
        tags text NOT NULL DEFAULT '[]',
        tags_fr text,
        author_id uuid,
        read_time integer NOT NULL DEFAULT 5,
        published boolean NOT NULL DEFAULT false,
        featured boolean NOT NULL DEFAULT false,
        published_at timestamp,
        view_count integer NOT NULL DEFAULT 0,
        seo_title text,
        meta_description text,
        focus_keyphrase text,
        og_image text,
        canonical_url text,
        no_index boolean NOT NULL DEFAULT false,
        seo_title_fr text,
        meta_description_fr text,
        focus_keyphrase_fr text,
        created_at timestamp DEFAULT NOW() NOT NULL,
        updated_at timestamp DEFAULT NOW() NOT NULL
      )
    `);

    // Add indexes for performance
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id)`);

    // Seed default author if none exist
    const existing = await db.select().from(authors).limit(1);
    let defaultAuthor = null;
    if (existing.length === 0) {
      const inserted = await db.insert(authors).values({
        name: "SoleVault Team",
        slug: "solevault-team",
        avatar: "https://ui-avatars.com/api/?name=SoleVault+Team&background=111827&color=fff&bold=true&size=200",
        email: "team@solevault.com",
        bio: "The SoleVault editorial team - your source for premium footwear insights, style guides, and sneaker culture.",
        bioFr: "L'equipe editoriale SoleVault - votre source pour les conseils sur les chaussures premium, les guides de style et la culture sneaker.",
        role: "Editorial Team",
        roleFr: "Equipe editoriale",
        active: true,
        sortOrder: 1,
      }).returning();
      defaultAuthor = inserted[0];
    }

    return NextResponse.json({
      success: true,
      message: "Blog tables created successfully.",
      seededDefaultAuthor: defaultAuthor !== null,
      defaultAuthor,
    });
  } catch (error) {
    console.error("Blog migration error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
