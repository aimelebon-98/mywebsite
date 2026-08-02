import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession, isValidEmail } from "@/lib/customer-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");

    if (!isValidEmail(email)) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const [customer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    if (!customer) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const valid = await verifyPassword(password, customer.passwordHash);
    if (!valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "";
    const ua = req.headers.get("user-agent") || "";
    await createSession(customer.id, ip, ua);

    return NextResponse.json({
      ok: true,
      customer: { id: customer.id, email: customer.email, name: customer.name, phone: customer.phone },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
