import { NextResponse } from "next/server";
import { db } from "@/db";
import { conciergeRequests, vendors, vendorProducts, products } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");

    let rows;
    if (statusFilter && statusFilter !== "all") {
      rows = await db.select().from(conciergeRequests)
        .where(eq(conciergeRequests.status, statusFilter))
        .orderBy(desc(conciergeRequests.createdAt));
    } else {
      rows = await db.select().from(conciergeRequests).orderBy(desc(conciergeRequests.createdAt));
    }

    const vendorIds = Array.from(new Set(rows.map(r => r.vendorId)));
    let vendorMap = new Map<string, { storeName: string; email: string }>();
    if (vendorIds.length > 0) {
      const vs = await db.select().from(vendors);
      vendorMap = new Map(vs.filter(v => vendorIds.includes(v.id)).map(v => [v.id, { storeName: v.storeName, email: v.email }]));
    }

    const enriched = rows.map(r => ({
      ...r,
      vendorInfo: vendorMap.get(r.vendorId) || null,
    }));

    const pendingCount = rows.filter(r => r.status === "pending").length;
    return NextResponse.json({ requests: enriched, pendingCount });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { requestId, action, adminNote, createdProductId } = await req.json();

    if (!requestId || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const [request] = await db.select().from(conciergeRequests).where(eq(conciergeRequests.id, requestId)).limit(1);
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof adminNote === "string") update.adminNote = adminNote.slice(0, 1000);

    switch (action) {
      case "in_progress":
        update.status = "in_progress"; break;
      case "needs_info":
        update.status = "needs_info"; break;
      case "cancel":
        update.status = "cancelled"; break;
      case "complete":
        if (!createdProductId) return NextResponse.json({ error: "createdProductId required to complete" }, { status: 400 });

        // Verify product exists
        const [product] = await db.select().from(products).where(eq(products.id, createdProductId)).limit(1);
        if (!product) return NextResponse.json({ error: "Product with that ID not found. Create it first in Products tab." }, { status: 404 });

        // Link to vendor if not already linked
        const [existingLink] = await db.select().from(vendorProducts)
          .where(and(eq(vendorProducts.productId, createdProductId), eq(vendorProducts.vendorId, request.vendorId)))
          .limit(1);

        if (!existingLink) {
          // Create vendorProducts link as "approved" (admin made it, no need for approval)
          await db.insert(vendorProducts).values({
            productId: createdProductId,
            vendorId: request.vendorId,
            status: "approved",
            adminNote: `Auto-created via concierge request ${requestId}`,
            approvedAt: new Date(),
          });
        } else if (existingLink.vendorId !== request.vendorId) {
          return NextResponse.json({ error: "This product is already linked to a different vendor" }, { status: 409 });
        }

        // Ensure product is active
        if (!product.active) {
          await db.update(products).set({ active: true, updatedAt: new Date() }).where(eq(products.id, createdProductId));
        }

        update.status = "completed";
        update.completedAt = new Date();
        update.createdProductId = createdProductId;

        // Add fee to vendor debt
        try {
          const [v] = await db.select().from(vendors).where(eq(vendors.id, request.vendorId)).limit(1);
          if (v) {
            const vAny = v as unknown as { conciergeDebt?: string };
            const currentDebt = parseFloat(vAny.conciergeDebt ?? "0");
            const newDebt = currentDebt + parseFloat(request.fee);
            await db.update(vendors).set({
              conciergeDebt: newDebt.toFixed(2),
              updatedAt: new Date(),
            } as unknown as Partial<typeof vendors.$inferInsert>).where(eq(vendors.id, request.vendorId));
          }
        } catch (e) { console.error("Failed to update vendor debt:", e); }
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await db.update(conciergeRequests).set(update as unknown as Partial<typeof conciergeRequests.$inferInsert>).where(eq(conciergeRequests.id, requestId));

    return NextResponse.json({ success: true, message: action === "complete" ? "Completed - product linked to vendor and now visible in their dashboard" : "Updated" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}