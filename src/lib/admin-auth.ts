import { cookies } from "next/headers";
import { db } from "@/db";
import { adminSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Verify the caller has a valid admin session
export async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;
    const session = await db.select().from(adminSessions).where(eq(adminSessions.token, token));
    if (session.length === 0) return false;
    return new Date(session[0].expiresAt) > new Date();
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
