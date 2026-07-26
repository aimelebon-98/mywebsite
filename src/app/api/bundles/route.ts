import { NextResponse } from "next/server";
import { db } from "@/db";
import { bundles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const active = await db
      .select()
      .from(bundles)
      .where(eq(bundles.active, true))
      .orderBy(desc(bundles.priority), desc(bundles.discountPercent));
    return NextResponse.json(active);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
