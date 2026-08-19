import { NextResponse } from "next/server";
import { destroyVendorSession } from "@/lib/vendor-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await destroyVendorSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}