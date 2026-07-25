"use client";

import { useEffect, useState } from "react";
import { Clock, Flame } from "lucide-react";
import { useLocale } from "next-intl";

interface CountdownProps {
  endDate: Date | string;
  variant?: "compact" | "large";
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

export default function Countdown({ endDate, variant = "compact", className = "" }: CountdownProps) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const target = typeof endDate === "string" ? new Date(endDate).getTime() : endDate.getTime();
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(() => getTimeLeft(target));

  useEffect(() => {
    setMounted(true);
    setTime(getTimeLeft(target));
    const interval = setInterval(() => {
      setTime(getTimeLeft(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (!mounted) return null;
  if (time.total <= 0) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md ${className}`}
           style={{ background: "linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%)" }}>
        <Flame className="w-3 h-3 animate-pulse" />
        <span className="tabular-nums">
          {time.days > 0 ? `${time.days}d ` : ""}
          {pad(time.hours)}:{pad(time.mins)}:{pad(time.secs)}
        </span>
      </div>
    );
  }

  // Large variant for product detail page
  const Unit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="min-w-[52px] px-3 py-2 bg-gray-900 text-white rounded-lg font-black text-xl sm:text-2xl tabular-nums shadow-md">
        {pad(value)}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1.5">
        {label}
      </div>
    </div>
  );

  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 border-2 border-[#CA3F2E]/20 bg-gradient-to-br from-[#CA3F2E]/5 via-white to-orange-50 ${className}`}>
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#CA3F2E]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[#CA3F2E] flex items-center justify-center">
            <Flame className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-[#CA3F2E]">
              {isFr ? "Offre limitee" : "Limited Time Offer"}
            </div>
            <div className="text-[10px] text-gray-500 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {isFr ? "Se termine dans :" : "Ends in:"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
          {time.days > 0 && (
            <>
              <Unit value={time.days} label={isFr ? "Jours" : "Days"} />
              <div className="text-2xl font-black text-gray-300">:</div>
            </>
          )}
          <Unit value={time.hours} label={isFr ? "Heures" : "Hours"} />
          <div className="text-2xl font-black text-gray-300">:</div>
          <Unit value={time.mins} label={isFr ? "Min" : "Mins"} />
          <div className="text-2xl font-black text-gray-300">:</div>
          <Unit value={time.secs} label={isFr ? "Sec" : "Secs"} />
        </div>
      </div>
    </div>
  );
}
