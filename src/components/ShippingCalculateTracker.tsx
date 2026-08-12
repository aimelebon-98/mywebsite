"use client";

import { useEffect, useRef, useState } from "react";
import { trackCustom as fbTrackCustom } from "@/lib/fbpixel";

interface Props {
  productId?: string;
  productName?: string;
}

// Fires ShippingCalculate when user scrolls the shipping-info UI into view.
// Place this component wherever shipping info is shown (product page, cart, checkout).
export default function ShippingCalculateTracker({ productId, productName }: Props) {
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
              fbTrackCustom("ShippingCalculate", {
                content_ids: productId ? [productId] : undefined,
                content_name: productName || "",
                source: "product_page",
              });
            } catch { /* ignore */ }
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted, productId, productName]);

  return <div ref={ref} aria-hidden="true" style={{ height: 1, width: 1 }} />;
}