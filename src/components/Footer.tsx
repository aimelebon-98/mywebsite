"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubStatus("loading");
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubStatus("done");
      setEmail("");
    } catch {
      setSubStatus("idle");
    }
  };

  const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.6c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.6v3h2.5V21h3.4z" />
    </svg>
  );

  const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );

  const XIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  const socials = [
    { name: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
    { name: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
    { name: "X (Twitter)", href: "https://twitter.com", Icon: XIcon },
  ];

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">{t("newsletterTitle")}</h4>
                <p className="text-xs text-gray-500">{t("newsletterDesc")}</p>
              </div>
            </div>

            {subStatus === "done" ? (
              <p className="text-green-400 text-sm font-semibold">{t("subscribed")}</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto gap-2">
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    required
                    className="w-full sm:w-72 pl-4 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subStatus === "loading"}
                  className="flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 whitespace-nowrap"
                >
                  {subStatus === "loading" ? "..." : <>{t("subscribe")} <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">SV</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">SoleVault</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">{t("tagline")}</p>
            <div className="flex items-center gap-3">
              {socials.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t("shop")}</h4>
            <ul className="space-y-3">
              <li><Link href="/shop?category=sneakers" className="text-sm hover:text-white transition">Sneakers</Link></li>
              <li><Link href="/shop?category=running" className="text-sm hover:text-white transition">Running</Link></li>
              <li><Link href="/shop?category=formal" className="text-sm hover:text-white transition">Formal</Link></li>
              <li><Link href="/shop?category=boots" className="text-sm hover:text-white transition">Boots</Link></li>
              <li><Link href="/shop?category=sandals" className="text-sm hover:text-white transition">Sandals</Link></li>
              <li><Link href="/shop?category=casual" className="text-sm hover:text-white transition">Casual</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t("support")}</h4>
            <ul className="space-y-3">
              <li><Link href="/blog" className="text-sm hover:text-white transition">Blog</Link></li>
              <li><Link href="/faq" className="text-sm hover:text-white transition">{t("faq")}</Link></li>
              <li><Link href="/shipping" className="text-sm hover:text-white transition">{t("shippingPolicy")}</Link></li>
              <li><Link href="/returns" className="text-sm hover:text-white transition">{t("returns")}</Link></li>
              <li><Link href="/faq" className="text-sm hover:text-white transition">{t("sizeGuide")}</Link></li>
              <li><Link href="/about" className="text-sm hover:text-white transition">{t("aboutUs")}</Link></li>
              <li><Link href="/contact" className="text-sm hover:text-white transition">{t("contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t("account")}</h4>
            <ul className="space-y-3">
              <li><Link href="/cart" className="text-sm hover:text-white transition">{t("myCart")}</Link></li>
              <li><Link href="/wishlist" className="text-sm hover:text-white transition">{t("myWishlist")}</Link></li>
              <li><Link href="/shop" className="text-sm hover:text-white transition">Shop</Link></li>
              <li><Link href="/faq" className="text-sm hover:text-white transition">{t("helpCenter")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          {/* Payment methods */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">We Accept</span>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Visa */}
                <div className="h-8 px-2.5 bg-white rounded-md flex items-center justify-center" title="Visa">
                  <svg viewBox="0 0 48 16" className="h-4" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.7 15.3h-3.4l2.1-13h3.4l-2.1 13zM32.6 2.6c-.7-.3-1.7-.6-3-.6-3.3 0-5.6 1.7-5.6 4.1 0 1.8 1.7 2.8 3 3.4 1.3.6 1.8 1 1.8 1.6 0 .9-1.1 1.3-2.1 1.3-1.4 0-2.2-.2-3.4-.7l-.5-.2-.5 3c.8.4 2.3.7 3.9.7 3.5 0 5.8-1.7 5.9-4.2 0-1.4-.9-2.5-2.9-3.4-1.2-.6-1.9-1-1.9-1.6 0-.6.7-1.2 2-1.2 1.1 0 1.9.2 2.5.5l.3.1.5-2.8zM40.3 2.3h-2.6c-.8 0-1.4.2-1.8 1.1l-5 11.9h3.5l.7-1.9h4.3c.1.4.4 1.9.4 1.9h3.1l-2.6-13zm-4.3 8.3c.3-.7 1.3-3.5 1.3-3.5 0 .1.3-.7.4-1.2l.2 1.1s.6 3 .8 3.6h-2.7zM12.2 2.3l-3.3 8.9-.4-1.8c-.6-2.1-2.5-4.4-4.6-5.5l3 11.4h3.5l5.2-13h-3.4z" fill="#1A1F71"/>
                  </svg>
                </div>
                {/* Mastercard */}
                <div className="h-8 px-2.5 bg-white rounded-md flex items-center justify-center" title="Mastercard">
                  <svg viewBox="0 0 32 24" className="h-5" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="7" fill="#EB001B"/>
                    <circle cx="20" cy="12" r="7" fill="#F79E1B"/>
                    <path d="M16 6.5c1.7 1.4 2.8 3.4 2.8 5.5s-1.1 4.1-2.8 5.5c-1.7-1.4-2.8-3.4-2.8-5.5s1.1-4.1 2.8-5.5z" fill="#FF5F00"/>
                  </svg>
                </div>
                {/* American Express */}
                <div className="h-8 px-2.5 bg-[#006FCF] rounded-md flex items-center justify-center" title="American Express">
                  <span className="text-white font-black text-[10px] tracking-tight">AMEX</span>
                </div>
                {/* PayPal */}
                <div className="h-8 px-2.5 bg-white rounded-md flex items-center justify-center" title="PayPal">
                  <svg viewBox="0 0 48 16" className="h-4" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.5 2h-6c-.4 0-.8.3-.9.7L9 14.1c0 .3.2.5.4.5h3l.8-4.6v.2c.1-.4.5-.7.9-.7h1.4c2.8 0 5-1.1 5.6-4.4v-.3c.2-1 0-1.7-.6-2.3-.5-.4-1.4-.5-2-.5z" fill="#003087"/>
                    <path d="M25.4 5.8c-.1.5-.3.9-.6 1.4-.8 1.4-2.2 2-4 2h-1.1c-.2 0-.4.2-.5.4l-.7 4.4-.2 1.2c0 .2.1.4.3.4h2.2c.2 0 .4-.2.4-.4v-.1l.4-2.6v-.2c0-.2.3-.4.5-.4h.3c1.8 0 3.3-.7 3.7-2.9.2-.9.1-1.7-.4-2.3-.1-.2-.3-.3-.4-.5z" fill="#009CDE"/>
                    <path d="M24.7 5.5c-.1 0-.2-.1-.4-.1-.1 0-.2-.1-.4-.1-.4-.1-.9-.1-1.4-.1h-4.1c-.1 0-.2 0-.3.1-.2.1-.3.3-.4.5l-.9 5.5v.2c.1-.2.3-.4.5-.4h1.1c1.8 0 3.2-.7 4-2 .3-.4.5-.9.6-1.4.1-.4.1-.7.1-1.1 0-.4-.2-.7-.4-1.1zM39 5.7h-2.2c-.1 0-.3.1-.3.3l-.1.7-.1-.2c-.4-.6-1.3-.8-2.2-.8-1.9 0-3.7 1.4-4 3.4-.2 1 .1 2 .6 2.7.5.6 1.2.9 2.1.9 1.5 0 2.4-1 2.4-1l-.1.6c0 .2.1.3.3.3H37c.2 0 .4-.2.4-.4l1.1-7.1c.1-.3-.1-.4-.5-.4z" fill="#003087"/>
                  </svg>
                </div>
                {/* Apple Pay */}
                <div className="h-8 px-2.5 bg-black border border-gray-700 rounded-md flex items-center justify-center" title="Apple Pay">
                  <svg viewBox="0 0 32 12" className="h-4" xmlns="http://www.w3.org/2000/svg" fill="white">
                    <path d="M5.5 2.2c-.4.5-1 .9-1.7.8-.1-.7.3-1.4.7-1.9.4-.5 1.1-.8 1.7-.9.1.8-.2 1.5-.7 2zm.7.9c-1 0-1.8.6-2.3.6s-1.2-.5-2-.5c-1 0-2 .6-2.5 1.5-1.1 1.9-.3 4.6.7 6.1.5.7 1.1 1.5 1.9 1.5.8 0 1-.5 2-.5s1.2.5 2 .5c.9 0 1.4-.7 1.9-1.5.6-.8.8-1.6.9-1.7-.1 0-1.7-.6-1.7-2.5 0-1.6 1.3-2.3 1.4-2.4-.8-1.1-1.9-1.2-2.3-1.2z"/>
                    <text x="10" y="9" font-family="system-ui" font-weight="600" font-size="7" fill="white">Pay</text>
                  </svg>
                </div>
                {/* Google Pay */}
                <div className="h-8 px-2.5 bg-white rounded-md flex items-center justify-center" title="Google Pay">
                  <span className="text-[9px] font-black tracking-tight">
                    <span style={{ color: "#4285F4" }}>G</span>
                    <span style={{ color: "#EA4335" }}>o</span>
                    <span style={{ color: "#FBBC04" }}>o</span>
                    <span style={{ color: "#4285F4" }}>g</span>
                    <span style={{ color: "#34A853" }}>l</span>
                    <span style={{ color: "#EA4335" }}>e</span>
                    <span className="text-gray-700 ml-0.5">Pay</span>
                  </span>
                </div>
                {/* Stripe */}
                <div className="h-8 px-2.5 bg-[#635BFF] rounded-md flex items-center justify-center" title="Stripe">
                  <span className="text-white font-black text-[10px] tracking-tight italic">stripe</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Secure SSL encrypted checkout</span>
            </div>
          </div>

          {/* Copyright + legal links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} SoleVault. {t("copyright")}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/privacy#cookies" className="hover:text-white transition">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
