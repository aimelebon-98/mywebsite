import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import WhatsAppButton from "@/components/WhatsAppButton";
import MiniCartDrawer from "@/components/MiniCartDrawer";

import CookieConsent from "@/components/CookieConsent";
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
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            <WishlistProvider>
              {children}
              <MiniCartDrawer />
              <WhatsAppButton />
            </WishlistProvider>
          </CartProvider>
        </NextIntlClientProvider>
        <CookieConsent />
      </body>
    </html>
  );
}