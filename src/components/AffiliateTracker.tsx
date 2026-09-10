"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function TrackerInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;

    const cleanRef = ref.trim();
    try {
      localStorage.setItem("ndz_affiliate", cleanRef);
      sessionStorage.setItem("ndz_affiliate", cleanRef);
      document.cookie = `ndz_affiliate=${encodeURIComponent(cleanRef)}; path=/; max-age=2592000; SameSite=Lax`;
    } catch {}

    const alreadyTracked = sessionStorage.getItem("ndz_ref_tracked");
    if (alreadyTracked === cleanRef) return;

    fetch(`/api/affiliate/track?ref=${encodeURIComponent(cleanRef)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          sessionStorage.setItem("ndz_ref_tracked", cleanRef);
        }
      })
      .catch(() => {});
  }, [searchParams]);

  return null;
}

export default function AffiliateTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}