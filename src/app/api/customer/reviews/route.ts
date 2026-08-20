import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customer = await requireCustomer();
    const rows = await db.select().from(reviews).where(eq(reviews.customerId, customer.id));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const customer = await requireCustomer();
    const body = await req.json();

    if (!body.productId || !body.rating || !body.comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const initials = String(customer.name || "CU")
      .split(" ")
      .map((w: string) => w[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");

    const [inserted] = await db.insert(reviews).values({
      productId: String(body.productId),
      customerId: customer.id,
      customerName: String(customer.name || "Customer").slice(0, 100),
      rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
      comment: String(body.comment).slice(0, 2000),
      commentFr: body.commentFr ? String(body.commentFr).slice(0, 2000) : "",
      avatar: initials || "CU",
      verified: true,
    }).returning();

    return NextResponse.json({ success: true, review: inserted });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}