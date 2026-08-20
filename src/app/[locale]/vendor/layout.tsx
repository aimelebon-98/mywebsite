"use client";

import IdleTimeoutGuard from "@/components/IdleTimeoutGuard";
import { useParams, usePathname } from "next/navigation";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const isPublicVendorPage =
    pathname?.includes("/vendor/login") ||
    pathname?.includes("/vendor/apply") ||
    pathname?.includes("/vendor/change-password");

  return (
    <>
      {!isPublicVendorPage && (
        <IdleTimeoutGuard
          logoutApiUrl="/api/vendor/logout"
          redirectUrl={`/${locale}/vendor/login?reason=timeout`}
          isFr={isFr}
        />
      )}
      {children}
    </>
  );
}