export function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return (email?.[0] ?? "U").toUpperCase();
}

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

export const AVATAR_MIME_BY_EXTENSION: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

export interface AvatarValidationResult {
  valid: boolean;
  error?: string;
  extension?: string;
}

export function validateAvatarFile(
  fileName: string,
  size: number,
  mimeType: string,
): AvatarValidationResult {
  if (size > MAX_AVATAR_SIZE_BYTES) {
    return { valid: false, error: "Image must be 5 MB or smaller" };
  }

  const extension = fileName.split(".").pop()?.toLowerCase();
  const expectedMime = extension ? AVATAR_MIME_BY_EXTENSION[extension] : undefined;

  if (!extension || !expectedMime) {
    return {
      valid: false,
      error: "Unsupported file type. Use PNG, JPG, GIF, WEBP, or SVG",
    };
  }

  if (mimeType !== expectedMime) {
    return { valid: false, error: "File content does not match its extension" };
  }

  return { valid: true, extension };
}
