"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ShieldAlert, Clock, LogOut, RefreshCw } from "lucide-react";

interface Props {
  idleTimeoutMs?: number; // Inactivity time before warning (default: 29 mins)
  warningCountdownSec?: number; // Countdown duration in seconds (default: 60s)
  logoutApiUrl: string;
  redirectUrl: string;
  isFr?: boolean;
}

export default function IdleTimeoutGuard({
  idleTimeoutMs = 29 * 60 * 1000,
  warningCountdownSec = 60,
  logoutApiUrl,
  redirectUrl,
  isFr = false,
}: Props) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(warningCountdownSec);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const t = isFr ? {
    heading: "Session sur le point d'expirer",
    message: "Vous avez \u00e9t\u00e9 inactif. Pour la s\u00e9curit\u00e9 de votre compte, vous serez d\u00e9connect\u00e9 dans :",
    stayBtn: "Rester connect\u00e9",
    logoutBtn: "Se d\u00e9connecter",
    seconds: "secondes",
  } : {
    heading: "Session Expiring Soon",
    message: "You have been inactive for a while. For account security, you will be automatically logged out in:",
    stayBtn: "Stay Signed In",
    logoutBtn: "Log Out Now",
    seconds: "seconds",
  };

  const handleLogout = useCallback(async () => {
    try {
      await fetch(logoutApiUrl, { method: "POST" });
    } catch {}
    window.location.href = redirectUrl;
  }, [logoutApiUrl, redirectUrl]);

  const startCountdown = useCallback(() => {
    setShowWarning(true);
    setSecondsRemaining(warningCountdownSec);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [warningCountdownSec, handleLogout]);

  const resetIdleTimer = useCallback(() => {
    if (showWarning) return; // Don't auto-reset if warning modal is already open

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      startCountdown();
    }, idleTimeoutMs);
  }, [idleTimeoutMs, showWarning, startCountdown]);

  const handleStaySignedIn = () => {
    setShowWarning(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    resetIdleTimer();
  };

  useEffect(() => {
    const activityEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

    let throttled = false;
    const onUserActivity = () => {
      if (!throttled) {
        resetIdleTimer();
        throttled = true;
        setTimeout(() => { throttled = false; }, 2000);
      }
    };

    activityEvents.forEach((evt) => window.addEventListener(evt, onUserActivity, { passive: true }));
    resetIdleTimer();

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, onUserActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [resetIdleTimer]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center border border-gray-100">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 text-[#CA3F2E]" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.heading}</h3>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">{t.message}</p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 flex items-center justify-center gap-3">
          <Clock className="w-6 h-6 text-[#CA3F2E] animate-pulse" />
          <span className="text-3xl font-black text-gray-900 font-mono">
            {secondsRemaining}s
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleStaySignedIn}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-bold rounded-xl text-sm transition shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            {t.stayBtn}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition"
          >
            <LogOut className="w-4 h-4" />
            {t.logoutBtn}
          </button>
        </div>
      </div>
    </div>
  );
}