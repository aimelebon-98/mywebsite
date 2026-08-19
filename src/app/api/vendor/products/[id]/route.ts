import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, vendorProducts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentVendor } from "@/lib/vendor-auth";

export const dynamic = "force-dynamic";

async function assertOwnership(productId: string, vendorId: string) {
  const [vp] = await db.select().from(vendorProducts)
    .where(and(eq(vendorProducts.productId, productId), eq(vendorProducts.vendorId, vendorId)))
    .limit(1);
  return vp;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const vp = await assertOwnership(id, vendor.id);
    if (!vp) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json({
      product: {
        ...product,
        vendorStatus: vp.status,
        adminNote: vp.adminNote,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const vp = await assertOwnership(id, vendor.id);
    if (!vp) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const body = await req.json();
    const upd: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof body.name === "string") upd.name = body.name.slice(0, 200);
    if (typeof body.nameFr === "string") upd.nameFr = body.nameFr.slice(0, 200);
    if (typeof body.description === "string") upd.description = body.description.slice(0, 500);
    if (typeof body.descriptionFr === "string") upd.descriptionFr = body.descriptionFr.slice(0, 500);
    if (typeof body.shortDescription === "string") upd.shortDescription = body.shortDescription.slice(0, 500);
    if (typeof body.shortDescriptionFr === "string") upd.shortDescriptionFr = body.shortDescriptionFr.slice(0, 500);
    if (typeof body.longDescription === "string") upd.longDescription = body.longDescription.slice(0, 20000);
    if (typeof body.longDescriptionFr === "string") upd.longDescriptionFr = body.longDescriptionFr.slice(0, 20000);

    if (body.price !== undefined) {
      const p = parseFloat(String(body.price));
      if (!isNaN(p) && p > 0) upd.price = p.toFixed(2);
    }
    if (body.comparePrice !== undefined) {
      const p = parseFloat(String(body.comparePrice));
      upd.comparePrice = !isNaN(p) && p > 0 ? p.toFixed(2) : null;
    }

    if (typeof body.category === "string") upd.category = body.category;
    if (typeof body.brand === "string") upd.brand = body.brand.slice(0, 100);
    if (typeof body.material === "string") upd.material = body.material.slice(0, 200);
    if (typeof body.sku === "string") upd.sku = body.sku.slice(0, 60);
    if (Array.isArray(body.sizes)) upd.sizes = JSON.stringify(body.sizes);
    if (Array.isArray(body.colors)) upd.colors = JSON.stringify(body.colors);
    if (Array.isArray(body.images)) upd.images = JSON.stringify(body.images);
    if (typeof body.imageUrl === "string") upd.imageUrl = body.imageUrl.slice(0, 500);
    if (body.stock !== undefined) upd.stock = parseInt(String(body.stock), 10) || 0;
    if (Array.isArray(body.tags)) upd.tags = JSON.stringify(body.tags);
    if (Array.isArray(body.tagsFr)) upd.tagsFr = JSON.stringify(body.tagsFr);
    if (typeof body.seoTitle === "string") upd.seoTitle = body.seoTitle || null;
    if (typeof body.seoTitleFr === "string") upd.seoTitleFr = body.seoTitleFr || null;
    if (typeof body.metaDescription === "string") upd.metaDescription = body.metaDescription || null;
    if (typeof body.metaDescriptionFr === "string") upd.metaDescriptionFr = body.metaDescriptionFr || null;
    if (typeof body.focusKeyphrase === "string") upd.focusKeyphrase = body.focusKeyphrase || null;
    if (typeof body.focusKeyphraseFr === "string") upd.focusKeyphraseFr = body.focusKeyphraseFr || null;
    if (typeof body.ogImage === "string") upd.ogImage = body.ogImage || null;
    if (typeof body.originCountry === "string") upd.originCountry = body.originCountry.slice(0, 5);
    if (typeof body.originCity === "string") upd.originCity = body.originCity.slice(0, 60);

    // Any edit hides product + returns to pending
    upd.active = false;

    await db.update(products).set(upd as unknown as Partial<typeof products.$inferInsert>).where(eq(products.id, id));

    await db.update(vendorProducts).set({
      status: "pending",
      submittedAt: new Date(),
      approvedAt: null,
    }).where(eq(vendorProducts.id, vp.id));

    return NextResponse.json({ success: true, message: "Product updated and resubmitted for approval" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const vp = await assertOwnership(id, vendor.id);
    if (!vp) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await db.delete(products).where(eq(products.id, id));
    await db.delete(vendorProducts).where(eq(vendorProducts.id, vp.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}