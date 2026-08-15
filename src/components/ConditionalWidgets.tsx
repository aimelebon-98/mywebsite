"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import MiniCartDrawer from "@/components/MiniCartDrawer";
import MobileBottomNav from "@/components/MobileBottomNav";

const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton"));
// MobileBottomNav is now imported directly at top for zero-CLS instant render

export default function ConditionalWidgets() {
  const pathname = usePathname() || "";
  const path = pathname.replace(/^\/(en|fr)/, "") || "/";

  // MiniCartDrawer: hide only where redundant
  const hideMiniCart =
    path === "/cart" ||
    path.startsWith("/cart/") ||
    path === "/checkout" ||
    path.startsWith("/checkout/") ||
    path.startsWith("/admin");

  const showMiniCart = !hideMiniCart;

  // WhatsApp: ONLY on about, contact, faq, blog listing, blog post pages
  const isAbout = path === "/about";
  const isContact = path === "/contact";
  const isFaq = path === "/faq";
  const isBlogListing = path === "/blog";
  // Blog post: /blog/{slug} but NOT /blog/author/{slug}
  const isBlogPost = /^\/blog\/[^/]+$/.test(path) && !path.startsWith("/blog/author");

  const showWhatsApp = isAbout || isContact || isFaq || isBlogListing || isBlogPost;

  // If on a blog post, fetch title so WhatsApp initial message includes it
  const [blogPostTitle, setBlogPostTitle] = useState<string>("");

  useEffect(() => {
    if (!isBlogPost) { setBlogPostTitle(""); return; }
    const match = path.match(/^\/blog\/([^/]+)$/);
    if (!match) return;
    const slug = match[1];

    fetch(`/api/blog/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(post => {
        if (post) {
          const isFr = pathname.startsWith("/fr");
          const title = isFr ? (post.titleFr || post.title) : post.title;
          setBlogPostTitle(title || "");
        }
      })
      .catch(() => {});
  }, [path, isBlogPost, pathname]);

  // Full URL of current blog post for the WhatsApp message
  const blogPostUrl = isBlogPost && typeof window !== "undefined"
    ? window.location.href
    : "";

  return (
    <>
      <MobileBottomNav />
      {showMiniCart && <MiniCartDrawer />}
      {showWhatsApp && (
        <WhatsAppButton
          blogPostTitle={blogPostTitle}
          blogPostUrl={blogPostUrl}
        />
      )}
    </>
  );
}