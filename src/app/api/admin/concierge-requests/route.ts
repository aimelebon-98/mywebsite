import { NextResponse } from "next/server";
import { db } from "@/db";
import { conciergeRequests, vendors } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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

    // Enrich with vendor info
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
        update.status = "completed";
        update.completedAt = new Date();
        if (createdProductId) update.createdProductId = createdProductId;
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

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}