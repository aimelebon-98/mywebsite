import { cookies } from "next/headers";
import { db } from "@/db";
import { adminSessions } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_SESSION_DURATION_HOURS = 24;

export async function hashAdminPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyAdminPassword(password: string, storedHashOrPass: string): Promise<boolean> {
  if (!password || !storedHashOrPass) return false;

  // If stored value is already a bcrypt hash ($2a$, $2b$, or $2y$)
  if (storedHashOrPass.startsWith("$2a$") || storedHashOrPass.startsWith("$2b$") || storedHashOrPass.startsWith("$2y$")) {
    return bcrypt.compare(password, storedHashOrPass);
  }

  // Fallback for plaintext passwords: use timing-safe comparison to prevent timing attacks
  try {
    const bufA = Buffer.from(password, "utf8");
    const bufB = Buffer.from(storedHashOrPass, "utf8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return password === storedHashOrPass;
  }
}

// Verify the caller has a valid admin session
export async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return false;

    // Check token exists AND is not expired (DB-level check)
    const session = await db.select().from(adminSessions)
      .where(and(
        eq(adminSessions.token, token),
        gte(adminSessions.expiresAt, new Date())
      ))
      .limit(1);

    if (session.length === 0) return false;

    // Hard cap: reject sessions older than 24 hours regardless of expiresAt
    const createdAt = session[0].createdAt;
    if (createdAt) {
      const age = Date.now() - new Date(createdAt).getTime();
      if (age > ADMIN_SESSION_DURATION_HOURS * 60 * 60 * 1000) {
        // Clean up stale session
        await db.delete(adminSessions).where(eq(adminSessions.token, token)).catch(() => {});
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

// Returns 404 response if not admin, or null if authorized
export async function requireAdmin(): Promise<NextResponse | null> {
  const ok = await verifyAdmin();
  if (!ok) return new NextResponse("Not Found", { status: 404 });
  return null;
}