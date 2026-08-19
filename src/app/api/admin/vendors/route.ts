import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, vendorProducts, products } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");

    let rows;
    if (statusFilter && statusFilter !== "all") {
      rows = await db.select().from(vendors).where(eq(vendors.status, statusFilter));
    } else {
      rows = await db.select().from(vendors);
    }

    // Sort by newest first
    rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ vendors: rows });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { vendorId, action, commissionRate, adminNote, settleAmount } = body;

    if (!vendorId) return NextResponse.json({ error: "vendorId required" }, { status: 400 });

    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vendorId)).limit(1);
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const update: Record<string, unknown> = { updatedAt: new Date() };

    if (action === "suspend") {
      update.status = "suspended";
      if (typeof adminNote === "string") update.adminNote = adminNote.slice(0, 1000);
      // Hide all vendor's products
      try {
        const myVps = await db.select().from(vendorProducts).where(eq(vendorProducts.vendorId, vendorId));
        const pids = myVps.map(v => v.productId);
        if (pids.length > 0) {
          await db.update(products).set({ active: false, updatedAt: new Date() }).where(inArray(products.id, pids));
        }
      } catch (e) { console.error("Failed to hide products on suspend:", e); }
    } else if (action === "reactivate") {
      update.status = "approved";
      // Restore products that were approved by admin
      try {
        const myApprovedVps = await db.select().from(vendorProducts)
          .where(and(eq(vendorProducts.vendorId, vendorId), eq(vendorProducts.status, "approved")));
        const pids = myApprovedVps.map(v => v.productId);
        if (pids.length > 0) {
          await db.update(products).set({ active: true, updatedAt: new Date() }).where(inArray(products.id, pids));
        }
      } catch (e) { console.error("Failed to restore products on reactivate:", e); }
    } else if (action === "update_commission") {
      const rate = parseFloat(String(commissionRate || "0"));
      if (isNaN(rate) || rate < 0 || rate > 100) return NextResponse.json({ error: "Invalid commission rate" }, { status: 400 });
      update.commissionRate = rate.toFixed(2);
    } else if (action === "update_note") {
      if (typeof adminNote === "string") update.adminNote = adminNote.slice(0, 1000);
    } else if (action === "settle_concierge_debt") {
      const amt = parseFloat(String(settleAmount || "0"));
      if (isNaN(amt) || amt <= 0) return NextResponse.json({ error: "Invalid settlement amount" }, { status: 400 });

      const vAny = vendor as unknown as { conciergeDebt?: string; conciergePaidTotal?: string };
      const currentDebt = parseFloat(vAny.conciergeDebt ?? "0");
      const currentPaid = parseFloat(vAny.conciergePaidTotal ?? "0");

      if (amt > currentDebt) return NextResponse.json({ error: "Amount exceeds current debt" }, { status: 400 });

      update.conciergeDebt = (currentDebt - amt).toFixed(2);
      update.conciergePaidTotal = (currentPaid + amt).toFixed(2);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await db.update(vendors).set(update as unknown as Partial<typeof vendors.$inferInsert>).where(eq(vendors.id, vendorId));

    return NextResponse.json({ success: true, message: "Vendor updated" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}