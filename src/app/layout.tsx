import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import WhatsAppButton from "@/components/WhatsAppButton";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://solevault.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SoleVault - Premium Footwear | Sneakers, Boots, Formal Shoes",
    template: "%s | SoleVault",
  },
  description: "Discover premium shoes for every occasion at SoleVault. Shop sneakers, running shoes, boots, formal shoes, sandals and more. Free shipping on orders over $100.",
  keywords: ["shoes", "sneakers", "boots", "running shoes", "formal shoes", "footwear", "SoleVault", "buy shoes online", "premium shoes"],
  authors: [{ name: "SoleVault" }],
  creator: "SoleVault",
  publisher: "SoleVault",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SoleVault",
    title: "SoleVault - Premium Footwear",
    description: "Discover premium shoes for every occasion. 50+ styles to choose from.",
    images: [{ url: "/images/hero-shoe.jpg", width: 1200, height: 630, alt: "SoleVault Premium Footwear" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SoleVault - Premium Footwear",
    description: "Discover premium shoes for every occasion. 50+ styles to choose from.",
    images: ["/images/hero-shoe.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "SoleVault",
    description: "Premium footwear for every occasion",
    url: siteUrl,
    logo: `${siteUrl}/images/hero-shoe.jpg`,
    priceRange: "$$",
    servesCuisine: "Footwear",
  };

  return (
    <html lang="en">
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
        <CartProvider>
          <WishlistProvider>
            {children}
            <WhatsAppButton />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
