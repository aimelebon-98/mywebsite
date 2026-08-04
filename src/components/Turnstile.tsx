"use client";

import { useEffect, useRef, useState } from "react";

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
  /**
   * "auto" (default): runs immediately when mounted, no user interaction.
   * "interactive": shows managed widget (may include checkbox challenge).
   */
  mode?: "auto" | "interactive";
  /** Optional action label sent to Cloudflare analytics */
  action?: string;
  /**
   * Change this number to force the widget to re-execute (get a fresh token).
   * Useful right before form submission to avoid expired tokens.
   */
  resetKey?: number;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      execute: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export default function Turnstile({
  onVerify, onError, onExpire,
  theme = "auto", className = "",
  mode = "interactive", action,
  resetKey = 0,
}: TurnstileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.turnstile) {
      setScriptLoaded(true);
      return;
    }

    const existing = document.querySelector("script[src*=\"challenges.cloudflare.com/turnstile\"]");
    if (existing) {
      existing.addEventListener("load", () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
    script.async = true;
    script.defer = true;
    window.onloadTurnstileCallback = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !ref.current || !window.turnstile || !SITE_KEY) return;

    if (widgetId.current) {
      try { window.turnstile.remove(widgetId.current); } catch { /* ignore */ }
      widgetId.current = null;
    }

    const opts: Record<string, unknown> = {
      sitekey: SITE_KEY,
      theme,
      callback: (token: string) => onVerify(token),
      "error-callback": () => onError?.(),
      "expired-callback": () => { onExpire?.(); onVerify(""); },
    };

    if (mode === "auto") {
      opts.execution = "execute";
      opts.appearance = "interaction-only";
    } else {
      opts.appearance = "always";
    }

    if (action) opts.action = action;

    widgetId.current = window.turnstile.render(ref.current, opts);

    if (mode === "auto" && widgetId.current) {
      try { window.turnstile.execute(widgetId.current); } catch { /* ignore */ }
    }

    return () => {
      if (widgetId.current && window.turnstile) {
        try { window.turnstile.remove(widgetId.current); } catch { /* ignore */ }
      }
    };
  }, [scriptLoaded, theme, mode, action, onVerify, onError, onExpire]);

  // Re-execute when resetKey changes (get a fresh token before submit)
  useEffect(() => {
    if (resetKey === 0) return;
    if (!widgetId.current || !window.turnstile) return;
    try {
      window.turnstile.reset(widgetId.current);
      if (mode === "auto") {
        window.turnstile.execute(widgetId.current);
      }
    } catch { /* ignore */ }
  }, [resetKey, mode]);

  if (!SITE_KEY) {
    return (
      <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        Turnstile not configured (missing NEXT_PUBLIC_TURNSTILE_SITE_KEY)
      </div>
    );
  }

  return <div ref={ref} className={className} />;
}
