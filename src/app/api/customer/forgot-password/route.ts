import { isRateLimited } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateToken, isValidEmail } from "@/lib/customer-auth";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const locale = body.locale === "fr" ? "fr" : "en";

    // Always return success to prevent email enumeration
    if (!isValidEmail(email)) return NextResponse.json({ ok: true });

    const [customer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    if (!customer) return NextResponse.json({ ok: true });

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(passwordResetTokens).values({
      token, customerId: customer.id, expiresAt,
    });

    await sendPasswordResetEmail(email, customer.name, token, locale);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
