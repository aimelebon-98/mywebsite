"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import MiniCartDrawer from "@/components/MiniCartDrawer";

const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton"));

/**
 * MiniCartDrawer -> shop pages only (list + category, NOT product detail)
 * WhatsAppButton -> shop, product, contact, about
 * All other pages (account, checkout, cart, blog, legal, admin, etc.) hide both.
 */
export default function ConditionalWidgets() {
  const pathname = usePathname() || "";

  // Strip locale prefix (/en/... or /fr/...) for cleaner matching
  const path = pathname.replace(/^\/(en|fr)/, "") || "/";

  // MiniCart: only on shop listing pages (not product detail, not cart, not checkout)
  const showMiniCart =
    path === "/shop" ||
    path.startsWith("/shop/") ||
    path === "/";  // homepage also has category grids -> allow

  // WhatsApp: shop pages, product pages, contact, about
  const showWhatsApp =
    path === "/" ||
    path === "/shop" ||
    path.startsWith("/shop/") ||
    path.startsWith("/product/") ||
    path === "/contact" ||
    path === "/about";

  return (
    <>
      {showMiniCart && <MiniCartDrawer />}
      {showWhatsApp && <WhatsAppButton />}
    </>
  );
}
