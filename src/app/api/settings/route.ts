import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const SENSITIVE_FIELDS = ["adminPassword", "adminPath"];

function stripSensitive(row: Record<string, unknown>): Record<string, unknown> {
  const cleaned = { ...row };
  for (const field of SENSITIVE_FIELDS) {
    delete cleaned[field];
  }
  return cleaned;
}

export async function GET(req: Request) {
  try {
    const internalSecret = process.env.INTERNAL_API_SECRET || "ndz-internal-2024";
    const headerVal = req.headers.get("x-internal");
    const isInternalMiddleware = headerVal === internalSecret || headerVal === "middleware";

    const isAdmin = isInternalMiddleware || await (async () => {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const token = cookieStore.get("admin_session")?.value;
        if (!token) return false;
        const { adminSessions } = await import("@/db/schema");
        const session = await db.select().from(adminSessions).where(eq(adminSessions.token, token));
        return session.length > 0 && new Date(session[0].expiresAt) > new Date();
      } catch {
        return false;
      }
    })();

    const [st] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
    if (!st) return NextResponse.json({});

    if (isAdmin) {
      const { adminPassword, ...rest } = st as Record<string, unknown>;
      return NextResponse.json(rest);
    }

    return NextResponse.json(stripSensitive(st as Record<string, unknown>));
  } catch (error) {
    console.error("[Settings GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const body = await req.json();
    delete body.id;
    const [existing] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);

    if (existing) {
      await db.update(settings).set(body).where(eq(settings.id, 1));
    } else {
      await db.insert(settings).values({ id: 1, ...body });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : "Failed to update settings";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}