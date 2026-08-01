import { NextResponse } from "next/server";
import { db } from "@/db";
import { blogCategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cats = await db.select().from(blogCategories).where(eq(blogCategories.active, true)).orderBy(asc(blogCategories.sortOrder));
    return NextResponse.json(cats);
  } catch {
    return NextResponse.json([]);
  }
}
