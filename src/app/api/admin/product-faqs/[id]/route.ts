import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productFaqs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const [updated] = await db.update(productFaqs).set({
      question: body.question,
      answer: body.answer,
      questionFr: body.questionFr,
      answerFr: body.answerFr,
      sortOrder: body.sortOrder,
      active: body.active,
    }).where(eq(productFaqs.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(productFaqs).where(eq(productFaqs.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}