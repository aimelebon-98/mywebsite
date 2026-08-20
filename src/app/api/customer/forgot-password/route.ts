import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateToken, isValidEmail } from "@/lib/customer-auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { isRateLimited } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const h = await headers();
    const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "";

    if (isRateLimited(ip, 3, 3600000)) {
      return NextResponse.json({ error: "Too many password reset requests. Please wait an hour." }, { status: 429 });
    }

    const { email, locale } = await req.json();
    const emailNorm = String(email || "").toLowerCase().trim();

    if (!isValidEmail(emailNorm)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const [customer] = await db.select().from(customers).where(eq(customers.email, emailNorm)).limit(1);

    if (customer) {
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(passwordResetTokens).values({
        customerId: customer.id,
        token,
        expiresAt,
      });

      const lang = locale === "fr" ? "fr" : "en";
      sendPasswordResetEmail(emailNorm, customer.name || "Customer", token, lang).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "If that email is registered, a password reset link has been sent.",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}