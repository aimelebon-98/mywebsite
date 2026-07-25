import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productFaqs } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const faqs = await db.select().from(productFaqs).orderBy(asc(productFaqs.sortOrder));
    return NextResponse.json(faqs);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [created] = await db.insert(productFaqs).values({
      question: body.question || "",
      answer: body.answer || "",
      questionFr: body.questionFr || null,
      answerFr: body.answerFr || null,
      sortOrder: body.sortOrder ?? 0,
      active: body.active ?? true,
    }).returning();
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
