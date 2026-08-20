import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { newsletter } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isRateLimited } from "@/lib/rate-limit";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address").max(200),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("cf-connecting-ip") ||
               req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
               req.headers.get("x-real-ip") || "";

    if (isRateLimited(ip, 5, 60000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid email" }, { status: 400 });
    }

    const { email } = parsed.data;

    const [existing] = await db.select().from(newsletter).where(eq(newsletter.email, email)).limit(1);
    if (existing) {
      return NextResponse.json({ message: "Already subscribed", subscribed: true });
    }

    await db.insert(newsletter).values({ email });
    return NextResponse.json({ message: "Subscribed successfully", subscribed: true }, { status: 201 });
  } catch (error) {
    console.error("[Newsletter POST] Error:", error);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}