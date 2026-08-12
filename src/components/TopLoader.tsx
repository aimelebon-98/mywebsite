"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function TopLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathRef = useRef(pathname);

  // Hide when new page finishes loading
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setVisible(false);
    }
  }, [pathname]);

  // Show on any internal link click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;
      const isInternal =
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !target.hasAttribute("download") &&
        target.target !== "_blank";
      if (!isInternal) return;
      const targetPath = href.split("?")[0].split("#")[0];
      const currentPath = window.location.pathname;
      if (targetPath === currentPath) return;

      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      // Safety net: hide after 3s if page never resolves
      timerRef.current = setTimeout(() => setVisible(false), 3000);
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
        zIndex: 99999,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative", width: 48, height: 48 }}>
        {/* Outer ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid rgba(139,42,30,0.15)",
          }}
        />
        {/* Spinning arc */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "#8B2A1E",
            borderRightColor: "#8B2A1E",
            animation: "ndz-spin 0.55s linear infinite",
          }}
        />
      </div>
    </div>
  );
}