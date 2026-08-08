import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product No Longer Available | New Deal Zone",
  description: "This product has been removed from our catalog. Browse our current collection.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-[#CA3F2E] uppercase tracking-wider mb-3">
          410 - Gone
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
          This product is no longer available
        </h1>
        <p className="text-gray-600 mb-8">
          The product you are looking for has been permanently removed from our catalog.
          Explore our current collection of premium footwear.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/en/shop"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#CA3F2E] text-white font-semibold rounded-lg hover:bg-[#8B2A1E] transition"
          >
            Browse Shop
          </Link>
          <Link
            href="/en"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-black font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}