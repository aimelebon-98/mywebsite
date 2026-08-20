import { NextResponse } from "next/server";
import { destroySession } from "@/lib/customer-auth";
import { isRateLimited } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const h = await headers();
    const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "";

    if (isRateLimited(ip, 10, 60000)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    await destroySession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}