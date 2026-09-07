import { NextResponse } from "next/server";
import { ensureAffiliateTablesExist } from "@/lib/ensure-affiliate-tables";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureAffiliateTablesExist();
    return NextResponse.json({
      success: true,
      message: "Affiliate database tables created successfully!",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}