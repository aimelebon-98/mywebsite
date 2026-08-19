import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendorProducts, products, vendors } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { sendVendorProductStatusEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");

    let vps;
    if (statusFilter && statusFilter !== "all") {
      vps = await db.select().from(vendorProducts).where(eq(vendorProducts.status, statusFilter));
    } else {
      vps = await db.select().from(vendorProducts);
    }

    if (vps.length === 0) return NextResponse.json({ items: [], pendingCount: 0 });

    const productIds = vps.map(v => v.productId);
    const vendorIds = Array.from(new Set(vps.map(v => v.vendorId)));

    const [prods, vs] = await Promise.all([
      db.select().from(products).where(inArray(products.id, productIds)),
      db.select().from(vendors).where(inArray(vendors.id, vendorIds)),
    ]);

    const vMap = new Map(vs.map(v => [v.id, { storeName: v.storeName, email: v.email, storeSlug: v.storeSlug, contactName: v.contactName }]));
    const pMap = new Map(prods.map(p => [p.id, p]));

    const items = vps.map(vp => {
      const p = pMap.get(vp.productId);
      const v = vMap.get(vp.vendorId);
      if (!p) return null;
      return {
        id: vp.id,
        productId: vp.productId,
        vendorId: vp.vendorId,
        status: vp.status,
        adminNote: vp.adminNote,
        submittedAt: vp.submittedAt,
        approvedAt: vp.approvedAt,
        vendor: v || null,
        product: {
          name: p.name,
          nameFr: p.nameFr,
          slug: p.slug,
          price: p.price,
          comparePrice: p.comparePrice,
          category: p.category,
          brand: p.brand,
          material: p.material,
          stock: p.stock,
          imageUrl: p.imageUrl,
          images: p.images,
          sizes: p.sizes,
          colors: p.colors,
          shortDescription: p.shortDescription,
          longDescription: p.longDescription,
          shortDescriptionFr: p.shortDescriptionFr,
          longDescriptionFr: p.longDescriptionFr,
          seoTitle: p.seoTitle,
          metaDescription: p.metaDescription,
          focusKeyphrase: p.focusKeyphrase,
          originCountry: p.originCountry,
          originCity: p.originCity,
          active: p.active,
        },
      };
    }).filter(Boolean);

    items.sort((a, b) => new Date(b!.submittedAt).getTime() - new Date(a!.submittedAt).getTime());

    const pendingCount = vps.filter(v => v.status === "pending").length;
    return NextResponse.json({ items, pendingCount });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { vendorProductId, action, adminNote } = await req.json();
    if (!vendorProductId || !["approve", "reject", "suspend"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const [vp] = await db.select().from(vendorProducts).where(eq(vendorProducts.id, vendorProductId)).limit(1);
    if (!vp) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [product] = await db.select().from(products).where(eq(products.id, vp.productId)).limit(1);
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vp.vendorId)).limit(1);

    const note = String(adminNote || "").slice(0, 1000);
    const vpUpdate: Record<string, unknown> = { adminNote: note };
    const prodUpdate: Record<string, unknown> = { updatedAt: new Date() };
    let approved = false;

    if (action === "approve") {
      vpUpdate.status = "approved";
      vpUpdate.approvedAt = new Date();
      prodUpdate.active = true;
      approved = true;
      // Also update vendor stats total product count if needed later
    } else if (action === "reject") {
      if (!note.trim()) return NextResponse.json({ error: "Rejection reason required" }, { status: 400 });
      vpUpdate.status = "rejected";
      prodUpdate.active = false;
    } else if (action === "suspend") {
      vpUpdate.status = "suspended";
      prodUpdate.active = false;
    }

    await db.update(vendorProducts).set(vpUpdate as unknown as Partial<typeof vendorProducts.$inferInsert>).where(eq(vendorProducts.id, vendorProductId));
    await db.update(products).set(prodUpdate as unknown as Partial<typeof products.$inferInsert>).where(eq(products.id, vp.productId));

    // Send email to vendor
    if (vendor && product && (action === "approve" || action === "reject")) {
      sendVendorProductStatusEmail(vendor.email, vendor.contactName || vendor.storeName, product.name, approved, note, "en")
        .catch(e => console.error("[Email] Product status email failed:", e));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}