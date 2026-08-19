import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentVendor } from "@/lib/vendor-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const kind = (formData.get("kind") as string) || "image";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });

    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only images allowed" }, { status: 400 });

    const ext = file.name.split(".").pop() || "jpg";
    const safeSlug = vendor.storeSlug.replace(/[^a-z0-9-]/gi, "");
    const path = `vendors/${safeSlug}/${kind}-${Date.now()}.${ext}`;

    const buffer = await file.arrayBuffer();
    const blob = await put(path, buffer, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}