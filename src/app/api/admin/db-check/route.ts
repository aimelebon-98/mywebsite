import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, settings, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check products
    const productCount = await db.select().from(products);
    
    // Check settings
    const settingsData = await db.select().from(settings).limit(1);
    
    // Check categories
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
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Initialize settings if missing
    const existingSettings = await db.select().from(settings).limit(1);
    
    if (existingSettings.length === 0) {
      await db.insert(settings).values({
        id: 1,
        storeName: "New Deal Zone",
        whatsappNumber: "+22891791492",
        currency: "NGN",
        adminPassword: "admin123",
        adminPath: "jevw",
        accessCode: null,
        accessCodeEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Initialize categories if missing
    const existingCategories = await db.select().from(categories);
    
    if (existingCategories.length === 0) {
      const cats = [
        { slug: "sneakers", nameEn: "Sneakers", nameFr: "Baskets", active: true, sortOrder: 1 },
        { slug: "running", nameEn: "Running", nameFr: "Course", active: true, sortOrder: 2 },
        { slug: "formal", nameEn: "Formal", nameFr: "Formelles", active: true, sortOrder: 3 },
        { slug: "boots", nameEn: "Boots", nameFr: "Bottes", active: true, sortOrder: 4 },
        { slug: "sandals", nameEn: "Sandals", nameFr: "Sandales", active: true, sortOrder: 5 },
        { slug: "casual", nameEn: "Casual", nameFr: "D\u00e9contract\u00e9es", active: true, sortOrder: 6 }
      ];
      
      await db.insert(categories).values(cats);
    }
    
    // Recheck counts
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
      error: error.message
    }, { status: 500 });
  }
}