"use client";

import { useState } from "react";

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
        <span className="text-5xl">👟</span>
      </div>
    );
  }

  return (
    <>
      {status === "loading" && (
        <div className={`absolute inset-0 bg-gray-100 animate-pulse ${className}`} />
      )}
      {status === "error" ? (
        <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
          <div className="text-center">
            <span className="text-4xl block mb-1">👟</span>
            <span className="text-[10px] text-gray-400">Image unavailable</span>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`${className} ${status === "loading" ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        />
      )}
    </>
  );
}
