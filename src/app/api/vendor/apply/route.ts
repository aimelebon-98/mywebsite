import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyTurnstile } from "@/lib/turnstile";
import { isRateLimited } from "@/lib/rate-limit";
import { headers } from "next/headers";
import {
  hashVendorPassword,
  generateUniqueStoreSlug,
  createVendorSession,
} from "@/lib/vendor-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const h = await headers();
    const ip =
      h.get("cf-connecting-ip") ||
      h.get("x-forwarded-for")?.split(",")[0] ||
      h.get("x-real-ip") ||
      "";
    const ua = h.get("user-agent") || "";

    if (isRateLimited(ip, 5, 3600000)) {
      return NextResponse.json(
        { error: "Too many signups from this IP. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { applicantName, email, password, turnstileToken } = body;

    if (!applicantName || !email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Name, email, and a password (min 6 chars) are required" },
        { status: 400 }
      );
    }

    if (process.env.TURNSTILE_SECRET_KEY && turnstileToken) {
      const captchaOk = await verifyTurnstile(turnstileToken, ip);
      if (!captchaOk) {
        return NextResponse.json(
          { error: "Security verification failed." },
          { status: 403 }
        );
      }
    }

    const emailNorm = String(email).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const [existingVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.email, emailNorm))
      .limit(1);

    if (existingVendor) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    const storeName = `${String(applicantName).split(" ")[0]}'s Store`;
    const storeSlug = await generateUniqueStoreSlug(storeName);
    const passwordHash = await hashVendorPassword(password);

    const [newVendor] = await db
      .insert(vendors)
      .values({
        email: emailNorm,
        passwordHash,
        storeName: storeName.slice(0, 100),
        storeSlug,
        contactName: String(applicantName).slice(0, 100),
        status: "incomplete",
        mustChangePassword: false,
      })
      .returning();

    await createVendorSession(newVendor.id, ip, ua);

    return NextResponse.json({
      success: true,
      redirectTo: "dashboard",
    });
  } catch (error) {
    console.error("Vendor simple signup error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}