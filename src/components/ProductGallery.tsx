"use client";

import { useState, useEffect, useRef } from "react";
import { ShoppingBag, ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

interface Props {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: Props) {
  const validImages = images.filter(Boolean);
  const hasImages = validImages.length > 0;

  const [activeIdx, setActiveIdx] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [zoomOpen, setZoomOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  // Reset when images change
  useEffect(() => {
    setActiveIdx(0);
    setLoaded({});
  }, [productName]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (zoomOpen) {
        if (e.key === "Escape") setZoomOpen(false);
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen, activeIdx]);

  const next = () => setActiveIdx(i => (i + 1) % validImages.length);
  const prev = () => setActiveIdx(i => (i - 1 + validImages.length) % validImages.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  useEffect(() => {
    // Show zoom hint on first load for desktop
    if (hasImages && window.matchMedia("(hover: hover)").matches) {
      setShowHint(true);
      const t = setTimeout(() => setShowHint(false), 2500);
      return () => clearTimeout(t);
    }
  }, [hasImages]);

  if (!hasImages) {
    return (
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-100 flex items-center justify-center">
        <ShoppingBag className="w-24 h-24 text-gray-200" />
      </div>
    );
  }

  const currentImage = validImages[activeIdx];

  return (
    <>
      <div className="space-y-3">
        {/* MAIN IMAGE */}
        <div
          ref={mainRef}
          className="relative aspect-square rounded-3xl overflow-hidden bg-gray-100 group cursor-zoom-in"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setZoomOpen(true)}
        >
          <img
            src={currentImage}
            alt={`${productName} - image ${activeIdx + 1}`}
            className={`w-full h-full object-cover transition-transform duration-500 ${loaded[activeIdx] ? "opacity-100" : "opacity-0"}`}
            style={
              isHovering
                ? { transform: `scale(2)`, transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                : undefined
            }
            onLoad={() => setLoaded(l => ({ ...l, [activeIdx]: true }))}
            loading={activeIdx === 0 ? "eager" : "lazy"}
            decoding="async"
          />
          {!loaded[activeIdx] && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}

          {/* Zoom hint (fades out) */}
          {showHint && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-fade-in pointer-events-none">
              <ZoomIn className="w-3.5 h-3.5" />
              Hover to zoom, click to enlarge
            </div>
          )}

          {/* Nav arrows (only if 2+ images) */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
              >
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>

              {/* Dots (mobile-friendly) */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 md:hidden">
                {validImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setActiveIdx(i); }}
                    aria-label={`Go to image ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${i === activeIdx ? "w-6 bg-gray-900" : "w-1.5 bg-gray-400"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* THUMBNAILS */}
        {validImages.length > 1 && (
          <div className="hidden md:grid grid-cols-5 gap-2">
            {validImages.slice(0, 5).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                aria-label={`View image ${i + 1}`}
                className={`relative aspect-square rounded-xl overflow-hidden bg-gray-100 transition-all ${
                  i === activeIdx
                    ? "ring-2 ring-gray-900 ring-offset-2"
                    : "hover:opacity-80 opacity-60"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* LIGHTBOX / FULLSCREEN ZOOM */}
      {zoomOpen && (
        <div
          ref={zoomRef}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in"
          onClick={() => setZoomOpen(false)}
        >
          <button
            onClick={() => setZoomOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur text-white text-sm px-4 py-1.5 rounded-full">
            {activeIdx + 1} / {validImages.length}
          </div>

          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition z-10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition z-10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          <img
            src={currentImage}
            alt={`${productName} - full size`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />

          {/* Bottom strip of thumbnails */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto p-2">
              {validImages.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIdx(i); }}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all ${
                    i === activeIdx ? "ring-2 ring-white" : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
