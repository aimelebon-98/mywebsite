import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { newsletter } from "@/db/schema";
import { validateSubmission, checkRateLimit, getClientIp } from "@/lib/anti-spam";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, honeypot, timestamp } = body;

    // Anti-spam checks
    const ip = getClientIp(request.headers);
    const spamReason = validateSubmission({
      honeypot,
      timestamp,
      referer: request.headers.get("referer"),
      host: request.headers.get("host"),
      minSecondsToSubmit: 2,
    });

    // Silently return success on spam (don't tell bots why they failed)
    if (spamReason) {
      console.log(`[Newsletter] Blocked spam: ${spamReason} from ${ip}`);
      return NextResponse.json({ success: true, message: "Subscribed successfully!" });
    }

    // Rate limit: 3 signups per IP per hour
    if (!checkRateLimit(`newsletter:${ip}`, 3, 3600)) {
      console.log(`[Newsletter] Rate limit hit for ${ip}`);
      return NextResponse.json({ success: true, message: "Subscribed successfully!" });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    await db.insert(newsletter).values({ email }).onConflictDoNothing();
    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
