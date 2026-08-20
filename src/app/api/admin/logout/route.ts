import { requireAdmin } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function POST() {
  const authErr = await requireAdmin(); if (authErr) return authErr;
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin-token");
  return response;
}
