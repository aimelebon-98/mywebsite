"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
}

export default function ProductImage({ src, alt, className = "" }: ProductImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <ShoppingBag className="w-10 h-10 text-gray-300" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 ${className}`}>
        <ShoppingBag className="w-8 h-8 text-gray-300 mb-1" />
        <span className="text-[10px] text-gray-400">Image unavailable</span>
      </div>
    );
  }

  return (
    <>
      {status === "loading" && (
        <div className={`absolute inset-0 bg-gray-100 animate-pulse ${className}`} />
      )}
      <img
        key={src}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        ref={(el) => {
          // Cached-image fix: if image already loaded before ref attaches, mark loaded manually
          if (el && el.complete && el.naturalWidth > 0 && status === "loading") {
            setStatus("loaded");
          }
        }}
        className={`${className} ${status === "loading" ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
      />
    </>
  );
}
