"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setVisible(false);
    }
  }, [pathname]);

  useEffect(() => {
    // Listen for Next.js navigation start via link clicks
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Only internal links, not anchors or external
      const isInternal =
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !target.hasAttribute("download") &&
        target.target !== "_blank";

      if (!isInternal) return;

      // Don't show overlay if same page
      const targetPath = href.split("?")[0].split("#")[0];
      const currentPath = window.location.pathname;
      if (targetPath === currentPath) return;

      setVisible(true);

      // Auto-hide after 600ms as safety net
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 600);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(255,255,255,0.45)",
        zIndex: 99998,
        pointerEvents: "none",
        backdropFilter: "blur(1px)",
        WebkitBackdropFilter: "blur(1px)",
        animation: "ndz-fade-in 80ms ease forwards",
      }}
    />
  );
}