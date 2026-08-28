import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, settings, categories } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const productCount = await db.select().from(products);
    const settingsData = await db.select().from(settings).limit(1);
    const categoriesData = await db.select().from(categories);

    return NextResponse.json({
      success: true,
      database: "connected",
      products: productCount.length,
      settings: settingsData.length > 0 ? settingsData[0] : null,
      categories: categoriesData.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || "Unknown error",
      code: error?.code,
      stack: error?.stack
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const existingSettings = await db.select().from(settings).limit(1);

    if (existingSettings.length === 0) {
      await db.insert(settings).values({
        id: 1,
        storeName: "New Deal Zone",
        whatsappNumber: "+22891791492",
        currency: "NGN",
        adminPassword: "admin123",
        adminAccessCode: "",
        adminPath: "jevw",
        sessionSecret: "",
        maxLoginAttempts: 5,
        lockoutMinutes: 15
      });
    }

    const existingCategories = await db.select().from(categories);

    if (existingCategories.length === 0) {
      const cats = [
        { slug: "sneakers", nameEn: "Sneakers", nameFr: "Baskets", active: true, sortOrder: 1 },
        { slug: "running", nameEn: "Running", nameFr: "Course", active: true, sortOrder: 2 },
        { slug: "formal", nameEn: "Formal", nameFr: "Formelles", active: true, sortOrder: 3 },
        { slug: "boots", nameEn: "Boots", nameFr: "Bottes", active: true, sortOrder: 4 },
        { slug: "sandals", nameEn: "Sandals", nameFr: "Sandales", active: true, sortOrder: 5 },
        { slug: "casual", nameEn: "Casual", nameFr: "Décontractées", active: true, sortOrder: 6 }
      ];

      await db.insert(categories).values(cats);
    }

    const productCount = await db.select().from(products);
    const settingsCount = await db.select().from(settings);
    const categoriesCount = await db.select().from(categories);

    return NextResponse.json({
      success: true,
      message: "Database initialized",
      products: productCount.length,
      settings: settingsCount.length,
      categories: categoriesCount.length
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || "Unknown error",
      code: error?.code
    }, { status: 500 });
  }
}
