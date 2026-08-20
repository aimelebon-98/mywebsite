import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, passwordResetTokens } from "@/db/schema";
import { eq, and, gte, isNull } from "drizzle-orm";
import { hashPassword } from "@/lib/customer-auth";
import { isRateLimited } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const h = await headers();
    const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "";

    if (isRateLimited(ip, 5, 3600000)) {
      return NextResponse.json({ error: "Too many password reset attempts. Please wait an hour." }, { status: 429 });
    }

    const { token, newPassword } = await req.json();

    if (!token || !newPassword || String(newPassword).length < 8) {
      return NextResponse.json({ error: "Token and password (min 8 chars) required" }, { status: 400 });
    }

    const [resetRecord] = await db.select().from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, String(token)),
        gte(passwordResetTokens.expiresAt, new Date()),
        isNull(passwordResetTokens.usedAt)
      ))
      .limit(1);

    if (!resetRecord) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(String(newPassword));

    await db.update(customers)
      .set({ passwordHash: hashedPassword, updatedAt: new Date() })
      .where(eq(customers.id, resetRecord.customerId));

    await db.update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.token, resetRecord.token));

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}