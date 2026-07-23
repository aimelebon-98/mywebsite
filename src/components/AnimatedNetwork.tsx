"use client";

import { useEffect, useRef } from "react";

type Props = {
  className?: string;
  color?: string;
  density?: number;
  maxDistance?: number;
  influenceRadius?: number;
  attractStrength?: number;
};

export default function AnimatedNetwork({
  className = "",
  color = "17, 24, 39",
  density = 70,
  maxDistance = 140,
  influenceRadius = 180,
  attractStrength = 0.6,
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

    type P = { x: number; y: number; ox: number; oy: number; vx: number; vy: number; r: number };
    let particles: P[] = [];

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
      particles = Array.from({ length: count }, () => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        return { x, y, ox: x, oy: y, vx: 0, vy: 0, r: Math.random() * 1.6 + 0.9 };
      });
    };

    const mouse = { x: -9999, y: -9999, active: false };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        // Attraction to mouse when in range
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (mouse.active && dist < influenceRadius) {
          const force = (1 - dist / influenceRadius) * attractStrength;
          p.vx += (dx / (dist || 1)) * force;
          p.vy += (dy / (dist || 1)) * force;
        } else {
          // Gentle spring back to origin
          const rx = p.ox - p.x;
          const ry = p.oy - p.y;
          p.vx += rx * 0.008;
          p.vy += ry * 0.008;
        }

        // Damping
        p.vx *= 0.9;
        p.vy *= 0.9;

        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${color}, 0.55)`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lines between nearby particles (only bright near mouse)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDistance) {
            // Boost line alpha if either endpoint is near the mouse
            let boost = 0;
            if (mouse.active) {
              const mAx = a.x - mouse.x, mAy = a.y - mouse.y;
              const mBx = b.x - mouse.x, mBy = b.y - mouse.y;
              const dA = Math.sqrt(mAx * mAx + mAy * mAy);
              const dB = Math.sqrt(mBx * mBx + mBy * mBy);
              const near = Math.min(dA, dB);
              if (near < influenceRadius) {
                boost = (1 - near / influenceRadius) * 0.5;
              }
            }
            const alpha = (1 - dist / maxDistance) * (0.12 + boost);
            ctx.strokeStyle = `rgba(${color}, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        // Line from particle to mouse
        if (mouse.active) {
          const p = particles[i];
          const dxm = p.x - mouse.x;
          const dym = p.y - mouse.y;
          const dm = Math.sqrt(dxm * dxm + dym * dym);
          if (dm < influenceRadius) {
            const alpha = (1 - dm / influenceRadius) * 0.6;
            ctx.strokeStyle = `rgba(${color}, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
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
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [color, density, maxDistance, influenceRadius, attractStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
