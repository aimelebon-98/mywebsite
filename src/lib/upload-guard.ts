const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif"
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateUploadFile(file: File): { valid: boolean; error?: string } {
  if (!file) return { valid: false, error: "No file provided" };

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "File size exceeds 5MB limit" };
  }

  const mime = file.type?.toLowerCase().trim();
  if (!mime || !ALLOWED_MIME_TYPES.includes(mime)) {
    return { valid: false, error: "Invalid file type. Only JPG, PNG, WEBP, AVIF, and GIF images are allowed." };
  }

  return { valid: true };
}