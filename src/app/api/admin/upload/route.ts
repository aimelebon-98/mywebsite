import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Basic validation
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 10MB" }, { status: 400 });
    }

    // Sanitize filename
    const original = file.name || "upload";
    const cleanName = original
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
    const timestamp = Date.now().toString(36);
    const finalName = `products/${timestamp}-${cleanName}`;

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        error: "BLOB_READ_WRITE_TOKEN not configured. Add Vercel Blob storage in your Vercel dashboard."
      }, { status: 500 });
    }

    const blob = await put(finalName, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}