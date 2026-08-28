import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Just check if we can import db
    const { db } = await import("@/db");
    
    // Try a simple query
    const result = await db.execute("SELECT 1 as test");
    
    return NextResponse.json({
      success: true,
      message: "Database connection OK",
      test: result
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}