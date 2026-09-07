import { cookies } from "next/headers";
import { db } from "@/db";
import { affiliates, affiliateSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const COOKIE_NAME = "ndz_affiliate_session";
const SESSION_DAYS = 30;

export async function hashAffiliatePassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyAffiliatePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAffiliateSession(
  affiliateId: string,
  ipAddress?: string,
  userAgent?: string
) {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  );

  await db.insert(affiliateSessions).values({
    token,
    affiliateId,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
    expiresAt,
  });

  return { token, expiresAt, cookieName: COOKIE_NAME };
}

export async function getCurrentAffiliate() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await db
      .select({
        affiliate: affiliates,
        expiresAt: affiliateSessions.expiresAt,
      })
      .from(affiliateSessions)
      .innerJoin(
        affiliates,
        eq(affiliateSessions.affiliateId, affiliates.id)
      )
      .where(eq(affiliateSessions.token, token))
      .limit(1);

    if (!session.length) return null;
    if (session[0].affiliate.status !== "approved") return null;
    if (new Date() > session[0].expiresAt) return null;

    return session[0].affiliate;
  } catch {
    return null;
  }
}

export async function requireAffiliate(_request?: NextRequest) {
  const affiliate = await getCurrentAffiliate();
  if (!affiliate) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return affiliate;
}

export function generateAffiliateCode(name: string): string {
  const clean = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `NDZ-${clean}-${rand}`;
}