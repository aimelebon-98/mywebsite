import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings, loginAttempts, adminSessions } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";

// Helper to generate a random token
function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, accessCode, action } = body;
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Get settings
    let result = await db.select().from(settings).where(eq(settings.id, 1));
    if (result.length === 0) {
      await db.insert(settings).values({
        id: 1,
        storeName: "SoleVault",
        whatsappNumber: "",
        currency: "$",
        adminPassword: "admin123",
        adminAccessCode: "",
        adminPath: "admin",
        sessionSecret: generateToken(),
        maxLoginAttempts: 5,
        lockoutMinutes: 15,
      });
      result = await db.select().from(settings).where(eq(settings.id, 1));
    }

    const config = result[0];

    // Check for lockout
    const lockoutTime = new Date(Date.now() - config.lockoutMinutes * 60 * 1000);
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

    if (recentAttempts.length >= config.maxLoginAttempts) {
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${config.lockoutMinutes} minutes.` },
        { status: 429 }
      );
    }

    // Step 1: Verify access code (if set)
    if (action === "verify-access-code") {
      if (!config.adminAccessCode) {
        return NextResponse.json({ success: true, skipAccessCode: true });
      }
      if (accessCode === config.adminAccessCode) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
    }

    // Step 2: Verify password
    if (action === "login" || !action) {
      // Check access code first if it's set and provided
      if (config.adminAccessCode && accessCode !== config.adminAccessCode) {
        // Log failed attempt
        await db.insert(loginAttempts).values({ ipAddress: ip, success: false });
        return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
      }

      if (password === config.adminPassword) {
        // Log successful attempt
        await db.insert(loginAttempts).values({ ipAddress: ip, success: true });

        // Create session
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await db.insert(adminSessions).values({
          token,
          ipAddress: ip,
          userAgent,
          expiresAt,
        });

        const response = NextResponse.json({ success: true, token });
        response.cookies.set("admin_session", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60, // 24 hours
        });

        return response;
      }

      // Log failed attempt
      await db.insert(loginAttempts).values({ ipAddress: ip, success: false });
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Verify session
    if (action === "verify-session") {
      const token = request.cookies.get("admin_session")?.value || body.token;
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

    // Logout
    if (action === "logout") {
      const token = request.cookies.get("admin_session")?.value;
      if (token) {
        await db.delete(adminSessions).where(eq(adminSessions.token, token));
      }
      const response = NextResponse.json({ success: true });
      response.cookies.delete("admin_session");
      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error authenticating:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

// Check if access code is required
export async function GET() {
  try {
    let result = await db.select().from(settings).where(eq(settings.id, 1));
    if (result.length === 0) {
      return NextResponse.json({ requiresAccessCode: false, adminPath: "admin" });
    }
    return NextResponse.json({
      requiresAccessCode: !!result[0].adminAccessCode,
      adminPath: result[0].adminPath || "admin",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ requiresAccessCode: false, adminPath: "admin" });
  }
}
