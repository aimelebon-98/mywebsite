import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

// One-time endpoint: converts <p><strong>Title</strong></p> to <h2>Title</h2> in longDescription
// for SEO. Also converts <p><strong>Title</strong></p> in longDescriptionFr.
// DELETE this file after running once.

function upgradeHeadings(html: string): string {
  if (!html) return html;
  // Match: <p><strong>anything</strong></p>  -> <h2>anything</h2>
  // Also handle cases with whitespace/newlines between tags
  let result = html;
  result = result.replace(
    /<p>\s*<strong>([^<]+)<\/strong>\s*<\/p>/g,
    "<h2>$1</h2>"
  );
  return result;
}

export async function GET(request: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const results: { id: string; name: string; status: string; changes: string[] }[] = [];
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  try {
    const allProducts = await db.select().from(products);

    for (const product of allProducts) {
      const updates: Record<string, unknown> = {};
      const changes: string[] = [];

      if (product.longDescription) {
        const upgraded = upgradeHeadings(product.longDescription);
        if (upgraded !== product.longDescription) {
          updates.longDescription = upgraded;
          const count = (upgraded.match(/<h2>/g) || []).length;
          changes.push(`EN: converted ${count} paragraph(s) to h2`);
        }
      }

      if (product.longDescriptionFr) {
        const upgraded = upgradeHeadings(product.longDescriptionFr);
        if (upgraded !== product.longDescriptionFr) {
          updates.longDescriptionFr = upgraded;
          const count = (upgraded.match(/<h2>/g) || []).length;
          changes.push(`FR: converted ${count} paragraph(s) to h2`);
        }
      }

      if (Object.keys(updates).length === 0) {
        skipped++;
        results.push({ id: product.id, name: product.name, status: "no-change", changes: [] });
        continue;
      }

      updates.updatedAt = new Date();

      try {
        await db.update(products).set(updates).where(eq(products.id, product.id));
        updated++;
        results.push({ id: product.id, name: product.name, status: "upgraded", changes });
      } catch (err) {
        errors++;
        results.push({ id: product.id, name: product.name, status: "error", changes: [String(err)] });
      }
    }

    return NextResponse.json({
      success: true,
      operation: "Convert <p><strong> to <h2> for SEO",
      summary: { total: allProducts.length, updated, skipped, errors },
      results,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}