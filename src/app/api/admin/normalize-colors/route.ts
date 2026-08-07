import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseColorVariants, serializeColorVariants } from "@/lib/color-variants";
import { normalizeColorName } from "@/lib/color-map";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const all = await db.select({ id: products.id, name: products.name, colors: products.colors }).from(products);
    let updated = 0;
    const changes: Array<{ name: string; before: string; after: string }> = [];

    for (const p of all) {
      const variants = parseColorVariants(p.colors);
      if (variants.length === 0) continue;
      const normalized = variants.map(v => ({ ...v, name: normalizeColorName(v.name) }));
      const before = p.colors;
      const after = serializeColorVariants(normalized);
      if (before !== after) {
        await db.update(products).set({ colors: after }).where(eq(products.id, p.id));
        updated++;
        changes.push({ name: p.name, before, after });
      }
    }

    return NextResponse.json({ success: true, scanned: all.length, updated, changes });
  } catch (error) {
    console.error("Normalize colors error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}