import { NextResponse } from "next/server";
import { Resend } from "resend";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const url = new URL(req.url);
    const testTo = url.searchParams.get("to");
    if (!testTo) return NextResponse.json({ error: "Add ?to=your-email@gmail.com" }, { status: 400 });

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "NewDealZone <onboarding@resend.dev>";

    if (!apiKey) {
      return NextResponse.json({
        error: "RESEND_API_KEY is not set on Vercel",
        fix: "Add RESEND_API_KEY in Vercel > Settings > Environment Variables, then redeploy"
      }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: testTo,
      subject: "Resend Diagnostic Test - NewDealZone",
      html: `<h2>Resend is working!</h2>
             <p>API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}</p>
             <p>FROM: ${fromEmail}</p>
             <p>Sent at: ${new Date().toISOString()}</p>`,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent - check inbox + spam",
      emailId: result.data?.id,
      error: result.error,
      env: {
        apiKeyPresent: true,
        apiKeyEnd: apiKey.substring(apiKey.length - 4),
        fromEmail,
      }
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Login to admin first" }, { status: 401 });
    return NextResponse.json({ error: msg, stack: error instanceof Error ? error.stack : undefined }, { status: 500 });
  }
}