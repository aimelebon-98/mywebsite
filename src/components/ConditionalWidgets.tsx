"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import MiniCartDrawer from "@/components/MiniCartDrawer";

const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton"));

/**
 * MiniCartDrawer: mounted on almost every page so the navbar cart icon works everywhere.
 *   Hidden only where redundant (cart page, checkout) or irrelevant (admin).
 *
 * WhatsAppButton: only on marketing pages (home, shop, product, contact, about).
 */
export default function ConditionalWidgets() {
  const pathname = usePathname() || "";
  const path = pathname.replace(/^\/(en|fr)/, "") || "/";

  // Hide the drawer only where it would be redundant or in admin context
  const hideMiniCart =
    path === "/cart" ||
    path.startsWith("/cart/") ||
    path === "/checkout" ||
    path.startsWith("/checkout/") ||
    path.startsWith("/admin");
  const showMiniCart = !hideMiniCart;

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
