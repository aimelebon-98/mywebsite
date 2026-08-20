import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [st] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
    return NextResponse.json(st || {});
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const body = await req.json();
    const [existing] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);

    if (existing) {
      await db.update(settings).set(body).where(eq(settings.id, 1));
    } else {
      await db.insert(settings).values({ id: 1, ...body });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}