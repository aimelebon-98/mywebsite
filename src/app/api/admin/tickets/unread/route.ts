import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const [row] = await db.select({ count: sql<number>`count(*)` })
      .from(supportTickets)
      .where(eq(supportTickets.unreadByAdmin, true));
    return NextResponse.json({ count: Number(row?.count || 0) });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}