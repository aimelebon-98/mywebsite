import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAffiliate } from "@/lib/affiliate-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const affiliate = await requireAffiliate();
  if (affiliate instanceof NextResponse) return affiliate;

  try {
    const body = await request.json();
    const {
      name,
      phone,
      whatsapp,
      country,
      city,
      bankName,
      bankAccount,
      bankAccountName,
      preferredCurrency,
    } = body;

    await db
      .update(affiliates)
      .set({
        name: name?.trim() || affiliate.name,
        phone: phone?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        country: country?.trim() || null,
        city: city?.trim() || null,
        bankName: bankName?.trim() || null,
        bankAccount: bankAccount?.trim() || null,
        bankAccountName: bankAccountName?.trim() || null,
        preferredCurrency: preferredCurrency || affiliate.preferredCurrency || "USD",
        updatedAt: new Date(),
      })
      .where(eq(affiliates.id, affiliate.id));

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
    });
  } catch (error) {
    console.error("Affiliate settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}