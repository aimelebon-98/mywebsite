"use client";

import { useEffect, useRef, useState } from "react";
import { trackCustom as fbTrackCustom } from "@/lib/fbpixel";

interface Props {
  productId: string;
  productName?: string;
}

// Fires ReviewsScroll event when user scrolls the reviews section into view.
// Place this component AS A CHILD of the reviews section on the product page.
export default function ReviewsScrollTracker({ productId, productName }: Props) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !ref.current || typeof window === "undefined") return;

    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !firedRef.current) {
            firedRef.current = true;
            try {
              fbTrackCustom("ReviewsScroll", {
                content_ids: [productId],
                content_name: productName || "",
                content_type: "product",
              });
            } catch { /* ignore */ }
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted, productId, productName]);

  return <div ref={ref} aria-hidden="true" style={{ height: 1, width: 1 }} />;
}