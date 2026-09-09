import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendorApplications, vendors } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { applicationId, action, adminNote, commissionRate, locale } = body;

    if (!applicationId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const [app] = await db
      .select()
      .from(vendorApplications)
      .where(eq(vendorApplications.id, applicationId))
      .limit(1);

    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (app.status !== "pending") {
      return NextResponse.json(
        { error: "Application already reviewed" },
        { status: 400 }
      );
    }

    const lang: "en" | "fr" = locale === "fr" ? "fr" : "en";
    const note = String(adminNote || "").slice(0, 1000);

    if (action === "approve") {
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
        // Instant-dashboard flow: vendor already exists as pending
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
            storeDescription:
              app.storeDescription || existingVendor.storeDescription,
            updatedAt: new Date(),
          })
          .where(eq(vendors.id, existingVendor.id));
        vendorId = existingVendor.id;
        storeSlug = existingVendor.storeSlug;
      } else {
        // Legacy flow: create vendor on approve
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
        .where(eq(vendorApplications.id, applicationId));

      if (tempPassword) {
        sendVendorApprovedEmail(
          app.email,
          app.applicantName,
          app.storeName,
          tempPassword,
          lang
        ).catch(() => {});
      } else {
        // Existing pending vendor — notify approval without new password
        sendVendorApprovedEmail(
          app.email,
          app.applicantName,
          app.storeName,
          "(your existing password)",
          lang
        ).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        message: "Vendor approved",
        vendor: {
          id: vendorId,
          email: app.email,
          storeName: app.storeName,
          storeSlug,
          tempPassword,
        },
      });
    } else {
      await db
        .update(vendorApplications)
        .set({
          status: "rejected",
          adminNote: note,
          reviewedAt: new Date(),
        })
        .where(eq(vendorApplications.id, applicationId));

      // Also reject the vendor account if it exists
      await db
        .update(vendors)
        .set({ status: "rejected", adminNote: note, updatedAt: new Date() })
        .where(eq(vendors.email, app.email));

      sendVendorRejectedEmail(app.email, app.applicantName, note, lang).catch(
        () => {}
      );

      return NextResponse.json({
        success: true,
        message: "Application rejected",
      });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}