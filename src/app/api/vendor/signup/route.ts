import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, vendorSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashVendorPassword } from "@/lib/vendor-auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, contactName } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await db.select().from(vendors).where(eq(vendors.email, email.toLowerCase().trim()));
    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hash = await hashVendorPassword(password);
    const vendorId = crypto.randomUUID();
    const now = new Date();

    await db.insert(vendors).values({
      id: vendorId,
      email: email.toLowerCase().trim(),
      passwordHash: hash,
      storeName: "",
      storeSlug: "",
      storeDescription: "",
      storeDescriptionFr: "",
      contactName: contactName || "",
      phone: "",
      whatsapp: "",
      country: "",
      city: "",
      bankName: "",
      bankAccount: "",
      bankAccountName: "",
      commissionRate: 10,
      status: "pending",
      fulfillmentRate: 100,
      totalSales: 0,
      totalEarnings: 0,
      pendingPayout: 0,
      totalPaidOut: 0,
      conciergeDebt: 0,
      conciergePaidTotal: 0,
      preferredCurrency: "USD",
      mustChangePassword: false,
      adminNote: "",
      createdAt: now,
      updatedAt: now,
    });

    const token = crypto.randomBytes(32).toString("hex");
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const ua = req.headers.get("user-agent") || "unknown";

    await db.insert(vendorSessions).values({
      id: crypto.randomUUID(),
      token,
      vendorId,
      ipAddress: ip,
      userAgent: ua,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: now,
    });

    const res = NextResponse.json({
      success: true,
      vendor: { id: vendorId, email: email.toLowerCase().trim(), status: "pending" },
    });

    res.cookies.set("ndz_vendor_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (err: any) {
    console.error("Vendor signup error:", err);
    return NextResponse.json({ error: "Signup failed. Please try again." }, { status: 500 });
  }
}
