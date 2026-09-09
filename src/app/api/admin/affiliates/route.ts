import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { ensureAffiliateTablesExist } from "@/lib/ensure-affiliate-tables";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await ensureAffiliateTablesExist();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim();

    const list = await db
      .select()
      .from(affiliates)
      .orderBy(desc(affiliates.createdAt));

    const filtered = search
      ? list.filter(
          (a) =>
            a.name.toLowerCase().includes(search) ||
            a.email.toLowerCase().includes(search) ||
            a.code.toLowerCase().includes(search)
        )
      : list;

    const totalEarningsAll = filtered.reduce(
      (acc, a) => acc + parseFloat(a.totalEarnings || "0"),
      0
    );
    const totalPendingPayoutAll = filtered.reduce(
      (acc, a) => acc + parseFloat(a.pendingPayout || "0"),
      0
    );
    const totalPaidOutAll = filtered.reduce(
      (acc, a) => acc + parseFloat(a.totalPaidOut || "0"),
      0
    );

    return NextResponse.json({
      success: true,
      affiliates: filtered,
      stats: {
        totalAffiliates: filtered.length,
        totalEarningsAll: totalEarningsAll.toFixed(2),
        totalPendingPayoutAll: totalPendingPayoutAll.toFixed(2),
        totalPaidOutAll: totalPaidOutAll.toFixed(2),
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Admin fetch affiliates error:", error);
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    await ensureAffiliateTablesExist();

    const body = await request.json();
    const {
      affiliateId,
      affiliateIds,
      commissionRate,
      status,
      adminNote,
      action,
    } = body;

    const ids: string[] = Array.isArray(affiliateIds)
      ? affiliateIds.filter((id: unknown) => typeof id === "string" && id.length > 0)
      : affiliateId
      ? [String(affiliateId)]
      : [];

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "affiliateId or affiliateIds is required" },
        { status: 400 }
      );
    }

    // Bulk status shortcut via action
    let targetStatus = status;
    if (action === "approve") targetStatus = "approved";
    if (action === "suspend") targetStatus = "suspended";
    if (action === "reject") targetStatus = "rejected";
    if (action === "pending") targetStatus = "pending";

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (commissionRate !== undefined && commissionRate !== null && commissionRate !== "") {
      const rate = parseFloat(String(commissionRate));
      if (isNaN(rate) || rate < 0 || rate > 50) {
        return NextResponse.json(
          { error: "Commission rate must be between 0 and 50" },
          { status: 400 }
        );
      }
      updates.commissionRate = String(rate);
    }

    if (targetStatus !== undefined && targetStatus !== null && targetStatus !== "") {
      const allowed = ["approved", "suspended", "pending", "rejected"];
      if (!allowed.includes(String(targetStatus))) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updates.status = String(targetStatus);
      if (String(targetStatus) === "approved") {
        updates.approvedAt = new Date();
      }
    }

    if (adminNote !== undefined) updates.adminNote = adminNote;

    if (Object.keys(updates).length <= 1) {
      return NextResponse.json(
        { error: "Nothing to update (provide status, action, or commissionRate)" },
        { status: 400 }
      );
    }

    await db
      .update(affiliates)
      .set(updates)
      .where(inArray(affiliates.id, ids));

    return NextResponse.json({
      success: true,
      message:
        ids.length > 1
          ? `Updated ${ids.length} affiliate${ids.length === 1 ? "" : "s"}`
          : "Affiliate updated successfully",
      updated: ids.length,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Admin update affiliate error:", error);
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}