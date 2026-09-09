"use client";

import Turnstile from "@/components/Turnstile";

interface InlineTurnstileProps {
  onVerify: (token: string) => void;
  className?: string;
}

export default function InlineTurnstile({ onVerify, className = "my-4" }: InlineTurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;

  return (
    <div className={`flex justify-center items-center min-h-[65px] ${className}`}>
      <Turnstile
        onVerify={onVerify}
        theme="auto"
      />
    </div>
  );
}