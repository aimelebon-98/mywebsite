import { isRateLimited } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, passwordResetTokens } from "@/db/schema";
import { eq, and, gte, isNull } from "drizzle-orm";
import { hashPassword } from "@/lib/customer-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = String(body.token || "");
    const password = String(body.password || "");

    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    const [reset] = await db.select().from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        gte(passwordResetTokens.expiresAt, new Date()),
        isNull(passwordResetTokens.usedAt),
      )).limit(1);

    if (!reset) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

    const passwordHash = await hashPassword(password);
    await db.update(customers).set({ passwordHash, updatedAt: new Date() }).where(eq(customers.id, reset.customerId));
    await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.token, token));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
