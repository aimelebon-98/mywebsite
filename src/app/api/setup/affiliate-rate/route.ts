import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.update(affiliates).set({ commissionRate: "50.00" });
    return NextResponse.json({ success: true, message: "Updated default affiliate rate to 50%" });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message }, { status: 500 });
  }
}