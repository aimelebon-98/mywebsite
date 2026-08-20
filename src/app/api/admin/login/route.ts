import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminSessions, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { isRateLimited } from "@/lib/rate-limit";
import { verifyRequestOrigin } from "@/lib/csrf";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const originOk = await verifyRequestOrigin();
    if (!originOk) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const h = await headers();
    const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "";

    if (isRateLimited(ip, 5, 60000)) {
      return NextResponse.json({ error: "Too many login attempts. Please wait 1 minute." }, { status: 429 });
    }

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const [st] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
    const adminPass = st?.adminPassword || process.env.ADMIN_PASSWORD || "admin123";

    if (password !== adminPass) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(adminSessions).values({ token, expiresAt });

    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}