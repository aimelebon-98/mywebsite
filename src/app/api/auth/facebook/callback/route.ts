import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  customers,
  customerSessions,
  affiliates,
  affiliateSessions,
  vendors,
  vendorSessions,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/customer-auth";
import { hashVendorPassword, generateUniqueStoreSlug } from "@/lib/vendor-auth";
import { hashAffiliatePassword, generateAffiliateCode } from "@/lib/affiliate-auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const stateParam = req.nextUrl.searchParams.get("state") || "";
  let locale = "en";
  let role = "customer";

  try {
    const decoded = JSON.parse(Buffer.from(stateParam, "base64url").toString());
    locale = decoded.locale || "en";
    role = decoded.role || "customer";
  } catch {}

  if (!code) {
    return NextResponse.redirect(
      new URL(`/${locale}/account/login?error=oauth_failed`, req.nextUrl.origin)
    );
  }

  const appId =
    process.env.FACEBOOK_CLIENT_ID ||
    process.env.FACEBOOK_APP_ID ||
    process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ||
    "";
  const appSecret =
    process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET || "";

  if (!appId || !appSecret) {
    return NextResponse.redirect(
      new URL(`/${locale}/account/login?error=oauth_not_configured`, req.nextUrl.origin)
    );
  }

  try {
    const redirectUri = `${req.nextUrl.origin}/api/auth/facebook/callback`;
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`;

    const tokenRes = await fetch(tokenUrl);
    const tokens = await tokenRes.json();

    if (!tokens.access_token) throw new Error("No access token from Facebook");

    const userRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.type(large)&access_token=${tokens.access_token}`
    );
    const user = await userRes.json();

    const email = (user.email || `${user.id}@facebook.newdealzone.com`).toLowerCase().trim();
    const name = user.name || email.split("@")[0];

    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "";
    const ua = req.headers.get("user-agent") || "";
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // ==========================================
    // AFFILIATE ROLE
    // ==========================================
    if (role === "affiliate") {
      let [aff] = await db.select().from(affiliates).where(eq(affiliates.email, email)).limit(1);

      if (!aff) {
        // Auto-create approved affiliate
        let code = generateAffiliateCode(name);
        let attempts = 0;
        while (attempts < 5) {
          const dup = await db.select({ id: affiliates.id }).from(affiliates).where(eq(affiliates.code, code)).limit(1);
          if (!dup.length) break;
          code = generateAffiliateCode(name);
          attempts++;
        }
        const tempPassword = crypto.randomBytes(8).toString("hex");
        const passwordHash = await hashAffiliatePassword(tempPassword);

        const [newAff] = await db.insert(affiliates).values({
          email,
          name,
          passwordHash,
          code,
          commissionRate: "5.00",
          status: "approved",
          mustChangePassword: true,
          approvedAt: new Date(),
        }).returning();
        aff = newAff;
      } else if (aff.status === "pending") {
        await db.update(affiliates).set({ status: "approved", approvedAt: new Date() }).where(eq(affiliates.id, aff.id));
      } else if (aff.status === "rejected" || aff.status === "suspended") {
        return NextResponse.redirect(new URL(`/${locale}/affiliate/login?error=account_inactive`, req.nextUrl.origin));
      }

      const sessionToken = crypto.randomBytes(64).toString("hex");
      await db.insert(affiliateSessions).values({ token: sessionToken, affiliateId: aff.id, ipAddress: ip.slice(0, 50), userAgent: ua.slice(0, 500), expiresAt });

      const res = NextResponse.redirect(new URL(`/${locale}/affiliate/dashboard`, req.nextUrl.origin));
      res.cookies.set("ndz_affiliate_session", sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 });
      return res;
    }

    // ==========================================
    // VENDOR ROLE
    // ==========================================
    if (role === "vendor") {
      let [vend] = await db.select().from(vendors).where(eq(vendors.email, email)).limit(1);

      if (!vend) {
        // Auto-create incomplete vendor (triggers dashboard wizard)
        const storeName = `${name.split(" ")[0]}'s Store`;
        const storeSlug = await generateUniqueStoreSlug(storeName);
        const dummyHash = await hashVendorPassword(crypto.randomBytes(32).toString("hex"));

        const [newVend] = await db.insert(vendors).values({
          email,
          passwordHash: dummyHash,
          storeName: storeName.slice(0, 100),
          storeSlug,
          contactName: name,
          status: "incomplete",
          mustChangePassword: false,
        }).returning();
        vend = newVend;
      } else if (vend.status === "rejected" || vend.status === "suspended") {
        return NextResponse.redirect(new URL(`/${locale}/vendor/login?error=account_inactive`, req.nextUrl.origin));
      }

      const sessionToken = crypto.randomBytes(48).toString("hex");
      await db.insert(vendorSessions).values({ token: sessionToken, vendorId: vend.id, ipAddress: ip.slice(0, 50), userAgent: ua.slice(0, 500), expiresAt });

      const res = NextResponse.redirect(new URL(`/${locale}/vendor/dashboard`, req.nextUrl.origin));
      res.cookies.set("ndz_vendor_session", sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 7 * 24 * 60 * 60 });
      return res;
    }

    // ==========================================
    // DEFAULT: CUSTOMER ROLE
    // ==========================================
    let [customer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);

    if (!customer) {
      const dummyPasswordHash = await hashPassword(crypto.randomBytes(32).toString("hex"));
      [customer] = await db.insert(customers).values({
        email, name, passwordHash: dummyPasswordHash, verified: true, locale,
      }).returning();
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    await db.insert(customerSessions).values({ token: sessionToken, customerId: customer.id, ipAddress: ip.slice(0, 50), userAgent: ua.slice(0, 500), expiresAt });

    const response = NextResponse.redirect(new URL(`/${locale}/account/dashboard`, req.nextUrl.origin));
    response.cookies.set("ndz_customer_session", sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 });
    return response;

  } catch (err) {
    console.error("Facebook OAuth error:", err);
    return NextResponse.redirect(new URL(`/${locale}/account/login?error=oauth_failed`, req.nextUrl.origin));
  }
}