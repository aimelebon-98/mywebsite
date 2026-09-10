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
    return NextResponse.json({ success: true, affiliates: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load affiliates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    const body = await req.json();
    const { action, ids, targetStatus, commissionRate } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No affiliate IDs provided" }, { status: 400 });
    }

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

    await db.update(affiliates).set(updates).where(inArray(affiliates.id, ids));

    return NextResponse.json({
      success: true,
      message: "Affiliates updated successfully",
      updated: ids.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update affiliates" }, { status: 500 });
  }
}
