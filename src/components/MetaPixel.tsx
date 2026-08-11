"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { FB_PIXEL_ID, pageview } from "@/lib/fbpixel";

const CONSENT_KEY = "sv_cookie_consent";

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    pageview();
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixel() {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (stored) setConsentGiven(true);
      } catch { /* ignore */ }
    };
    check();
    const onConsent = () => check();
    window.addEventListener("cookieConsentUpdated", onConsent);
    window.addEventListener("storage", onConsent);
    return () => {
      window.removeEventListener("cookieConsentUpdated", onConsent);
      window.removeEventListener("storage", onConsent);
    };
  }, []);

  if (!consentGiven) return null;

  return (
    <>
      <Script id="meta-pixel-init" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FB_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}