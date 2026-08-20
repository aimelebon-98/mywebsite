export interface UploadCheckResult {
  valid: boolean;
  error?: string;
  cleanedName?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif"
]);

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export function validateUploadFile(file: File | null | undefined): UploadCheckResult {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (file.size <= 0) {
    return { valid: false, error: "File is empty" };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "File exceeds 10MB maximum limit" };
  }

  // Validate MIME type
  const mimeType = (file.type || "").toLowerCase().trim();
  if (mimeType && !ALLOWED_MIME_TYPES.has(mimeType)) {
    return { valid: false, error: "Invalid image format. Allowed: JPG, PNG, WebP, AVIF" };
  }

  // Validate filename extension
  const rawName = file.name || "upload.jpg";
  const parts = rawName.split(".");
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase().trim() : "";

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: "Invalid file extension. Only image files allowed." };
  }

  // Sanitize filename to prevent directory traversal / command injection
  const baseName = parts.join(".").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 50) || "image";
  const cleanedName = `${baseName}.${ext}`;

  return {
    valid: true,
    cleanedName,
  };
}