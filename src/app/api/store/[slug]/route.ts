import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, vendorProducts, products } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });

    const [vendor] = await db.select().from(vendors).where(eq(vendors.storeSlug, slug)).limit(1);
    if (!vendor) return NextResponse.json({ error: "Store not found" }, { status: 404 });
    if (vendor.status !== "approved") return NextResponse.json({ error: "Store unavailable" }, { status: 404 });

    // Get all approved vendor products
    const vps = await db.select().from(vendorProducts)
      .where(and(eq(vendorProducts.vendorId, vendor.id), eq(vendorProducts.status, "approved")));

    let items: unknown[] = [];
    if (vps.length > 0) {
      const productIds = vps.map(v => v.productId);
      const prods = await db.select().from(products).where(inArray(products.id, productIds));
      // Only include active products
      items = prods.filter(p => p.active).map(p => ({
        id: p.id,
        name: p.name,
        nameFr: p.nameFr,
        slug: p.slug,
        slugFr: p.slugFr,
        price: p.price,
        comparePrice: p.comparePrice,
        imageUrl: p.imageUrl,
        images: p.images,
        category: p.category,
        brand: p.brand,
        rating: p.rating,
        reviewCount: p.reviewCount,
        stock: p.stock,
        originCountry: p.originCountry,
        originCity: p.originCity,
      }));
    }

    const vAny = vendor as unknown as { conciergeDebt?: string };
    return NextResponse.json({
      store: {
        id: vendor.id,
        storeName: vendor.storeName,
        storeSlug: vendor.storeSlug,
        storeDescription: vendor.storeDescription,
        storeDescriptionFr: vendor.storeDescriptionFr,
        logo: vendor.logo,
        banner: vendor.banner,
        trustTagline: vendor.trustTagline,
        trustTaglineFr: vendor.trustTaglineFr,
        totalSales: vendor.totalSales,
        fulfillmentRate: vendor.fulfillmentRate,
        country: vendor.country,
        city: vendor.city,
        approvedAt: vendor.approvedAt,
      },
      products: items,
      count: items.length,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}