import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, customerSessions } from "@/db/schema";
import { getCustomerFromRequest } from "@/lib/customer-auth";
import { isRateLimited } from "@/lib/rate-limit";
import { verifyRequestOrigin } from "@/lib/csrf";
import { sanitizeComment, stripHtml } from "@/lib/sanitize";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerName = (customer as any).name || (customer as any).fullName || "";
    const rows = await db
      .select()
      .from(reviews)
      .where(eq(reviews.customerName, customerName))
      .orderBy(desc(reviews.createdAt));

    return NextResponse.json({ reviews: rows });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    if (isRateLimited(ip, 10, 60000)) {
      return NextResponse.json({ error: "Too many review submissions. Please wait a minute." }, { status: 429 });
    }

    if (!await verifyRequestOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const customerName = stripHtml(String((customer as any).name || (customer as any).fullName || body.customerName || "Customer"));
    const initials = customerName
      .split(" ")
      .map((w: string) => w[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");

    const [inserted] = await db
      .insert(reviews)
      .values({
        productId: String(body.productId),
        customerName: customerName,
        rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
        comment: sanitizeComment(String(body.comment || "")).slice(0, 1000),
        avatar: initials || "ND",
        verified: true,
      })
      .returning();

    return NextResponse.json({ review: inserted }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}