"use client";

import { useEffect, useState } from "react";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const STORAGE_KEY = "solevault-countdown-end";
    const DURATION_DAYS = 3;

    // Get target end date. If none, or if it has already passed, create a new 3-day window.
    const getOrCreateTarget = (): Date => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedDate = new Date(stored);
        if (storedDate.getTime() > Date.now()) {
          return storedDate;
        }
      }
      // Create new target: DURATION_DAYS from now at 23:59:59
      const newEnd = new Date();
      newEnd.setDate(newEnd.getDate() + DURATION_DAYS);
      newEnd.setHours(23, 59, 59, 0);
      localStorage.setItem(STORAGE_KEY, newEnd.toISOString());
      return newEnd;
    };

    let target = getOrCreateTarget();

    const update = () => {
      const now = Date.now();
      const distance = target.getTime() - now;

      if (distance <= 0) {
        // Timer expired -> reset to a fresh 3-day countdown
        localStorage.removeItem(STORAGE_KEY);
        target = getOrCreateTarget();
        return; // next tick will render the new value
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {[
        { value: timeLeft.days, label: "Days" },
        { value: timeLeft.hours, label: "Hrs" },
        { value: timeLeft.minutes, label: "Min" },
        { value: timeLeft.seconds, label: "Sec" },
      ].map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-2 sm:gap-3">
          <div className="bg-white/20 backdrop-blur rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-center min-w-[52px]">
            <div className="text-xl sm:text-2xl font-bold text-white tabular-nums">
              {String(unit.value).padStart(2, "0")}
            </div>
            <div className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">{unit.label}</div>
          </div>
          {i < 3 && <span className="text-white/40 text-xl font-bold">:</span>}
        </div>
      ))}
    </div>
  );
}