import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings, loginAttempts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashAdminPassword } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hashedPassword = await hashAdminPassword("admin123");

    const [existing] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);

    if (existing) {
      await db.update(settings).set({
        adminPassword: hashedPassword,
        adminAccessCode: "",
      }).where(eq(settings.id, 1));
    } else {
      await db.insert(settings).values({
        id: 1,
        storeName: "New Deal Zone",
        whatsappNumber: "+22891791492",
        currency: "NGN",
        adminPassword: hashedPassword,
        adminAccessCode: "",
        adminPath: "jevw",
        sessionSecret: "",
        maxLoginAttempts: 5,
        lockoutMinutes: 15,
      });
    }

    // Clear failed login attempts / lockouts
    await db.delete(loginAttempts).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Admin password successfully reset to 'admin123', access code cleared, lockouts reset.",
      adminPath: existing?.adminPath || "jevw"
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}