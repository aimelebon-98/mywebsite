import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isRateLimited } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const h = await headers();
    const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "";

    if (isRateLimited(ip, 3, 3600000)) {
      return NextResponse.json({ error: "Setup rate limit exceeded" }, { status: 429 });
    }

    const [st] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
    if (st && st.storeName) {
      return NextResponse.json({ error: "Store already setup" }, { status: 403 });
    }

    const body = await req.json();
    if (st) {
      await db.update(settings).set(body).where(eq(settings.id, 1));
    } else {
      await db.insert(settings).values({ id: 1, ...body });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}