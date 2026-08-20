import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { getCustomerFromRequest } from "@/lib/auth-customer";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerName = customer.name || "";
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
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const customerName = customer.name || body.customerName || "Customer";
    const initials = customerName
      .split(" ")
      .map((w: string) => w[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");

    const [inserted] = await db
      .insert(reviews)
      .values({
        productId: body.productId,
        customerName: customerName,
        rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
        comment: String(body.comment || "").slice(0, 1000),
        avatar: initials || "ND",
        verified: true,
      })
      .returning();

    return NextResponse.json({ review: inserted }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}