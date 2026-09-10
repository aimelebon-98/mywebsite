import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliateApplications } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    const list = await db.select().from(affiliates).orderBy(affiliates.createdAt);

    let totalEarningsAll = 0;
    let totalPendingPayoutAll = 0;
    let totalPaidOutAll = 0;

    list.forEach((a) => {
      totalEarningsAll += parseFloat(a.totalEarnings || "0");
      totalPendingPayoutAll += parseFloat(a.pendingPayout || "0");
      totalPaidOutAll += parseFloat(a.totalPaidOut || "0");
    });

    return NextResponse.json({
      success: true,
      affiliates: list,
      stats: {
        totalAffiliates: list.length,
        totalEarningsAll: totalEarningsAll.toFixed(2),
        totalPendingPayoutAll: totalPendingPayoutAll.toFixed(2),
        totalPaidOutAll: totalPaidOutAll.toFixed(2),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load affiliates" }, { status: 500 });
  }
}

async function handleUpdateOrDelete(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    const body = await req.json();

    // Support both single ID (affiliateId) and bulk array (ids or affiliateIds)
    const rawIds = body.ids || body.affiliateIds || (body.affiliateId ? [body.affiliateId] : []);
    const ids: string[] = Array.isArray(rawIds) ? rawIds : [rawIds];

    const action = body.action;
    const targetStatus = body.targetStatus || body.status;
    const commissionRate = body.commissionRate;

    if (ids.length === 0 || !ids[0]) {
      return NextResponse.json({ error: "No affiliate IDs provided" }, { status: 400 });
    }

    // ---------- DELETE ACTION ----------
    if (action === "delete") {
      const rows = await db
        .select({ id: affiliates.id, email: affiliates.email })
        .from(affiliates)
        .where(inArray(affiliates.id, ids));

      for (const row of rows) {
        const cleanEmail = (row.email || "").toLowerCase().trim();
        try {
          await db.delete(affiliateApplications).where(eq(sql`LOWER(${affiliateApplications.email})`, cleanEmail));
        } catch (e) {}
      }

      // Unlink sub-affiliates recruited by deleted affiliate
      await db
        .update(affiliates)
        .set({ parentAffiliateId: null })
        .where(inArray(affiliates.parentAffiliateId, ids));

      await db.delete(affiliates).where(inArray(affiliates.id, ids));

      return NextResponse.json({
        success: true,
        message: ids.length > 1 ? `Deleted ${ids.length} affiliates` : "Affiliate deleted",
        updated: ids.length,
        deleted: ids.length,
      });
    }

    // ---------- UPDATE STATUS / COMMISSION RATE ----------
    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (commissionRate !== undefined && commissionRate !== null && commissionRate !== "") {
      const rate = parseFloat(String(commissionRate));
      if (isNaN(rate) || rate < 0 || rate > 50) {
        return NextResponse.json({ error: "Commission rate must be between 0 and 50" }, { status: 400 });
      }
      updates.commissionRate = String(rate);
    }

    if (targetStatus !== undefined && targetStatus !== null && targetStatus !== "") {
      const allowed = ["approved", "suspended", "pending", "rejected"];
      if (!allowed.includes(targetStatus)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      updates.status = targetStatus;
      if (targetStatus === "approved") {
        updates.approvedAt = new Date();
      }
    }

    // Apply bulk status actions if action is approve, suspend, or reject
    if (action === "approve") {
      updates.status = "approved";
      updates.approvedAt = new Date();
    } else if (action === "suspend") {
      updates.status = "suspended";
    } else if (action === "reject") {
      updates.status = "rejected";
    }

    await db.update(affiliates).set(updates).where(inArray(affiliates.id, ids));

    return NextResponse.json({
      success: true,
      message: "Affiliates updated successfully",
      updated: ids.length,
    });
  } catch (err: any) {
    console.error("Admin affiliates update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update affiliates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handleUpdateOrDelete(req);
}

export async function PUT(req: NextRequest) {
  return handleUpdateOrDelete(req);
}
