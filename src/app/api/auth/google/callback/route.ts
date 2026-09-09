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

  const failLogin =
    role === "affiliate"
      ? `/${locale}/affiliate/login`
      : role === "vendor"
      ? `/${locale}/vendor/login`
      : `/${locale}/account/login`;

  if (!code) {
    return NextResponse.redirect(new URL(`${failLogin}?error=oauth_failed`, req.nextUrl.origin));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL(`${failLogin}?error=oauth_not_configured`, req.nextUrl.origin));
  }

  try {
    const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error("No access token from Google");

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const user = await userRes.json();
    if (!user.email) throw new Error("No email from Google");

    const email = String(user.email).toLowerCase().trim();
    const name = user.name || email.split("@")[0];
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "";
    const ua = req.headers.get("user-agent") || "";
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // ==========================================
    // AFFILIATE ROLE -> INSTANT APPROVED
    // ==========================================
    if (role === "affiliate") {
      let [aff] = await db.select().from(affiliates).where(eq(affiliates.email, email)).limit(1);

      if (!aff) {
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
    // VENDOR ROLE -> INCOMPLETE -> DASHBOARD WIZARD
    // ==========================================
    if (role === "vendor") {
      let [vend] = await db.select().from(vendors).where(eq(vendors.email, email)).limit(1);

      if (!vend) {
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
    // CUSTOMER ROLE
    // ==========================================
    let [customer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    if (!customer) {
      const dummyPasswordHash = await hashPassword(crypto.randomBytes(32).toString("hex"));
      [customer] = await db.insert(customers).values({ email, name, passwordHash: dummyPasswordHash, verified: true, locale }).returning();
    }
    const sessionToken = crypto.randomBytes(32).toString("hex");
    await db.insert(customerSessions).values({ token: sessionToken, customerId: customer.id, ipAddress: ip.slice(0, 50), userAgent: ua.slice(0, 500), expiresAt });
    
    const response = NextResponse.redirect(new URL(`/${locale}/account/dashboard`, req.nextUrl.origin));
    response.cookies.set("ndz_customer_session", sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 });
    return response;
  } catch (err) {
    return NextResponse.redirect(new URL(`${failLogin}?error=oauth_failed`, req.nextUrl.origin));
  }
}