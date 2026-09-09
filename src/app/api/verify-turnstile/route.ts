import { NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 });
    }
    const valid = await verifyTurnstile(token);
    return NextResponse.json({ success: valid });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}