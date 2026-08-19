import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentVendor, verifyVendorPassword, hashVendorPassword } from "@/lib/vendor-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }

    const vendorAny = vendor as unknown as { mustChangePassword?: boolean };
    const isForced = vendorAny.mustChangePassword;

    // If not forced change, require current password
    if (!isForced) {
      if (!currentPassword) return NextResponse.json({ error: "Current password required" }, { status: 400 });
      const ok = await verifyVendorPassword(currentPassword, vendor.passwordHash);
      if (!ok) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    const newHash = await hashVendorPassword(newPassword);
    await db.update(vendors).set({
      passwordHash: newHash,
      mustChangePassword: false,
      updatedAt: new Date(),
    } as unknown as Partial<typeof vendors.$inferInsert>).where(eq(vendors.id, vendor.id));

    return NextResponse.json({ success: true, message: "Password updated" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}