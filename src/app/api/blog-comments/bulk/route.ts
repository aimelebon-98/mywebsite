import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogComments } from "@/db/schema";
import { inArray, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { action, ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No comment IDs provided" }, { status: 400 });
    }

    if (action === "approve") {
      await db.update(blogComments).set({ approved: true }).where(inArray(blogComments.id, ids));
      return NextResponse.json({ success: true, count: ids.length, action: "approve" });
    }

    if (action === "unapprove") {
      await db.update(blogComments).set({ approved: false }).where(inArray(blogComments.id, ids));
      return NextResponse.json({ success: true, count: ids.length, action: "unapprove" });
    }

    if (action === "delete") {
      // Also delete children (replies)
      await db.delete(blogComments).where(inArray(blogComments.parentId, ids));
      await db.delete(blogComments).where(inArray(blogComments.id, ids));
      return NextResponse.json({ success: true, count: ids.length, action: "delete" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Blog Comments Bulk] Error:", error);
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 });
  }
}