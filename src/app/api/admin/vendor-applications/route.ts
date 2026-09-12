import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendorApplications, vendors } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import {
  hashVendorPassword,
  generateRandomPassword,
  generateUniqueStoreSlug,
} from "@/lib/vendor-auth";
import { defaultCurrencyForCountry } from "@/lib/vendor-currency";
import { sendVendorApprovedEmail, sendVendorRejectedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");

    let apps;
    if (statusFilter && ["pending", "approved", "rejected"].includes(statusFilter)) {
      apps = await db
        .select()
        .from(vendorApplications)
        .where(eq(vendorApplications.status, statusFilter))
        .orderBy(desc(vendorApplications.createdAt));
    } else {
      apps = await db
        .select()
        .from(vendorApplications)
        .orderBy(desc(vendorApplications.createdAt));
    }

    const pendingCount = apps.filter((a) => a.status === "pending").length;
    return NextResponse.json({ applications: apps, pendingCount });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function approveSingleApp(app: any, commissionRate?: string, adminNote?: string, locale?: string) {
  const lang: "en" | "fr" = locale === "fr" ? "fr" : "en";
  const note = String(adminNote || "").slice(0, 1000);
  const commission =
    commissionRate && !isNaN(parseFloat(commissionRate))
      ? parseFloat(commissionRate).toFixed(2)
      : "10.00";

  const [existingVendor] = await db
    .select()
    .from(vendors)
    .where(eq(vendors.email, app.email))
    .limit(1);

  let vendorId: string;
  let tempPassword: string | null = null;
  let storeSlug: string;

  if (existingVendor) {
    await db
      .update(vendors)
      .set({
        status: "approved",
        commissionRate: commission,
        approvedAt: new Date(),
        adminNote: note,
        contactName: app.applicantName || existingVendor.contactName,
        phone: app.phone || existingVendor.phone,
        whatsapp: app.whatsapp || existingVendor.whatsapp,
        city: app.city || existingVendor.city,
        storeDescription: app.storeDescription || existingVendor.storeDescription,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, existingVendor.id));
    vendorId = existingVendor.id;
    storeSlug = existingVendor.storeSlug;
  } else {
    tempPassword = generateRandomPassword(12);
    const passwordHash = await hashVendorPassword(tempPassword);
    storeSlug = await generateUniqueStoreSlug(app.storeName);

    const [newVendor] = await db
      .insert(vendors)
      .values({
        email: app.email,
        passwordHash,
        storeName: app.storeName,
        storeSlug,
        contactName: app.applicantName,
        phone: app.phone,
        whatsapp: app.whatsapp,
        country: app.country,
        city: app.city,
        commissionRate: commission,
        preferredCurrency: defaultCurrencyForCountry(app.country),
        status: "approved",
        approvedAt: new Date(),
        mustChangePassword: true,
      })
      .returning();
    vendorId = newVendor.id;
  }

  await db
    .update(vendorApplications)
    .set({
      status: "approved",
      adminNote: note,
      reviewedAt: new Date(),
    })
    .where(eq(vendorApplications.id, app.id));

  sendVendorApprovedEmail(
    app.email,
    app.applicantName,
    app.storeName,
    tempPassword || "(your existing password)",
    lang
  ).catch(() => {});

  return {
    id: vendorId,
    email: app.email,
    storeName: app.storeName,
    storeSlug,
    tempPassword,
  };
}

async function rejectSingleApp(app: any, adminNote?: string, locale?: string) {
  const lang: "en" | "fr" = locale === "fr" ? "fr" : "en";
  const note = String(adminNote || "").slice(0, 1000);

  await db
    .update(vendorApplications)
    .set({
      status: "rejected",
      adminNote: note,
      reviewedAt: new Date(),
    })
    .where(eq(vendorApplications.id, app.id));

  await db
    .update(vendors)
    .set({ status: "rejected", adminNote: note, updatedAt: new Date() })
    .where(eq(vendors.email, app.email));

  sendVendorRejectedEmail(app.email, app.applicantName, note, lang).catch(() => {});
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { applicationId, applicationIds, action, adminNote, commissionRate, locale } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const idsToProcess: string[] = Array.isArray(applicationIds)
      ? applicationIds
      : applicationId
      ? [applicationId]
      : [];

    if (idsToProcess.length === 0) {
      return NextResponse.json({ error: "No applications selected" }, { status: 400 });
    }

    const apps = await db
      .select()
      .from(vendorApplications)
      .where(inArray(vendorApplications.id, idsToProcess));

    if (apps.length === 0) {
      return NextResponse.json({ error: "Applications not found" }, { status: 404 });
    }

    let lastVendorInfo = null;
    let processedCount = 0;

    for (const app of apps) {
      if (action === "approve") {
        lastVendorInfo = await approveSingleApp(app, commissionRate, adminNote, locale);
        processedCount++;
      } else {
        await rejectSingleApp(app, adminNote, locale);
        processedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${processedCount} application(s) ${action === "approve" ? "approved" : "rejected"}`,
      vendor: lastVendorInfo,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}