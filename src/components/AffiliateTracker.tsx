"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function TrackerInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;

    const alreadyTracked = sessionStorage.getItem("ndz_ref_tracked");
    if (alreadyTracked === ref) return;

    fetch(`/api/affiliate/track?ref=${encodeURIComponent(ref)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          sessionStorage.setItem("ndz_ref_tracked", ref);
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