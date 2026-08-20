import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletter } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isRateLimited } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const h = await headers();
    const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "";

    if (isRateLimited(ip, 5, 60000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { email, turnstileToken } = await req.json();

    if (turnstileToken) {
      const ok = await verifyTurnstile(turnstileToken, ip);
      if (!ok) {
        return NextResponse.json({ error: "Security check failed" }, { status: 403 });
      }
    }

    const emailNorm = String(email || "").toLowerCase().trim();
    if (!emailNorm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const [existing] = await db.select().from(newsletter).where(eq(newsletter.email, emailNorm)).limit(1);
    if (!existing) {
      await db.insert(newsletter).values({ email: emailNorm });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}