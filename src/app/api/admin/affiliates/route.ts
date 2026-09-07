import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// GET: List all affiliates with optional search
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim();

    let query = db.select().from(affiliates).orderBy(desc(affiliates.createdAt));

    const list = await query;
    const filtered = search
      ? list.filter(
          (a) =>
            a.name.toLowerCase().includes(search) ||
            a.email.toLowerCase().includes(search) ||
            a.code.toLowerCase().includes(search)
        )
      : list;

    // Aggregates
    const totalAffiliates = filtered.length;
    const totalEarningsAll = filtered.reduce(
      (acc, a) => acc + parseFloat(a.totalEarnings || "0"),
      0
    );
    const totalPendingPayoutAll = filtered.reduce(
      (acc, a) => acc + parseFloat(a.pendingPayout || "0"),
      0
    );

    return NextResponse.json({
      success: true,
      affiliates: filtered,
      stats: {
        totalAffiliates,
        totalEarningsAll: totalEarningsAll.toFixed(2),
        totalPendingPayoutAll: totalPendingPayoutAll.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Admin fetch affiliates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update affiliate (status, commission rate, admin notes)
export async function PUT(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
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

    if (commissionRate !== undefined) updates.commissionRate = String(commissionRate);
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
    console.error("Admin update affiliate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}