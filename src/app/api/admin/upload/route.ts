import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-auth";
import { validateUploadFile } from "@/lib/upload-guard";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const check = validateUploadFile(file);
    if (!check.valid) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    const cleanName = (file.name || "image.jpg").replace(/[^a-zA-Z0-9.-]/g, "_");
    const blob = await put(`admin/${Date.now()}-${cleanName}`, file, {
      access: "public",
      contentType: file.type || "image/jpeg",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}