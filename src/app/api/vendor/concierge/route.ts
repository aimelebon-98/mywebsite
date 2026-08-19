import { NextResponse } from "next/server";
import { db } from "@/db";
import { conciergeRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentVendor } from "@/lib/vendor-auth";
import { getTierFee, getTierById } from "@/lib/concierge-tiers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const requests = await db.select().from(conciergeRequests)
      .where(eq(conciergeRequests.vendorId, vendor.id))
      .orderBy(desc(conciergeRequests.createdAt));

    const vendorAny = vendor as unknown as { conciergeDebt?: string };
    return NextResponse.json({
      requests,
      debt: vendorAny.conciergeDebt ?? "0",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (vendor.status !== "approved") return NextResponse.json({ error: "Your account must be approved" }, { status: 403 });

    const body = await req.json();
    const {
      tier, productName, productBrand, productCategory, productPrice, productComparePrice,
      productMaterial, productSizes, productColors, productStock, sourceImages, notes,
    } = body;

    if (!getTierById(tier || "")) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    if (!productName || !productName.trim()) return NextResponse.json({ error: "Product name required" }, { status: 400 });
    const priceNum = parseFloat(String(productPrice || "0"));
    if (isNaN(priceNum) || priceNum <= 0) return NextResponse.json({ error: "Valid price required" }, { status: 400 });
    if (!Array.isArray(sourceImages) || sourceImages.length === 0) return NextResponse.json({ error: "At least one image required" }, { status: 400 });

    const fee = getTierFee(tier);
    const compareNum = parseFloat(String(productComparePrice || "0"));

    await db.insert(conciergeRequests).values({
      vendorId: vendor.id,
      tier: String(tier),
      fee: fee.toFixed(2),
      productName: String(productName).slice(0, 200),
      productBrand: String(productBrand || "").slice(0, 100),
      productCategory: String(productCategory || "sneakers"),
      productPrice: priceNum.toFixed(2),
      productComparePrice: compareNum > 0 ? compareNum.toFixed(2) : null,
      productMaterial: String(productMaterial || "").slice(0, 200),
      productSizes: JSON.stringify(Array.isArray(productSizes) ? productSizes : []),
      productColors: JSON.stringify(Array.isArray(productColors) ? productColors : []),
      productStock: parseInt(String(productStock || "0"), 10) || 0,
      sourceImages: JSON.stringify(sourceImages),
      notes: String(notes || "").slice(0, 2000),
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: `Concierge request submitted. Fee $${fee.toFixed(2)} will be added to your invoice when completed.`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}