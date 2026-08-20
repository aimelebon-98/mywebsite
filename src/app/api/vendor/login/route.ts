import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyVendorPassword, createVendorSession } from "@/lib/vendor-auth";
import { verifyTurnstile } from "@/lib/turnstile";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password, turnstileToken } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const h = await headers();
    const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "";
    const ua = h.get("user-agent") || "";

    if (turnstileToken) {
      const captchaOk = await verifyTurnstile(turnstileToken, ip);
      if (!captchaOk) {
        console.warn("[Vendor Login] Turnstile token verification failed or expired");
      }
    }

    const emailNorm = String(email).toLowerCase().trim();
    const [vendor] = await db.select().from(vendors).where(eq(vendors.email, emailNorm)).limit(1);

    if (!vendor) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyVendorPassword(password, vendor.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (vendor.status === "pending") {
      return NextResponse.json({ error: "Your application is still being reviewed" }, { status: 403 });
    }
    if (vendor.status === "rejected") {
      return NextResponse.json({ error: "Your application was not approved" }, { status: 403 });
    }
    if (vendor.status === "suspended") {
      return NextResponse.json({ error: "Your account is suspended. Contact support." }, { status: 403 });
    }

    await createVendorSession(vendor.id, ip, ua);

    const vendorAny = vendor as unknown as { mustChangePassword?: boolean };
    return NextResponse.json({
      success: true,
      vendor: {
        id: vendor.id,
        email: vendor.email,
        storeName: vendor.storeName,
        storeSlug: vendor.storeSlug,
        mustChangePassword: vendorAny.mustChangePassword ?? false,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}