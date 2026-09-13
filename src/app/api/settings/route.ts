import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

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

    let st: any = null;
    try {
      const rows = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
      st = rows[0] || null;
    } catch (dbErr) {
      console.error("[Settings GET] DB Select Error (falling back):", dbErr);
    }

    if (!st) {
      return NextResponse.json({
        storeName: "NewDealZone",
        currency: "$",
        adminPath: process.env.ADMIN_PATH || "jevw",
        heroStyle: "classic",
      });
    }

    if (isAdmin) {
      const { adminPassword, ...rest } = st as Record<string, unknown>;
      return NextResponse.json({
        adminPath: "jevw",
        heroStyle: "classic",
        ...rest,
      });
    }

    const { adminPassword, adminPath, ...publicSettings } = st as Record<string, unknown>;
    return NextResponse.json(publicSettings);
  } catch (error) {
    console.error("[Settings GET] Error:", error);
    return NextResponse.json({
      storeName: "NewDealZone",
      currency: "$",
      adminPath: "jevw",
      heroStyle: "classic",
    });
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
      try {
        await db.update(settings).set(body).where(eq(settings.id, 1));
      } catch (updateErr: any) {
        if (updateErr?.message?.includes("hero_style") || updateErr?.code === "42703") {
          await db.execute(sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_style text NOT NULL DEFAULT 'classic';`);
          await db.update(settings).set(body).where(eq(settings.id, 1));
        } else {
          throw updateErr;
        }
      }
    } else {
      try {
        await db.insert(settings).values({ id: 1, ...body });
      } catch (insertErr: any) {
        if (insertErr?.message?.includes("hero_style") || insertErr?.code === "42703") {
          await db.execute(sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_style text NOT NULL DEFAULT 'classic';`);
          await db.insert(settings).values({ id: 1, ...body });
        } else {
          throw insertErr;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update settings";
    console.error("[Settings POST] Save error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}