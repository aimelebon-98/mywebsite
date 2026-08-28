import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "ping successful",
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    time: new Date().toISOString()
  });
}
