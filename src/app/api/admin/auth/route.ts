import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { db } from "@/db";
import { settings, loginAttempts, adminSessions } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import crypto from "crypto";
import { isRateLimited } from "@/lib/rate-limit";
import { verifyRequestOrigin } from "@/lib/csrf";
import { verifyAdminPassword, hashAdminPassword, ADMIN_COOKIE_NAME, ADMIN_SESSION_DURATION_HOURS } from "@/lib/admin-auth";

function generateToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

function getWhitelistedIPs(): string[] {
  return (process.env.ADMIN_WHITELIST_IPS || "")
    .split(",")
    .map(ip => ip.trim())
    .filter(Boolean);
}

function isWhitelisted(ip: string): boolean {
  return getWhitelistedIPs().includes(ip);
}

export async function POST(request: NextRequest) {
  try {
    const originOk = await verifyRequestOrigin();
    if (!originOk) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const body = await request.json();
    const { password, accessCode, action, turnstileToken } = body;

    const ip = request.headers.get("cf-connecting-ip") ||
               request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
               request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const whitelisted = isWhitelisted(ip);

    // Rate limiting check
    if (!whitelisted && isRateLimited(ip, 10, 60000)) {
      return NextResponse.json({ error: "Too many attempts. Please wait 1 minute." }, { status: 429 });
    }

    // Turnstile check for login action
    if (action === "login" && !whitelisted && process.env.TURNSTILE_SECRET_KEY) {
      const turnstileOk = await verifyTurnstile(turnstileToken || "", ip);
      if (!turnstileOk) {
        return NextResponse.json({ error: "Human verification failed. Please refresh and try again." }, { status: 403 });
      }
    }

    // Fetch store settings
    let result = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
    if (result.length === 0) {
      await db.insert(settings).values({
        id: 1,
        storeName: "NewDealZone",
        whatsappNumber: "",
        currency: "$",
        adminPassword: "admin123",
        adminAccessCode: "",
        adminPath: "admin",
        sessionSecret: generateToken(),
        maxLoginAttempts: 5,
        lockoutMinutes: 15,
      });
      result = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
    }

    const config = result[0];

    // Check account lockout
    if (!whitelisted) {
      const lockoutTime = new Date(Date.now() - (config.lockoutMinutes || 15) * 60 * 1000);
      const recentAttempts = await db
        .select()
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.ipAddress, ip),
            gte(loginAttempts.createdAt, lockoutTime),
            eq(loginAttempts.success, false)
          )
        );

      if (recentAttempts.length >= (config.maxLoginAttempts || 5)) {
        return NextResponse.json(
          { error: `Too many failed attempts. Try again in ${config.lockoutMinutes || 15} minutes.` },
          { status: 429 }
        );
      }
    }

    const expectedAccessCode = String(config.adminAccessCode || "").trim().toUpperCase();
    const providedAccessCode = String(accessCode || "").trim().toUpperCase();

    // ============================================================
    // STEP 1: VERIFY ACCESS CODE
    // ============================================================
    if (action === "verify-access-code") {
      if (!expectedAccessCode) {
        return NextResponse.json({ success: true, skipAccessCode: true });
      }
      if (providedAccessCode === expectedAccessCode) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
    }

    // ============================================================
    // STEP 2: FULL LOGIN
    // ============================================================
    if (action === "login" || !action) {
      // Validate access code first if configured
      if (expectedAccessCode && providedAccessCode !== expectedAccessCode) {
        if (!whitelisted) {
          await db.insert(loginAttempts).values({ ipAddress: ip, success: false });
        }
        return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
      }

      const adminPass = config.adminPassword || process.env.ADMIN_PASSWORD || "";
      const isValidPassword = await verifyAdminPassword(String(password || ""), adminPass);

      if (isValidPassword) {
        // Log success
        if (!whitelisted) {
          await db.insert(loginAttempts).values({ ipAddress: ip, success: true });
        }

        // Auto-upgrade plaintext password to bcrypt hash in DB
        if (!adminPass.startsWith("$2a$") && !adminPass.startsWith("$2b$") && !adminPass.startsWith("$2y$")) {
          try {
            const hashedPassword = await hashAdminPassword(password);
            await db.update(settings).set({ adminPassword: hashedPassword }).where(eq(settings.id, 1));
          } catch (upgradeErr) {
            console.warn("[Admin Auth] Password hash auto-upgrade skipped:", upgradeErr);
          }
        }

        const token = generateToken();
        const expiresAt = new Date(Date.now() + ADMIN_SESSION_DURATION_HOURS * 60 * 60 * 1000);

        await db.insert(adminSessions).values({
          token,
          ipAddress: ip,
          userAgent: userAgent.slice(0, 500),
          expiresAt,
        });

        const response = NextResponse.json({ success: true, token });
        response.cookies.set(ADMIN_COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: ADMIN_SESSION_DURATION_HOURS * 60 * 60,
        });

        return response;
      }

      // Log failed password attempt
      if (!whitelisted) {
        await db.insert(loginAttempts).values({ ipAddress: ip, success: false });
      }
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // ============================================================
    // VERIFY SESSION
    // ============================================================
    if (action === "verify-session") {
      const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value || body.token;
      if (!token) {
        return NextResponse.json({ valid: false }, { status: 401 });
      }

      const sessions = await db
        .select()
        .from(adminSessions)
        .where(
          and(
            eq(adminSessions.token, token),
            gte(adminSessions.expiresAt, new Date())
          )
        );

      if (sessions.length > 0) {
        return NextResponse.json({ valid: true });
      }

      return NextResponse.json({ valid: false }, { status: 401 });
    }

    // ============================================================
    // LOGOUT
    // ============================================================
    if (action === "logout") {
      const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
      if (token) {
        await db.delete(adminSessions).where(eq(adminSessions.token, token)).catch(() => {});
      }
      const response = NextResponse.json({ success: true });
      response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Admin Auth POST] Error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ requiresAccessCode: false, adminPath: "admin" });
    }
    return NextResponse.json({
      requiresAccessCode: Boolean(result[0].adminAccessCode && result[0].adminAccessCode.trim().length > 0),
      adminPath: result[0].adminPath || "admin",
    });
  } catch (error) {
    console.error("[Admin Auth GET] Error:", error);
    return NextResponse.json({ requiresAccessCode: false, adminPath: "admin" });
  }
}