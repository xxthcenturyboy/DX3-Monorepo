import { MEDIA_VARIANTS } from '@dx3/models-shared'

import { getPublicMediaUrl } from './media-web.util'

describe('getPublicMediaUrl', () => {
  it('should build URL with baseUrl and mediaId', () => {
    const url = getPublicMediaUrl('http://api.example.com', 'media-123', MEDIA_VARIANTS.MEDIUM)
    expect(url).toBe('http://api.example.com/api/media/pub/media-123/MEDIUM')
  })

  it('should use MEDIUM as default size when not specified', () => {
    const url = getPublicMediaUrl('http://api.example.com', 'media-123')
    expect(url).toContain('/MEDIUM')
  })

  it('should use THUMB size when specified', () => {
    const url = getPublicMediaUrl('http://api.example.com', 'media-123', MEDIA_VARIANTS.THUMB)
    expect(url).toContain('/THUMB')
  })

  it('should use ORIGINAL size when specified', () => {
    const url = getPublicMediaUrl('http://api.example.com', 'media-123', MEDIA_VARIANTS.ORIGINAL)
    expect(url).toContain('/ORIGINAL')
  })

  it('should use window.location.origin when baseUrl is empty (browser env)', () => {
    // jsdom provides window.location.origin
    const url = getPublicMediaUrl('', 'media-abc', MEDIA_VARIANTS.MEDIUM)
    expect(url).toContain('/api/media/pub/media-abc/MEDIUM')
  })

  it('should include mediaId in the URL path', () => {
    const url = getPublicMediaUrl('http://api.example.com', 'unique-id-999', MEDIA_VARIANTS.MEDIUM)
    expect(url).toContain('unique-id-999')
  })
})
