"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  label?: string;
  compact?: boolean;
  maxWidth?: number;
}

async function resizeImage(file: File, maxWidth: number = 1600, quality: number = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w);
        w = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas ctx"));
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("blob failed"));
          const outName = file.name.replace(/\.[^.]+$/, "") + ".webp";
          resolve(new File([blob], outName, { type: "image/webp" }));
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => reject(new Error("image load failed"));
    img.src = URL.createObjectURL(file);
  });
}

export default function ImageUploader({ value, onChange, placeholder = "Paste image URL or upload...", label, compact = false, maxWidth = 1600 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const doUpload = useCallback(async (file: File) => {
    setError("");
    setUploading(true);
    setProgress(10);
    try {
      let toUpload: File = file;
      if (file.type.startsWith("image/") && file.type !== "image/gif") {
        try {
          toUpload = await resizeImage(file, maxWidth, 0.85);
        } catch {
          // fallback to original
        }
      }
      setProgress(40);
      const form = new FormData();
      form.append("file", toUpload);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      setProgress(80);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
      setProgress(100);
      setTimeout(() => setProgress(0), 400);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setProgress(0);
    }
    setUploading(false);
  }, [onChange, maxWidth]);

  return (
    <div className={compact ? "" : "space-y-2"}>
      {label && <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>}

      <div className="flex gap-2 items-start">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
          title="Upload from computer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) doUpload(f);
            e.target.value = "";
          }}
        />
      </div>

      {!compact && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) doUpload(f);
          }}
          className={`text-[11px] text-center py-2 rounded-lg border-2 border-dashed transition ${dragOver ? "border-gray-900 bg-gray-50 text-gray-900" : "border-gray-200 text-gray-400"}`}
        >
          {dragOver ? "Drop to upload" : "or drag & drop an image here"}
        </div>
      )}

      {uploading && (
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gray-900 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}