import { requireAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bundles } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select().from(bundles).orderBy(desc(bundles.priority));
    return NextResponse.json(all);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const authErr = await requireAdmin(); if (authErr) return authErr;
  try {
    const b = await req.json();
    const [created] = await db.insert(bundles).values({
      name: b.name || "Untitled",
      nameFr: b.nameFr || null,
      description: b.description || "",
      descriptionFr: b.descriptionFr || null,
      minItems: b.minItems ?? 2,
      discountPercent: b.discountPercent ?? 10,
      category: b.category || "",
      active: b.active ?? true,
      priority: b.priority ?? 0,
    }).returning();
    return NextResponse.json(created);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
