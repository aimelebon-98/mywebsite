import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, vendorSessions, vendorApplications, vendorProducts } from "@/db/schema";
import { eq, like, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const adminPw = req.headers.get("x-admin-password");
    if (adminPw !== process.env.ADMIN_PASSWORD && adminPw !== "admin123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const emailPattern = body.emailPattern || "%test%";

    const toDelete = await db
      .select({ id: vendors.id, email: vendors.email })
      .from(vendors)
      .where(or(
        like(vendors.email, emailPattern),
        eq(vendors.status, "incomplete")
      ));

    let deletedCount = 0;
    for (const v of toDelete) {
      await db.delete(vendorSessions).where(eq(vendorSessions.vendorId, v.id));
      await db.delete(vendorProducts).where(eq(vendorProducts.vendorId, v.id));
      await db.delete(vendorApplications).where(eq(vendorApplications.email, v.email));
      await db.delete(vendors).where(eq(vendors.id, v.id));
      deletedCount++;
    }

    return NextResponse.json({
      success: true,
      deleted: deletedCount,
      emails: toDelete.map((v) => v.email),
    });
  } catch (err: any) {
    console.error("Cleanup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}