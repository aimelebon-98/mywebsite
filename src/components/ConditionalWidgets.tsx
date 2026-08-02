"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import MiniCartDrawer from "@/components/MiniCartDrawer";

const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton"));

/**
 * MiniCartDrawer: show almost everywhere so the navbar cart icon works.
 *   Hide only where it would be redundant (cart page, checkout, account, admin).
 *
 * WhatsAppButton: only on marketing pages (shop, product, contact, about, home).
 */
export default function ConditionalWidgets() {
  const pathname = usePathname() || "";
  const path = pathname.replace(/^\/(en|fr)/, "") || "/";

  // MiniCartDrawer: hide only where cart is redundant or would conflict
  const hideMiniCartOn = [
    "/cart",
    "/checkout",
  ];
  const hideMiniCart =
    hideMiniCartOn.includes(path) ||
    path.startsWith("/account") ||
    path.startsWith("/admin");
  const showMiniCart = !hideMiniCart;

  // WhatsAppButton: only on shop/product/home/contact/about
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
