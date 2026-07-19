import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.select().from(settings).where(eq(settings.id, 1));
    if (result.length === 0) {
      const newSettings = await db.insert(settings).values({
        id: 1,
        storeName: "SoleVault",
        whatsappNumber: "",
        currency: "$",
        adminPassword: "admin123",
        adminAccessCode: "",
        adminPath: "admin",
        maxLoginAttempts: 5,
        lockoutMinutes: 15,
      }).returning();
      return NextResponse.json(newSettings[0]);
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeName, whatsappNumber, currency,
      adminPassword, adminAccessCode, adminPath,
      maxLoginAttempts, lockoutMinutes
    } = body;

    const updateData: Record<string, unknown> = {};
    if (storeName !== undefined) updateData.storeName = storeName;
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;
    if (currency !== undefined) updateData.currency = currency;
    if (adminPassword !== undefined && adminPassword !== "") updateData.adminPassword = adminPassword;
    if (adminAccessCode !== undefined) updateData.adminAccessCode = adminAccessCode;
    if (adminPath !== undefined) updateData.adminPath = adminPath || "admin";
    if (maxLoginAttempts !== undefined) updateData.maxLoginAttempts = maxLoginAttempts;
    if (lockoutMinutes !== undefined) updateData.lockoutMinutes = lockoutMinutes;

    const existing = await db.select().from(settings).where(eq(settings.id, 1));
    if (existing.length === 0) {
      const newSettings = await db.insert(settings).values({
        id: 1,
        storeName: storeName || "SoleVault",
        whatsappNumber: whatsappNumber || "",
        currency: currency || "$",
        adminPassword: adminPassword || "admin123",
        adminAccessCode: adminAccessCode || "",
        adminPath: adminPath || "admin",
        maxLoginAttempts: maxLoginAttempts || 5,
        lockoutMinutes: lockoutMinutes || 15,
      }).returning();
      return NextResponse.json(newSettings[0]);
    }

    const result = await db.update(settings).set(updateData).where(eq(settings.id, 1)).returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
