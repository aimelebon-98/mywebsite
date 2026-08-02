"use client";

import { useState, useEffect, ReactNode } from "react";
import Turnstile from "@/components/Turnstile";
import { Shield, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  action?: string;
  isFr?: boolean;
  locale?: string;
  onVerify?: (token: string) => void;
}

export default function TurnstileGate({ children, action = "page-access", isFr = false, locale = "en", onVerify }: Props) {
  const [verified, setVerified] = useState(false);
  const [errored, setErrored] = useState(false);

  const handleVerify = (token: string) => {
    setVerified(true);
    setErrored(false);
    if (onVerify) onVerify(token);
    // Auto-advance after short delay so user sees the success state
  };

  const handleError = () => {
    setErrored(true);
    setVerified(false);
  };

  useEffect(() => {
    // Auto-reveal children 800ms after verify (like admin panel)
    if (verified) {
      const t = setTimeout(() => { /* children already shown - just a smooth UX */ }, 100);
      return () => clearTimeout(t);
    }
  }, [verified]);

  if (verified) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className={"w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-500 " +
            (errored ? "bg-red-500" : "bg-gray-900")}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            {errored
              ? (isFr ? "Verification echouee" : "Verification failed")
              : (isFr ? "Verification de securite" : "Security Verification")}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {errored
              ? (isFr ? "Rechargez pour reessayer." : "Please refresh to try again.")
              : (isFr ? "Verification que vous etes humain..." : "Verifying you are human...")}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-center">
            <Turnstile
              onVerify={handleVerify}
              onError={handleError}
              onExpire={handleError}
              theme="light"
            />
          </div>
          {errored && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition"
            >
              {isFr ? "Rafraichir" : "Refresh"}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          {isFr ? "Protege par Cloudflare Turnstile" : "Protected by Cloudflare Turnstile"}
        </p>
        <div className="text-center mt-4">
          <Link href={`/${locale}`} className="text-sm text-gray-500 hover:text-gray-900 transition">
            {isFr ? "Retour a la boutique" : "Back to Store"}
          </Link>
        </div>
      </div>
    </div>
  );
}
