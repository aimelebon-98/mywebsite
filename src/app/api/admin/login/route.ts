import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminSessions, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { isRateLimited } from "@/lib/rate-limit";
import { verifyRequestOrigin } from "@/lib/csrf";
import { verifyAdminPassword, hashAdminPassword, ADMIN_COOKIE_NAME, ADMIN_SESSION_DURATION_HOURS } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  password: z.string().min(1, "Password required").max(200),
});

export async function POST(req: Request) {
  try {
    const originOk = await verifyRequestOrigin();
    if (!originOk) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const h = await headers();
    const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",").pop()?.trim() || h.get("x-real-ip") || "";

    if (isRateLimited(ip, 5, 60000)) {
      return NextResponse.json({ error: "Too many login attempts. Please wait 1 minute." }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { password } = parsed.data;

    const [st] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
    const adminPass = st?.adminPassword || process.env.ADMIN_PASSWORD;

    if (!adminPass) {
      console.error("[Admin Login] No admin password configured. Set ADMIN_PASSWORD env var or configure in settings.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const isValid = await verifyAdminPassword(password, adminPass);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Auto-upgrade plaintext password to bcrypt hash in DB upon successful login
    if (!adminPass.startsWith("$2a$") && !adminPass.startsWith("$2b$") && !adminPass.startsWith("$2y$")) {
      try {
        const hashedPassword = await hashAdminPassword(password);
        await db.update(settings).set({ adminPassword: hashedPassword }).where(eq(settings.id, 1));
      } catch (upgradeErr) {
        console.warn("[Admin Login] Password auto-hash upgrade skipped:", upgradeErr);
      }
    }

    const token = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + ADMIN_SESSION_DURATION_HOURS * 60 * 60 * 1000);

    await db.insert(adminSessions).values({ token, expiresAt });

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_SESSION_DURATION_HOURS * 60 * 60,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Login] Error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}