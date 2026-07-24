import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS blog_comments (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        post_id uuid NOT NULL,
        parent_id uuid,
        author_name text NOT NULL,
        author_email text NOT NULL DEFAULT '',
        content text NOT NULL,
        approved boolean NOT NULL DEFAULT false,
        likes integer NOT NULL DEFAULT 0,
        ip_address text NOT NULL DEFAULT '',
        created_at timestamp DEFAULT NOW() NOT NULL
      )
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON blog_comments(approved)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_blog_comments_parent ON blog_comments(parent_id)`);

    return NextResponse.json({ success: true, message: "Comments table created" });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
