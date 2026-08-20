import { db } from "@/db";
import { vendors, vendorSessions, type Vendor } from "@/db/schema";
import { eq, gte, and } from "drizzle-orm";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SESSION_COOKIE = "ndz_vendor_session";
const SESSION_DURATION_DAYS = 7;

export function generateVendorToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export async function hashVendorPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyVendorPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createVendorSession(vendorId: string, ipAddress: string, userAgent: string): Promise<string> {
  const token = generateVendorToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(vendorSessions).values({
    token,
    vendorId,
    ipAddress: ipAddress.slice(0, 50),
    userAgent: userAgent.slice(0, 500),
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });

  return token;
}

export async function getCurrentVendor(): Promise<Vendor | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const [session] = await db.select().from(vendorSessions)
      .where(and(eq(vendorSessions.token, token), gte(vendorSessions.expiresAt, new Date())))
      .limit(1);
    if (!session) return null;

    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, session.vendorId)).limit(1);
    return vendor || null;
  } catch {
    return null;
  }
}

export async function requireVendor(): Promise<Vendor> {
  const vendor = await getCurrentVendor();
  if (!vendor) throw new Error("UNAUTHORIZED");
  if (vendor.status !== "approved") throw new Error("NOT_APPROVED");
  return vendor;
}

export async function destroyVendorSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await db.delete(vendorSessions).where(eq(vendorSessions.token, token));
    } catch {}
  }
  cookieStore.delete(SESSION_COOKIE);
}

export function slugifyStore(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export async function generateUniqueStoreSlug(name: string): Promise<string> {
  const base = slugifyStore(name) || "vendor";
  let slug = base;
  let i = 1;
  while (true) {
    const [existing] = await db.select().from(vendors).where(eq(vendors.storeSlug, slug)).limit(1);
    if (!existing) return slug;
    i++;
    slug = `${base}-${i}`;
    if (i > 999) return `${base}-${Date.now()}`;
  }
}

export function generateRandomPassword(length: number = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(bytes[i] % chars.length);
  }
  return password;
}