import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAffiliate } from "@/lib/affiliate-auth";
import { ensureAffiliateTablesExist } from "@/lib/ensure-affiliate-tables";
import { generateBase32Secret, getOtpAuthUrl, verifyTOTPCode, generateQrCodeSvgDataUrl } from "@/lib/totp";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureAffiliateTablesExist();

  const affiliate = await requireAffiliate();
  if (affiliate instanceof NextResponse) return affiliate;

  // Refresh affiliate row from DB to get latest schema fields
  const [dbAff] = await db.select().from(affiliates).where(eq(affiliates.id, affiliate.id)).limit(1);
  if (!dbAff) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });

  let secret = dbAff.totpSecret;
  if (!secret) {
    secret = generateBase32Secret();
    await db
      .update(affiliates)
      .set({ totpSecret: secret })
      .where(eq(affiliates.id, dbAff.id));
  }

  const otpAuthUrl = getOtpAuthUrl(secret, dbAff.email);
  const qrDataUrl = generateQrCodeSvgDataUrl(otpAuthUrl);

  return NextResponse.json({
    success: true,
    secret,
    qrUrl: otpAuthUrl,
    qrDataUrl,
    enabled: Boolean(dbAff.totpEnabled),
  });
}

export async function POST(req: NextRequest) {
  await ensureAffiliateTablesExist();

  const affiliate = await requireAffiliate();
  if (affiliate instanceof NextResponse) return affiliate;

  const [dbAff] = await db.select().from(affiliates).where(eq(affiliates.id, affiliate.id)).limit(1);
  if (!dbAff) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });

  const { code, action } = await req.json();

  if (action === "disable") {
    await db
      .update(affiliates)
      .set({ totpEnabled: false, totpSecret: null })
      .where(eq(affiliates.id, dbAff.id));

    return NextResponse.json({ success: true, enabled: false });
  }

  const secret = dbAff.totpSecret;
  if (!secret) return NextResponse.json({ error: "2FA setup secret missing" }, { status: 400 });

  const isValid = verifyTOTPCode(secret, String(code));
  if (!isValid) return NextResponse.json({ error: "Invalid code. Please check Google Authenticator." }, { status: 400 });

  await db
    .update(affiliates)
    .set({ totpEnabled: true })
    .where(eq(affiliates.id, dbAff.id));

  return NextResponse.json({ success: true, enabled: true });
}