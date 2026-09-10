import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendorProducts, products, vendors } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
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
        status: vp.status,
        adminNote: vp.adminNote,
        submittedAt: vp.submittedAt,
        product: p,
        vendor: v,
      };
    }).filter(Boolean);

    items.sort((a, b) => new Date(b!.submittedAt).getTime() - new Date(a!.submittedAt).getTime());

    const pendingCount = items.filter(i => i!.status === "pending").length;
    return NextResponse.json({ items, pendingCount });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { vendorProductId, vendorProductIds, action, adminNote } = body;

    const ids: string[] = Array.isArray(vendorProductIds)
      ? vendorProductIds.filter((id: unknown) => typeof id === "string" && id.length > 0)
      : vendorProductId
      ? [String(vendorProductId)]
      : [];

    if (ids.length === 0 || !["approve", "reject", "suspend"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const note = String(adminNote || "").slice(0, 1000);
    let updatedCount = 0;

    for (const vpId of ids) {
      const [vp] = await db.select().from(vendorProducts).where(eq(vendorProducts.id, vpId)).limit(1);
      if (!vp) continue;

      const [product] = await db.select().from(products).where(eq(products.id, vp.productId)).limit(1);
      const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vp.vendorId)).limit(1);

      const vpUpdate: Record<string, unknown> = { adminNote: note };
      const prodUpdate: Record<string, unknown> = { updatedAt: new Date() };
      let approved = false;

      if (action === "approve") {
        vpUpdate.status = "approved";
        vpUpdate.approvedAt = new Date();
        prodUpdate.active = true;
        approved = true;
      } else if (action === "reject") {
        vpUpdate.status = "rejected";
        prodUpdate.active = false;
      } else if (action === "suspend") {
        vpUpdate.status = "suspended";
        prodUpdate.active = false;
      }

      await db.update(vendorProducts).set(vpUpdate as any).where(eq(vendorProducts.id, vpId));
      await db.update(products).set(prodUpdate as any).where(eq(products.id, vp.productId));

      if (vendor && product && (action === "approve" || action === "reject")) {
        sendVendorProductStatusEmail(
          vendor.email,
          vendor.contactName || vendor.storeName,
          product.name,
          approved,
          note,
          "en"
        ).catch((e) => console.error("Email failed:", e));
      }
      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: ids.length > 1 ? `Updated ${updatedCount} products` : "Product updated",
      updated: updatedCount,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}