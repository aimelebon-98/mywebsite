import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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
    const { affiliateId, commissionRate, status, adminNote } = body;

    if (!affiliateId) {
      return NextResponse.json(
        { error: "affiliateId is required" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.id, affiliateId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (commissionRate !== undefined) {
      const rate = parseFloat(String(commissionRate));
      if (isNaN(rate) || rate < 0 || rate > 50) {
        return NextResponse.json(
          { error: "Commission rate must be between 0 and 50" },
          { status: 400 }
        );
      }
      updates.commissionRate = String(commissionRate);
    }
    if (status !== undefined) updates.status = status;
    if (adminNote !== undefined) updates.adminNote = adminNote;

    const [updated] = await db
      .update(affiliates)
      .set(updates)
      .where(eq(affiliates.id, affiliateId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Affiliate updated successfully",
      affiliate: updated,
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