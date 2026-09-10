"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import VendorSignupWizard from "@/components/VendorSignupWizard";

function SetupGuardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const locale = pathname.split("/")[1] || "en";

  useEffect(() => {
    if (searchParams.get("setup") === "1") {
      setShow(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setShow(false);
    const clean = pathname.split("?")[0];
    router.replace(clean);
    window.location.reload();
  };

  return <VendorSignupWizard isOpen={show} onClose={handleClose} locale={locale} />;
}

export default function VendorSetupGuard() {
  return (
    <Suspense fallback={null}>
      <SetupGuardInner />
    </Suspense>
  );
}
