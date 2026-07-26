import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { blogPosts } from "@/db/schema";

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    const cols = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'blog_posts'
      ORDER BY ordinal_position;
    `);
    results.actualColumns = cols.rows || cols;
  } catch (e) {
    results.columnsError = String(e);
  }

  try {
    const count = await db.execute(sql`SELECT COUNT(*) as c FROM blog_posts;`);
    results.rowCount = count.rows || count;
  } catch (e) {
    results.countError = String(e);
  }

  try {
    const posts = await db.select().from(blogPosts).limit(1);
    results.drizzleSelect = "OK";
    results.samplePost = posts[0];
  } catch (e) {
    results.drizzleError = String(e);
  }

  return NextResponse.json(results);
}