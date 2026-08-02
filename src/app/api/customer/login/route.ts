import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession, isValidEmail } from "@/lib/customer-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");

    if (!isValidEmail(email)) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const [customer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    if (!customer) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const valid = await verifyPassword(password, customer.passwordHash);
    if (!valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "";
    const ua = req.headers.get("user-agent") || "";
    await createSession(customer.id, ip, ua);

        // Merge anonymous wishlist if visitorId provided
    const visitorId = body.visitorId || "";
    if (visitorId) {
      try {
        const { wishlist } = await import("@/db/schema");
        const { and, eq, isNull } = await import("drizzle-orm");
        // Get anonymous items
        const anonItems = await db.select().from(wishlist).where(and(eq(wishlist.visitorId, visitorId), isNull(wishlist.customerId)));
        // Get existing customer items
        const custItems = await db.select().from(wishlist).where(eq(wishlist.customerId, customer.id));
        const custProductIds = new Set(custItems.map(w => w.productId));
        // Merge non-duplicate items
        for (const item of anonItems) {
          if (!custProductIds.has(item.productId)) {
            await db.update(wishlist).set({ customerId: customer.id }).where(eq(wishlist.id, item.id));
          }
        }
      } catch { /* ignore merge errors */ }
    }

    return NextResponse.json({
      ok: true,
      customer: { id: customer.id, email: customer.email, name: customer.name, phone: customer.phone },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
