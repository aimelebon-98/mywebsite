"use client";

import { useState, useEffect, ReactNode } from "react";
import Turnstile from "@/components/Turnstile";

interface Props {
  children: ReactNode;
  action?: string;
  isFr?: boolean;
  locale?: string;
  onVerify?: (token: string) => void;
}

export default function TurnstileGate({ children, onVerify }: Props) {
  useEffect(() => {
    // If NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured, auto-bypass so form is never blocked
    if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      if (onVerify) onVerify("bypass-no-key");
    }
  }, [onVerify]);

  return <>{children}</>;
}