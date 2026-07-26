"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useLocale } from "next-intl";

interface CountdownProps {
  endDate: Date | string;
  variant?: "compact" | "banner" | "large" | "inline";
  className?: string;
}

function getTimeLeft(target: number) {
  const diff = target - Date.now();
  if (diff <= 0) return { total: 0, days: 0, hours: 0, mins: 0, secs: 0 };
  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    mins: Math.floor((diff / (1000 * 60)) % 60),
    secs: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown({ endDate, variant = "banner", className = "" }: CountdownProps) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const target = typeof endDate === "string" ? new Date(endDate).getTime() : endDate.getTime();
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(() => getTimeLeft(target));

  useEffect(() => {
    setMounted(true);
    setTime(getTimeLeft(target));
    const interval = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (!mounted || time.total <= 0) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  // BANNER - slim strip at bottom of image (default for cards)
  if (variant === "banner") {
    return (
      <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold shadow-lg backdrop-blur-sm ${className}`}
           style={{ background: "linear-gradient(90deg, rgba(202,63,46,0.95) 0%, rgba(139,42,30,0.95) 100%)" }}>
        <Clock className="w-3 h-3 animate-pulse" />
        <span className="tabular-nums tracking-wide">
          {isFr ? "Fin dans" : "Ends in"} {time.days > 0 ? `${time.days}j ` : ""}
          {pad(time.hours)}:{pad(time.mins)}:{pad(time.secs)}
        </span>
      </div>
    );
  }

  // COMPACT - pill badge (kept for backward compat)
  if (variant === "inline") {
    return (
      <>
        <Clock className="w-3.5 h-3.5 text-[#CA3F2E] animate-pulse" />
        <span className="tabular-nums tracking-wide">
          {isFr ? "Fin dans" : "Ends in"} {time.days > 0 ? `${time.days}${isFr ? "j" : "d"} ` : ""}
          {pad(time.hours)}:{pad(time.mins)}:{pad(time.secs)}
        </span>
      </>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md ${className}`}
           style={{ background: "linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%)" }}>
        <Clock className="w-3 h-3 animate-pulse" />
        <span className="tabular-nums">
          {time.days > 0 ? `${time.days}d ` : ""}
          {pad(time.hours)}:{pad(time.mins)}:{pad(time.secs)}
        </span>
      </div>
    );
  }

  // LARGE - unused now but kept
  const Unit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="min-w-[52px] px-3 py-2 bg-gray-900 text-white rounded-lg font-black text-xl sm:text-2xl tabular-nums shadow-md">
        {pad(value)}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1.5">{label}</div>
    </div>
  );

  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 border-2 border-[#CA3F2E]/20 bg-gradient-to-br from-[#CA3F2E]/5 via-white to-orange-50 ${className}`}>
      <div className="flex items-center gap-2 sm:gap-3 justify-center">
        {time.days > 0 && (<><Unit value={time.days} label={isFr ? "Jours" : "Days"} /><div className="text-2xl font-black text-gray-300">:</div></>)}
        <Unit value={time.hours} label={isFr ? "Heures" : "Hours"} />
        <div className="text-2xl font-black text-gray-300">:</div>
        <Unit value={time.mins} label={isFr ? "Min" : "Mins"} />
        <div className="text-2xl font-black text-gray-300">:</div>
        <Unit value={time.secs} label={isFr ? "Sec" : "Secs"} />
      </div>
    </div>
  );
}
