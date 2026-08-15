"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLocale } from "next-intl";

export default function BackToTop() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(8); } catch { /* ignore */ }
    }
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label={isFr ? "Retour en haut" : "Back to top"}
      title={isFr ? "Retour en haut" : "Back to top"}
      className={`fixed z-40 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-2xl shadow-black/40 border border-white/10 active:scale-90 hover:bg-gray-800 transition-all duration-300 ${visible ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none translate-y-4"}`}
      style={{
        right: "1rem",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)",
      }}
    >
      <ArrowUp className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={2.5} />
    </button>
  );
}