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

    rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ vendors: rows });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function hideVendorProducts(vendorId: string) {
  try {
    const myVps = await db.select().from(vendorProducts).where(eq(vendorProducts.vendorId, vendorId));
    const pids = myVps.map((v) => v.productId);
    if (pids.length > 0) {
      await db
        .update(products)
        .set({ active: false, updatedAt: new Date() })
        .where(inArray(products.id, pids));
    }
  } catch (e) {
    console.error("Failed to hide products on suspend:", e);
  }
}

async function restoreVendorProducts(vendorId: string) {
  try {
    const myApprovedVps = await db
      .select()
      .from(vendorProducts)
      .where(
        and(
          eq(vendorProducts.vendorId, vendorId),
          eq(vendorProducts.status, "approved")
        )
      );
    const pids = myApprovedVps.map((v) => v.productId);
    if (pids.length > 0) {
      await db
        .update(products)
        .set({ active: true, updatedAt: new Date() })
        .where(inArray(products.id, pids));
    }
  } catch (e) {
    console.error("Failed to restore products on reactivate:", e);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const {
      vendorId,
      vendorIds,
      action,
      commissionRate,
      adminNote,
      settleAmount,
    } = body;

    // ---------- BULK ACTIONS ----------
    const ids: string[] = Array.isArray(vendorIds)
      ? vendorIds.filter((id: unknown) => typeof id === "string" && id.length > 0)
      : vendorId
      ? [String(vendorId)]
      : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "vendorId or vendorIds required" }, { status: 400 });
    }

    if (
      ![
        "suspend",
        "reactivate",
        "approve",
        "reject",
        "update_commission",
        "update_note",
        "settle_concierge_debt",
      ].includes(action)
    ) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Single-only actions
    if (
      (action === "update_note" || action === "settle_concierge_debt") &&
      ids.length > 1
    ) {
      return NextResponse.json(
        { error: "This action only supports one vendor at a time" },
        { status: 400 }
      );
    }

    let updated = 0;

    for (const id of ids) {
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, id))
        .limit(1);
      if (!vendor) continue;

      const update: Record<string, unknown> = { updatedAt: new Date() };

      if (action === "suspend") {
        update.status = "suspended";
        if (typeof adminNote === "string") update.adminNote = adminNote.slice(0, 1000);
        await hideVendorProducts(id);
      } else if (action === "reactivate" || action === "approve") {
        update.status = "approved";
        update.approvedAt = vendor.approvedAt || new Date();
        if (typeof adminNote === "string") update.adminNote = adminNote.slice(0, 1000);
        await restoreVendorProducts(id);
      } else if (action === "reject") {
        update.status = "rejected";
        if (typeof adminNote === "string") update.adminNote = adminNote.slice(0, 1000);
        await hideVendorProducts(id);
      } else if (action === "update_commission") {
        const rate = parseFloat(String(commissionRate || "0"));
        if (isNaN(rate) || rate < 0 || rate > 100) {
          return NextResponse.json(
            { error: "Invalid commission rate" },
            { status: 400 }
          );
        }
        update.commissionRate = rate.toFixed(2);
      } else if (action === "update_note") {
        if (typeof adminNote === "string") update.adminNote = adminNote.slice(0, 1000);
      } else if (action === "settle_concierge_debt") {
        const amt = parseFloat(String(settleAmount || "0"));
        if (isNaN(amt) || amt <= 0) {
          return NextResponse.json(
            { error: "Invalid settlement amount" },
            { status: 400 }
          );
        }
        const vAny = vendor as unknown as {
          conciergeDebt?: string;
          conciergePaidTotal?: string;
        };
        const currentDebt = parseFloat(vAny.conciergeDebt ?? "0");
        const currentPaid = parseFloat(vAny.conciergePaidTotal ?? "0");
        if (amt > currentDebt) {
          return NextResponse.json(
            { error: "Amount exceeds current debt" },
            { status: 400 }
          );
        }
        update.conciergeDebt = (currentDebt - amt).toFixed(2);
        update.conciergePaidTotal = (currentPaid + amt).toFixed(2);
      }

      await db
        .update(vendors)
        .set(update as unknown as Partial<typeof vendors.$inferInsert>)
        .where(eq(vendors.id, id));
      updated++;
    }

    return NextResponse.json({
      success: true,
      message:
        ids.length > 1
          ? `Updated ${updated} vendor${updated === 1 ? "" : "s"}`
          : "Vendor updated",
      updated,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}