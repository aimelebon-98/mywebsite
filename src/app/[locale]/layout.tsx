import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});
import type { ReactNode } from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import WhatsAppButton from "@/components/WhatsAppButton";
import MiniCartDrawer from "@/components/MiniCartDrawer";
import FloatingCartPill from "@/components/FloatingCartPill";
import InactivityCartReminder from "@/components/InactivityCartReminder";

import ExitIntentPopup from "@/components/ExitIntentPopup";
import PageViewTracker from "@/components/AnalyticsTracker";
import CookieConsent from "@/components/CookieConsent";
import StickyPromoBar from "@/components/StickyPromoBar";
import { SpeedInsights } from "@vercel/speed-insights/next";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://solevault.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SoleVault - Premium Footwear | Sneakers, Boots, Formal Shoes",
    template: "%s | SoleVault",
  },
  description: "Discover premium shoes for every occasion at SoleVault. Shop sneakers, running shoes, boots, formal shoes, sandals and more. Free shipping on orders over $100.",
  keywords: ["shoes", "sneakers", "boots", "running shoes", "formal shoes", "footwear", "SoleVault"],
  authors: [{ name: "SoleVault" }],
  openGraph: {
    type: "website",
    siteName: "SoleVault",
    title: "SoleVault - Premium Footwear",
    description: "Discover premium shoes for every occasion.",
    images: [{ url: "/images/hero-shoe.jpg", width: 1200, height: 630, alt: "SoleVault" }],
  },
  robots: { index: true, follow: true },
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
    name: "SoleVault",
    description: "Premium footwear for every occasion",
    url: siteUrl,
    priceRange: "$$",
  };

  return (
    <html lang={locale} className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white text-gray-900 antialiased font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            <WishlistProvider>
              {children}
              <MiniCartDrawer />
              <FloatingCartPill />
              <InactivityCartReminder />
              <WhatsAppButton />
            </WishlistProvider>
          </CartProvider>
        </NextIntlClientProvider>
        <StickyPromoBar />
        <CookieConsent />
        <PageViewTracker />
        <ExitIntentPopup />
        <SpeedInsights />
      </body>
    </html>
  );
}