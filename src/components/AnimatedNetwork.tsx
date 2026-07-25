"use client";

import { useEffect, useRef } from "react";

type Props = {
  className?: string;
  color?: string;
  dotColor?: string;
  density?: number;
  maxDistance?: number;
  influenceRadius?: number;
  attractStrength?: number;
  dotAlpha?: number;
  dotSizeMin?: number;
  dotSizeMax?: number;
  baseLineAlpha?: number;
  driftSpeed?: number;  // NEW: how fast dots drift like stars
  twinkle?: boolean;     // NEW: dots gently pulse in brightness
};

const MULTI_PALETTE = [
  "202, 63, 46",   // brand red
  "37, 99, 235",   // blue
  "22, 163, 74",   // green
  "30, 58, 138",   // navy
  "245, 158, 11",  // amber
  "147, 51, 234",  // purple
  "20, 184, 166",  // teal
  "236, 72, 153",  // pink
  "234, 88, 12",   // orange
  "6, 182, 212",   // cyan
];

export default function AnimatedNetwork({
  className = "",
  color = "17, 24, 39",
  dotColor,
  density = 70,
  maxDistance = 140,
  influenceRadius = 180,
  attractStrength = 0.6,
  dotAlpha = 0.85,
  dotSizeMin = 2,
  dotSizeMax = 3.5,
  baseLineAlpha = 0.15,
  driftSpeed = 0.25,
  twinkle = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMulti = dotColor === "multi";
    const singleColor = dotColor && !isMulti ? dotColor : color;

    type P = {
      x: number; y: number;
      vx: number; vy: number;      // current velocity (from drift + mouse push)
      dx: number; dy: number;      // baseline drift velocity (constant per particle)
      r: number;
      c: string;
      twinklePhase: number;         // random phase so twinkles are out of sync
      twinkleSpeed: number;
    };
    let particles: P[] = [];

    const pickColor = (): string => {
      if (isMulti) return MULTI_PALETTE[Math.floor(Math.random() * MULTI_PALETTE.length)];
      return singleColor;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = width * height;
      const count = Math.max(20, Math.min(density, Math.floor(area / 14000)));
      const range = Math.max(0.1, dotSizeMax - dotSizeMin);
      particles = Array.from({ length: count }, () => {
        // Random direction, gentle speed
        const angle = Math.random() * Math.PI * 2;
        const speed = driftSpeed * (0.5 + Math.random());
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0,
          vy: 0,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          r: Math.random() * range + dotSizeMin,
          c: pickColor(),
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.02 + Math.random() * 0.03,
        };
      });
    };

    const mouse = { x: -9999, y: -9999, active: false };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      if (mx >= 0 && mx <= width && my >= 0 && my <= height) {
        mouse.x = mx;
        mouse.y = my;
        mouse.active = true;
      } else {
        mouse.active = false;
        mouse.x = -9999;
        mouse.y = -9999;
      }
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Update + draw dots (starfield drift)
      for (const p of particles) {
        // Mouse attraction (temporary push)
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (mouse.active && dist < influenceRadius) {
          const force = (1 - dist / influenceRadius) * attractStrength;
          p.vx += (dx / (dist || 1)) * force;
          p.vy += (dy / (dist || 1)) * force;
        }

        // Damp the mouse-induced velocity gently
        p.vx *= 0.92;
        p.vy *= 0.92;

        // Apply baseline drift (constant) + mouse push (dampened)
        p.x += p.dx + p.vx;
        p.y += p.dy + p.vy;

        // Wrap around edges (starfield behavior)
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Twinkle: sinusoidal brightness modulation
        p.twinklePhase += p.twinkleSpeed;
        const twinkleFactor = twinkle ? (0.7 + 0.3 * Math.sin(p.twinklePhase)) : 1;
        const currentAlpha = dotAlpha * twinkleFactor;

        // Dot fill
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c}, ${currentAlpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // Glow ring
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${p.c}, ${currentAlpha * 0.35})`;
        ctx.lineWidth = 1;
        ctx.arc(p.x, p.y, p.r + 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw connecting lines (subtle by default, bright near mouse)
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= maxDistance) continue;

          let alpha = (1 - dist / maxDistance) * baseLineAlpha;

          if (mouse.active) {
            const mAx = a.x - mouse.x, mAy = a.y - mouse.y;
            const mBx = b.x - mouse.x, mBy = b.y - mouse.y;
            const dA = Math.sqrt(mAx * mAx + mAy * mAy);
            const dB = Math.sqrt(mBx * mBx + mBy * mBy);
            const near = Math.min(dA, dB);
            if (near < influenceRadius) {
              const boost = (1 - near / influenceRadius) * 0.7;
              alpha += (1 - dist / maxDistance) * boost;
            }
          }

          ctx.strokeStyle = `rgba(${color}, ${alpha})`;
          ctx.lineWidth = 0.85;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        if (mouse.active) {
          const dxm = a.x - mouse.x;
          const dym = a.y - mouse.y;
          const dm = Math.sqrt(dxm * dxm + dym * dym);
          if (dm < influenceRadius) {
            const alpha = (1 - dm / influenceRadius) * 0.75;
            ctx.strokeStyle = `rgba(${color}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousemove", onMove);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousemove", onMove);
    };
  }, [color, dotColor, density, maxDistance, influenceRadius, attractStrength, dotAlpha, dotSizeMin, dotSizeMax, baseLineAlpha, driftSpeed, twinkle]);

  return (
    <canvas
      ref={canvasRef}
      className={`${className}`}
      aria-hidden="true"
    />
  );
}
