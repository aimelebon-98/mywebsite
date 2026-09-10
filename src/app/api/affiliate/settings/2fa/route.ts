import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAffiliate } from "@/lib/affiliate-auth";
import { generateBase32Secret, getOtpAuthUrl, verifyTOTPCode } from "@/lib/totp";

export const dynamic = "force-dynamic";

export async function GET() {
  const affiliate = await requireAffiliate();
  if (affiliate instanceof NextResponse) return affiliate;

  let secret = (affiliate as any).totpSecret;
  if (!secret) {
    secret = generateBase32Secret();
    await db
      .update(affiliates)
      .set({ totpSecret: secret } as any)
      .where(eq(affiliates.id, affiliate.id));
  }

  const qrUrl = getOtpAuthUrl(secret, affiliate.email);
  return NextResponse.json({
    success: true,
    secret,
    qrUrl,
    enabled: Boolean((affiliate as any).totpEnabled),
  });
}

export async function POST(req: NextRequest) {
  const affiliate = await requireAffiliate();
  if (affiliate instanceof NextResponse) return affiliate;

  const { code, action } = await req.json();

  if (action === "disable") {
    await db
      .update(affiliates)
      .set({ totpEnabled: false, totpSecret: null } as any)
      .where(eq(affiliates.id, affiliate.id));

    return NextResponse.json({ success: true, enabled: false });
  }

  const secret = (affiliate as any).totpSecret;
  if (!secret) return NextResponse.json({ error: "2FA setup secret missing" }, { status: 400 });

  const isValid = verifyTOTPCode(secret, String(code));
  if (!isValid) return NextResponse.json({ error: "Invalid code. Please check Google Authenticator." }, { status: 400 });

  await db
    .update(affiliates)
    .set({ totpEnabled: true } as any)
    .where(eq(affiliates.id, affiliate.id));

  return NextResponse.json({ success: true, enabled: true });
}