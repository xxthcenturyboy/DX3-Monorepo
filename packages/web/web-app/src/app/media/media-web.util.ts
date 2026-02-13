import { MEDIA_VARIANTS } from '@dx3/models-shared'

/**
 * Returns absolute URL for public media.
 * When baseUrl is empty (e.g. in dev), uses same-origin so /api proxy works.
 */
export const getPublicMediaUrl = (
  baseUrl: string,
  mediaId: string,
  size: (typeof MEDIA_VARIANTS)[keyof typeof MEDIA_VARIANTS] = MEDIA_VARIANTS.MEDIUM,
): string => {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/api/media/pub/${mediaId}/${size}`
}
