import { MIME_TYPES } from '@dx3/models-shared'
/**
 * Allowed MIME types for file uploads.
 * Add or remove types based on application requirements.
 *
 * Security Note: Always validate MIME types on upload to prevent
 * malicious file uploads (executables, scripts, etc.)
 */
export const ALLOWED_MIME_TYPES = [
  // Images
  ...Object.values(MIME_TYPES.IMAGE),
  // Documents
  ...Object.values(MIME_TYPES.FILE),
] as const

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]

/**
 * Validates if a MIME type is allowed for upload.
 * @param mimeType - The MIME type to validate
 * @returns true if the MIME type is in the allowed list
 */
export function isAllowedMimeType(mimeType: string | null): mimeType is AllowedMimeType {
  if (!mimeType) return false
  return ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType)
}

/**
 * Gets a human-readable list of allowed file types for error messages.
 */
export function getAllowedFileTypesMessage(): string {
  const typeMap: Record<string, string> = {
    'application/pdf': 'PDF',
    'image/gif': 'GIF',
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'image/svg+xml': 'SVG',
    'image/webp': 'WebP',
  }

  return ALLOWED_MIME_TYPES.map((type) => typeMap[type] || type).join(', ')
}
