"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

const GA_ID = "G-60GBMLBCFM";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function trackPageView(url: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Check existing consent
    const check = () => {
      try {
        const stored = localStorage.getItem("solevault-cookie-consent");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.analytics === true || parsed === "accepted" || parsed === true) {
            setConsentGiven(true);
          }
        }
      } catch { /* ignore */ }
    };

    check();

    // Listen for consent changes
    const onConsent = () => check();
    window.addEventListener("cookie-consent-updated", onConsent);
    window.addEventListener("storage", onConsent);

    return () => {
      window.removeEventListener("cookie-consent-updated", onConsent);
      window.removeEventListener("storage", onConsent);
    };
  }, []);

  if (!consentGiven) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            anonymize_ip: true,
            page_path: window.location.pathname,
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
