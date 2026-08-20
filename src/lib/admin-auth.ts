import { cookies } from "next/headers";
import { db } from "@/db";
import { adminSessions } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

// Verify the caller has a valid admin session
export async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
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
      if (age > 24 * 60 * 60 * 1000) {
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

// Returns 401 response if not admin, or null if authorized
export async function requireAdmin(): Promise<NextResponse | null> {
  const ok = await verifyAdmin();
  if (!ok) return new NextResponse("Not Found", { status: 404 });
  return null;
}