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
import { getServerCurrency, getServerRates, getServerCountry } from "@/lib/server-currency";
import { CustomerProvider } from "@/lib/customer-context";
import ConditionalWidgets from "@/components/ConditionalWidgets";
import ThemeColorSwitcher from "@/components/ThemeColorSwitcher";
import MetaPixel from "@/components/MetaPixel";
import ScrollDepthTracker from "@/components/ScrollDepthTracker";
import LanguageChangeTracker from "@/components/LanguageChangeTracker";
const FloatingCartPill = dynamic(() => import("@/components/FloatingCartPill"));
const PageViewTracker = dynamic(() => import("@/components/AnalyticsTracker"));

import TopLoader from "@/components/TopLoader";
import PageTransition from "@/components/PageTransition";
import { SpeedInsights } from "@vercel/speed-insights/next";
const GoogleAnalytics = dynamic(() => import("@/components/GoogleAnalytics"));

// Self-hosted Inter font (eliminates render-blocking Google Fonts request)
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
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
  // Red matches the majority of pages (shop, product, blog, etc.)
  // ThemeColorSwitcher client component overrides to black on homepage after hydration
  themeColor: "#8B2A1E",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "New Deal | ZONE",
  title: {
    default: "New Deal | ZONE - Premium Footwear | Sneakers, Boots, Formal Shoes",
    template: "%s | New Deal | ZONE",
  },
  description: "Discover premium shoes for every occasion at New Deal | ZONE. Shop sneakers, running shoes, boots, formal shoes, sandals and more. Free shipping on orders over $1000.",
  keywords: ["shoes", "sneakers", "boots", "running shoes", "formal shoes", "footwear", "New Deal ZONE", "NewDealZone"],
  authors: [{ name: "New Deal | ZONE" }],
  openGraph: {
    type: "website",
    siteName: "New Deal | ZONE",
    title: "New Deal | ZONE - Premium Footwear",
    description: "Discover premium shoes for every occasion.",
    images: [{ url: "/images/hero-shoe.jpg", width: 1200, height: 630, alt: "New Deal | ZONE" }],
  },
  robots: { index: true, follow: true },
  verification: {
    google: "JY5IqgH1P44E4yJsMaRCsPWYfixVcPNFrILitMmKzmg",
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

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "New Deal | ZONE",
      alternateName: ["NewDealZone", "New Deal Zone", "NewDeal Zone", "NDZ"],
      url: siteUrl,
      inLanguage: locale,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/${locale}/shop?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "New Deal | ZONE",
      alternateName: ["NewDealZone", "New Deal Zone", "NDZ"],
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/apple-touch-icon.svg`,
        width: 512,
        height: 512,
      },
      description: "Premium footwear for every occasion",
      sameAs: [],
    },
    {
      "@context": "https://schema.org",
      "@type": "Store",
      "@id": `${siteUrl}/#store`,
      name: "New Deal | ZONE",
      alternateName: ["NewDealZone", "New Deal Zone"],
      description: "Premium footwear for every occasion",
      url: siteUrl,
      priceRange: "$",
      image: `${siteUrl}/apple-touch-icon.svg`,
    },
  ];

  const [initialCurrency, initialRates, initialCountry] = await Promise.all([
    getServerCurrency(),
    getServerRates(),
    getServerCountry(),
  ]);

  return (
    <html lang={locale} className={`${inter.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://i.ibb.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white text-gray-900 antialiased font-sans">
        <TopLoader />
        <PageTransition />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            <CustomerProvider>
              <CurrencyProvider initialCurrency={initialCurrency} initialRates={initialRates} initialCountry={initialCountry}>
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
        <GoogleAnalytics />
        <MetaPixel />
        <ScrollDepthTracker />
        <LanguageChangeTracker />
        <ThemeColorSwitcher />
      </body>
    </html>
  );
}