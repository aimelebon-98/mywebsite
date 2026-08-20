import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { getCustomerFromRequest } from "@/lib/customer-auth";
import { isRateLimited } from "@/lib/rate-limit";
import { stripHtml } from "@/lib/sanitize";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.customerId, customer.id))
      .orderBy(desc(supportTickets.createdAt));

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("[Tickets GET]", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    if (isRateLimited(ip, 10, 60000)) {
      return NextResponse.json({ error: "Too many ticket requests. Please wait a minute." }, { status: 429 });
    }

    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const subjectVal = stripHtml(String(body.subject || "")).trim().slice(0, 200);
    const categoryVal = stripHtml(String(body.category || "general")).trim();

    if (!subjectVal) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    // Auto-ensure Postgres table has necessary columns
    try {
      await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal'`);
      await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS unread_by_admin boolean NOT NULL DEFAULT true`);
      await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS unread_by_customer boolean NOT NULL DEFAULT false`);
    } catch { /* ignore */ }

    const [inserted] = await db
      .insert(supportTickets)
      .values({
        customerId: customer.id,
        subject: subjectVal,
        category: categoryVal || "general",
        status: "open",
      })
      .returning();

    return NextResponse.json({ success: true, ticket: inserted }, { status: 201 });
  } catch (error) {
    console.error("[Tickets POST Error]", error);
    const msg = error instanceof Error ? error.message : "Failed to create ticket";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}