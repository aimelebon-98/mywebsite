import { NextResponse } from "next/server";
import { requireAffiliate } from "@/lib/affiliate-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const affiliate = await requireAffiliate();
  if (affiliate instanceof NextResponse) return affiliate;

  const { passwordHash: _, ...safeAffiliate } = affiliate;
  return NextResponse.json({ success: true, affiliate: safeAffiliate });
}