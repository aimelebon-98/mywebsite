import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = {
  storeName: "NewDealZone",
  currency: "$",
  adminPath: "jevw",
  heroStyle: "classic",
  promoTextEn: "Become an affiliate and get 50% plus",
  promoTextFr: "Devenez affili\u00e9 et obtenez plus de 50%",
  promoBtnEn: "Join Now",
  promoBtnFr: "Rejoindre",
  promoLink: "/affiliate",
  promoLinkEn: "/affiliate",
  promoLinkFr: "/affiliate",
  affiliateSmzInitialRate: "50.00",
  affiliateSmzRecurringRate: "50.00",
  affiliateL2Rate: "10.00",
  affiliateL3Rate: "5.00",
};

async function ensureColumnsExist() {
  try {
    await db.execute(sql`
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_style text NOT NULL DEFAULT 'classic';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS promo_text_en text NOT NULL DEFAULT 'Become an affiliate and get 50% plus';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS promo_text_fr text NOT NULL DEFAULT 'Devenez affili\u00e9 et obtenez plus de 50%';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS promo_btn_en text NOT NULL DEFAULT 'Join Now';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS promo_btn_fr text NOT NULL DEFAULT 'Rejoindre';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS promo_link text NOT NULL DEFAULT '/affiliate';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS promo_link_en text NOT NULL DEFAULT '/affiliate';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS promo_link_fr text NOT NULL DEFAULT '/affiliate';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS affiliate_smz_initial_rate text NOT NULL DEFAULT '50.00';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS affiliate_smz_recurring_rate text NOT NULL DEFAULT '50.00';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS affiliate_l2_rate text NOT NULL DEFAULT '10.00';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS affiliate_l3_rate text NOT NULL DEFAULT '5.00';
      ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS manual_override_active boolean DEFAULT false;
    `);
  } catch (err) {
    console.warn("[Settings API] Column auto-heal warning:", err);
  }
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

    let st: any = null;
    try {
      const rows = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
      st = rows[0] || null;
    } catch (dbErr) {
      await ensureColumnsExist();
      try {
        const rows = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
        st = rows[0] || null;
      } catch {
        st = null;
      }
    }

    if (!st) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    const merged = { ...DEFAULT_SETTINGS, ...st };

    if (isAdmin) {
      const { adminPassword, ...rest } = merged as Record<string, unknown>;
      return NextResponse.json({
        adminPath: "jevw",
        ...rest,
      });
    }

    const { adminPassword, adminPath, ...publicSettings } = merged as Record<string, unknown>;
    return NextResponse.json(publicSettings);
  } catch (error) {
    console.error("[Settings GET] Error:", error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(req: Request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const body = await req.json();
    delete body.id;
    await ensureColumnsExist();

    const [existing] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
    if (existing) {
      await db.update(settings).set(body).where(eq(settings.id, 1));
    } else {
      await db.insert(settings).values({ id: 1, ...body });
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