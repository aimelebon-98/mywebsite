"use client";


import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import MiniCartDrawer from "@/components/MiniCartDrawer";


const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton"));


const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

export default function ConditionalWidgets() {
  
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

const pathname = usePathname() || "";
  
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

const path = pathname.replace(/^\/(en|fr)/, "") || "/";

  // MiniCartDrawer: hide only where redundant
  
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

const hideMiniCart =
    path === "/cart" ||
    path.startsWith("/cart/") ||
    path === "/checkout" ||
    path.startsWith("/checkout/") ||
    path.startsWith("/admin");
  
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

const showMiniCart = !hideMiniCart;

  // WhatsApp: ONLY on about, contact, faq, blog listing, blog post pages
  
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

const isAbout = path === "/about";
  
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

const isContact = path === "/contact";
  
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

const isFaq = path === "/faq";
  
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

const isBlogListing = path === "/blog";
  // Blog post: /blog/{slug} but NOT /blog/author/{slug}
  
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

const isBlogPost = /^\/blog\/[^/]+$/.test(path) && !path.startsWith("/blog/author");

  
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

const showWhatsApp = isAbout || isContact || isFaq || isBlogListing || isBlogPost;

  // If on a blog post, fetch title so WhatsApp initial message includes it
  const [blogPostTitle, setBlogPostTitle] = useState<string>("");

  useEffect(() => {
    if (!isBlogPost) { setBlogPostTitle(""); return; }
    
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

const match = path.match(/^\/blog\/([^/]+)$/);
    if (!match) return;
    
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

const slug = match[1];

    fetch(`/api/blog/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(post => {
        if (post) {
          
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

const isFr = pathname.startsWith("/fr");
          
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

const title = isFr ? (post.titleFr || post.title) : post.title;
          setBlogPostTitle(title || "");
        }
      })
      .catch(() => {});
  }, [path, isBlogPost, pathname]);

  // Full URL of current blog post for the WhatsApp message
  
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

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