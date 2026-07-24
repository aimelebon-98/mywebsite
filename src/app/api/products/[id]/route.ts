import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";
import { requireAdmin } from "@/lib/admin-auth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    let result = await db.select().from(products).where(eq(products.slug, id));
    if (result.length === 0) {
      try {
        result = await db.select().from(products).where(eq(products.id, id));
      } catch {}
    }
    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  try {
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      updates.name = body.name;
      updates.slug = generateSlug(body.name);
    }
    if (body.description !== undefined) updates.description = body.description;
    if (body.shortDescription !== undefined) updates.shortDescription = body.shortDescription;
    if (body.longDescription !== undefined) updates.longDescription = body.longDescription;

    if (body.nameFr !== undefined)             updates.nameFr             = body.nameFr             ? String(body.nameFr)             : null;
    if (body.descriptionFr !== undefined)      updates.descriptionFr      = body.descriptionFr      ? String(body.descriptionFr)      : null;
    if (body.shortDescriptionFr !== undefined) updates.shortDescriptionFr = body.shortDescriptionFr ? String(body.shortDescriptionFr) : null;
    if (body.longDescriptionFr !== undefined)  updates.longDescriptionFr  = body.longDescriptionFr  ? String(body.longDescriptionFr)  : null;
    if (body.tagsFr !== undefined) {
      updates.tagsFr = body.tagsFr ? JSON.stringify(Array.isArray(body.tagsFr) ? body.tagsFr : []) : null;
    }

    if (body.price !== undefined) updates.price = String(body.price);
    if (body.comparePrice !== undefined) updates.comparePrice = body.comparePrice ? String(body.comparePrice) : null;
    if (body.category !== undefined) updates.category = body.category;
    if (body.brand !== undefined) updates.brand = body.brand;
    if (body.sizes !== undefined) updates.sizes = JSON.stringify(body.sizes || []);
    if (body.colors !== undefined) updates.colors = JSON.stringify(body.colors || []);
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
    if (body.images !== undefined) updates.images = JSON.stringify(body.images || []);
    if (body.stock !== undefined) updates.stock = parseInt(String(body.stock));
    if (body.featured !== undefined) updates.featured = Boolean(body.featured);
    if (body.active !== undefined) updates.active = Boolean(body.active);
    if (body.material !== undefined) updates.material = body.material;
    if (body.sku !== undefined) updates.sku = body.sku;
    if (body.tags !== undefined) updates.tags = JSON.stringify(body.tags || []);

    // SEO fields
    if (body.seoTitle !== undefined)          updates.seoTitle          = body.seoTitle          || null;
    if (body.metaDescription !== undefined)   updates.metaDescription   = body.metaDescription   || null;
    if (body.focusKeyphrase !== undefined)    updates.focusKeyphrase    = body.focusKeyphrase    || null;
    if (body.ogImage !== undefined)           updates.ogImage           = body.ogImage           || null;
    if (body.canonicalUrl !== undefined)      updates.canonicalUrl      = body.canonicalUrl      || null;
    if (body.noIndex !== undefined)           updates.noIndex           = Boolean(body.noIndex);
    if (body.seoTitleFr !== undefined)        updates.seoTitleFr        = body.seoTitleFr        || null;
    if (body.metaDescriptionFr !== undefined) updates.metaDescriptionFr = body.metaDescriptionFr || null;
    if (body.focusKeyphraseFr !== undefined)  updates.focusKeyphraseFr  = body.focusKeyphraseFr  || null;

    updates.updatedAt = new Date();

    const result = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  try {
    const { id } = await params;
    await db.delete(reviews).where(eq(reviews.productId, id));
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted: result[0] });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}