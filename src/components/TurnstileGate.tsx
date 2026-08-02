"use client";

import { useState, useEffect, ReactNode } from "react";
import Turnstile from "@/components/Turnstile";
import { Shield, CheckCircle, Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  action?: string;
  isFr?: boolean;
  /**
   * Optional: expose the verified token to children.
   * Children can call `onToken` prop (via cloneElement pattern) OR just call the render prop.
   */
  onVerify?: (token: string) => void;
}

/**
 * Wraps children behind a Turnstile challenge.
 * User sees a full-screen verification card first.
 * Once verified, children render normally.
 * The verified token is passed to onVerify callback (parent can send it to auth API).
 */
export default function TurnstileGate({ children, action = "page-access", isFr = false, onVerify }: Props) {
  const [verified, setVerified] = useState(false);
  const [errored, setErrored] = useState(false);
  const [ttl, setTtl] = useState(0); // countdown while pending

  useEffect(() => {
    if (verified || errored) return;
    // Update tick every second for the "still checking..." indicator
    const id = setInterval(() => setTtl(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [verified, errored]);

  const handleVerify = (token: string) => {
    setVerified(true);
    setErrored(false);
    if (onVerify) onVerify(token);
  };

  const handleError = () => {
    setErrored(true);
    setVerified(false);
  };

  if (verified) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
          <div className={"w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-500 " +
            (errored ? "bg-red-500" : "bg-gray-900")}>
            {errored
              ? <Shield className="w-8 h-8 text-white" />
              : <Shield className="w-8 h-8 text-white animate-pulse" />
            }
          </div>

          <h1 className="text-xl font-black text-gray-900 mb-1">
            {errored
              ? (isFr ? "Verification echouee" : "Verification failed")
              : (isFr ? "Verification de securite" : "Security check")}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {errored
              ? (isFr ? "Rechargez la page pour reessayer." : "Please refresh the page to try again.")
              : (isFr ? "Verification que vous etes humain..." : "Verifying you are human...")}
          </p>

          {/* The actual Turnstile widget - kept visible so managed mode can show challenge if needed */}
          <div className="flex justify-center min-h-[65px]">
            <Turnstile
              mode="auto"
              action={action}
              onVerify={handleVerify}
              onError={handleError}
              onExpire={handleError}
            />
          </div>

          {!errored && (
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              {ttl < 5
                ? (isFr ? "Chargement..." : "Loading...")
                : ttl < 15
                  ? (isFr ? "Verification en cours..." : "Verifying...")
                  : (isFr ? "Prend plus de temps que prevu..." : "Taking longer than expected...")}
            </div>
          )}

          {errored && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition"
            >
              {isFr ? "Rafraichir" : "Refresh"}
            </button>
          )}
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-3">
          {isFr ? "Protege par Cloudflare Turnstile" : "Protected by Cloudflare Turnstile"}
        </p>
      </div>
    </div>
  );
}
