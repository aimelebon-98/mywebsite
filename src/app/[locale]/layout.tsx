import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { CustomerProvider } from "@/lib/customer-context";
import ConditionalWidgets from "@/components/ConditionalWidgets";
import ThemeColorSwitcher from "@/components/ThemeColorSwitcher";
import FloatingCartPill from "@/components/FloatingCartPill";
import PageViewTracker from "@/components/AnalyticsTracker";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Self-hosted Inter font (eliminates render-blocking Google Fonts request)
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  adjustFontFallback: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

// Lazy-load non-critical UI (huge FCP/LCP win - loaded AFTER first paint)
const InactivityCartReminder = dynamic(() => import("@/components/InactivityCartReminder"));
const ExitIntentPopup = dynamic(() => import("@/components/ExitIntentPopup"));
const CookieConsent = dynamic(() => import("@/components/CookieConsent"));
const StickyPromoBar = dynamic(() => import("@/components/StickyPromoBar"));

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.newdealzone.com";

// Chrome mobile address bar color + PWA theme
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#111827" },
    { media: "(prefers-color-scheme: dark)",  color: "#000000" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NewDealZone - Premium Footwear | Sneakers, Boots, Formal Shoes",
    template: "%s | NewDealZone",
  },
  description: "Discover premium shoes for every occasion at NewDealZone. Shop sneakers, running shoes, boots, formal shoes, sandals and more. Free shipping on orders over $1000.",
  keywords: ["shoes", "sneakers", "boots", "running shoes", "formal shoes", "footwear", "NewDealZone"],
  authors: [{ name: "NewDealZone" }],
  openGraph: {
    type: "website",
    siteName: "NewDealZone",
    title: "NewDealZone - Premium Footwear",
    description: "Discover premium shoes for every occasion.",
    images: [{ url: "/images/hero-shoe.jpg", width: 1200, height: 630, alt: "NewDealZone" }],
  },
  robots: { index: true, follow: true },
  verification: {
    google: "JY5IqgH1P44E4yJsMaRCsPWYfixVcPNFrILitMmKzmg",
  },
  // Chrome / Safari mobile address bar color - matches brand
  other: {
    "theme-color": "#111827",
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "en": `${siteUrl}/en`,
      "fr": `${siteUrl}/fr`,
      "x-default": `${siteUrl}/en`,
    },
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "NewDealZone",
    description: "Premium footwear for every occasion",
    url: siteUrl,
    priceRange: "$$",
  };

  return (
    <html lang={locale} className={inter.variable}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white text-gray-900 antialiased font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            <CustomerProvider>
            <CurrencyProvider>
            <WishlistProvider>
              {children}
              <ConditionalWidgets />
              <FloatingCartPill />
              <InactivityCartReminder />
            </WishlistProvider>
          </CurrencyProvider>
          </CustomerProvider>
          </CartProvider>
        </NextIntlClientProvider>
        <StickyPromoBar />
        <CookieConsent />
        <PageViewTracker />
        <ExitIntentPopup />
        <SpeedInsights />
        <ThemeColorSwitcher />
      </body>
    </html>
  );
}