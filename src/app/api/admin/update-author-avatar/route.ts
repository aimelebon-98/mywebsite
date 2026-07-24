import { NextResponse } from "next/server";
import { db } from "@/db";
import { authors } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.update(authors)
      .set({
        avatar: "https://i.ibb.co/HTrQYdfK/Aime-komlan.jpg",
        name: "Aime Komlon",
      })
      .where(eq(authors.slug, "solevault-team"))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Default author not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Author updated with new avatar",
      author: result[0],
    });
  } catch (error) {
    console.error("Update author error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
