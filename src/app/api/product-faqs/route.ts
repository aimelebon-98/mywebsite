import { NextResponse } from "next/server";
import { db } from "@/db";
import { productFaqs } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const faqs = await db
      .select()
      .from(productFaqs)
      .where(eq(productFaqs.active, true))
      .orderBy(asc(productFaqs.sortOrder));
    return NextResponse.json(faqs);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
