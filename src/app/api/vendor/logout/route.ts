import { NextResponse } from "next/server";
import { destroyVendorSession } from "@/lib/vendor-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await destroyVendorSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to destroy vendor session" }, { status: 500 });
  }
}