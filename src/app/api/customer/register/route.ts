import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, coupons, customerCoupons } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword, createSession, isValidEmail } from "@/lib/customer-auth";
import { sendWelcomeEmail, type WelcomeCoupon } from "@/lib/email";

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

    // Auto-assign welcome coupon (if one exists)
    let welcomeCouponForEmail: WelcomeCoupon | null = null;
    try {
      const [welcomeCoupon] = await db.select().from(coupons).where(
        and(eq(coupons.isWelcome, true), eq(coupons.active, true))
      ).limit(1);

      if (welcomeCoupon) {
        // Check not expired
        const notExpired = !welcomeCoupon.expiresAt || new Date(welcomeCoupon.expiresAt) > new Date();
        // Check not maxed out
        const hasCapacity = !welcomeCoupon.maxUses || welcomeCoupon.usedCount < welcomeCoupon.maxUses;

        if (notExpired && hasCapacity) {
          await db.insert(customerCoupons).values({
            customerId: newCustomer.id,
            couponId: welcomeCoupon.id,
          });
          welcomeCouponForEmail = {
            code: welcomeCoupon.code,
            type: welcomeCoupon.type,
            value: welcomeCoupon.value,
            description: welcomeCoupon.description,
            descriptionFr: welcomeCoupon.descriptionFr,
          };
        }
      }
    } catch (e) {
      console.error("[Register] Welcome coupon assignment failed:", e);
    }

    sendWelcomeEmail(email, name, locale, welcomeCouponForEmail).catch(() => {});

    // Merge anonymous wishlist
    const visitorId = body.visitorId || "";
    if (visitorId) {
      try {
        const { wishlist } = await import("@/db/schema");
        const { and: and2, eq: eq2, isNull } = await import("drizzle-orm");
        const anonItems = await db.select().from(wishlist).where(and2(eq2(wishlist.visitorId, visitorId), isNull(wishlist.customerId)));
        for (const item of anonItems) {
          await db.update(wishlist).set({ customerId: newCustomer.id }).where(eq2(wishlist.id, item.id));
        }
      } catch { /* ignore */ }
    }

    return NextResponse.json({
      ok: true,
      customer: { id: newCustomer.id, email: newCustomer.email, name: newCustomer.name, phone: newCustomer.phone },
      welcomeCoupon: welcomeCouponForEmail ? { code: welcomeCouponForEmail.code } : null,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
