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
              {["Instagram", "Twitter", "Facebook"].map((social) => (
                <span key={social} className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-xs hover:bg-white/20 transition cursor-pointer">
                  {social[0]}
                </span>
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
              <li><Link href="/faq" className="text-sm hover:text-white transition">{t("faq")}</Link></li>
              <li><Link href="/faq" className="text-sm hover:text-white transition">{t("shippingPolicy")}</Link></li>
              <li><Link href="/faq" className="text-sm hover:text-white transition">{t("returns")}</Link></li>
              <li><Link href="/faq" className="text-sm hover:text-white transition">{t("sizeGuide")}</Link></li>
              <li><span className="text-sm">{t("aboutUs")}</span></li>
              <li><span className="text-sm">{t("contact")}</span></li>
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

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} SoleVault. {t("copyright")}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
