import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSession, isValidEmail } from "@/lib/customer-auth";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const locale = body.locale === "fr" ? "fr" : "en";

    if (!isValidEmail(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const [existing] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const passwordHash = await hashPassword(password);
    const [newCustomer] = await db.insert(customers).values({
      email, passwordHash, name, phone, locale,
    }).returning();

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "";
    const ua = req.headers.get("user-agent") || "";
    await createSession(newCustomer.id, ip, ua);

    sendWelcomeEmail(email, name, locale).catch(() => {});

        // Merge anonymous wishlist
    const visitorId = body.visitorId || "";
    if (visitorId) {
      try {
        const { wishlist } = await import("@/db/schema");
        const { and, eq, isNull } = await import("drizzle-orm");
        const anonItems = await db.select().from(wishlist).where(and(eq(wishlist.visitorId, visitorId), isNull(wishlist.customerId)));
        for (const item of anonItems) {
          await db.update(wishlist).set({ customerId: newCustomer.id }).where(eq(wishlist.id, item.id));
        }
      } catch { /* ignore */ }
    }

    return NextResponse.json({
      ok: true,
      customer: { id: newCustomer.id, email: newCustomer.email, name: newCustomer.name, phone: newCustomer.phone },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
