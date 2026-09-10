import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAffiliate, hashAffiliatePassword, verifyAffiliatePassword } from "@/lib/affiliate-auth";
import { ensureAffiliateTablesExist } from "@/lib/ensure-affiliate-tables";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    await ensureAffiliateTablesExist();
    const affiliate = await requireAffiliate();
    if (affiliate instanceof NextResponse) return affiliate;

    const body = await req.json();
    const { name, phone, whatsapp, country, city, bankAccount, currentPassword, newPassword } = body;

    const updates: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (name) updates.name = String(name).trim();
    if (phone !== undefined) updates.phone = String(phone).trim() || null;
    if (whatsapp !== undefined) updates.whatsapp = String(whatsapp).trim() || null;
    if (country !== undefined) updates.country = String(country).trim() || null;
    if (city !== undefined) updates.city = String(city).trim() || null;
    if (bankAccount !== undefined) {
      updates.bankAccount = String(bankAccount).trim() || null;
      updates.bankName = "USDT-TRC20";
      updates.bankAccountName = "USDT TRC20 Wallet";
    }

    if (newPassword && newPassword.trim().length >= 6) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 });
      }
      const valid = await verifyAffiliatePassword(currentPassword, affiliate.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      }
      updates.passwordHash = await hashAffiliatePassword(newPassword.trim());
      updates.mustChangePassword = false;
    }

    const [updated] = await db
      .update(affiliates)
      .set(updates)
      .where(eq(affiliates.id, affiliate.id))
      .returning();

    return NextResponse.json({ success: true, affiliate: updated });
  } catch (error) {
    console.error("Affiliate settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}