import {
  ALLOWED_MIME_TYPES,
  getAllowedFileTypesMessage,
  isAllowedMimeType,
} from './media-api.allowed-types'

describe('media-api.allowed-types', () => {
  describe('ALLOWED_MIME_TYPES', () => {
    it('should be defined and non-empty', () => {
      expect(ALLOWED_MIME_TYPES).toBeDefined()
      expect(ALLOWED_MIME_TYPES.length).toBeGreaterThan(0)
    })

    it('should include expected image and document types', () => {
      expect(ALLOWED_MIME_TYPES).toContain('image/gif')
      expect(ALLOWED_MIME_TYPES).toContain('image/jpeg')
      expect(ALLOWED_MIME_TYPES).toContain('image/png')
      expect(ALLOWED_MIME_TYPES).toContain('image/svg+xml')
      expect(ALLOWED_MIME_TYPES).toContain('image/webp')
      expect(ALLOWED_MIME_TYPES).toContain('application/pdf')
    })
  })

  describe('isAllowedMimeType', () => {
    it('should return true for allowed MIME types', () => {
      expect(isAllowedMimeType('image/gif')).toBe(true)
      expect(isAllowedMimeType('image/jpeg')).toBe(true)
      expect(isAllowedMimeType('image/png')).toBe(true)
      expect(isAllowedMimeType('image/svg+xml')).toBe(true)
      expect(isAllowedMimeType('image/webp')).toBe(true)
      expect(isAllowedMimeType('application/pdf')).toBe(true)
    })

    it('should return false for disallowed MIME types', () => {
      expect(isAllowedMimeType('application/javascript')).toBe(false)
      expect(isAllowedMimeType('text/html')).toBe(false)
      expect(isAllowedMimeType('application/x-executable')).toBe(false)
      expect(isAllowedMimeType('video/mp4')).toBe(false)
      expect(isAllowedMimeType('audio/mpeg')).toBe(false)
    })

    it('should return false for null', () => {
      expect(isAllowedMimeType(null)).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isAllowedMimeType('')).toBe(false)
    })
  })

  describe('getAllowedFileTypesMessage', () => {
    it('should return a non-empty string', () => {
      const message = getAllowedFileTypesMessage()
      expect(message).toBeDefined()
      expect(typeof message).toBe('string')
      expect(message.length).toBeGreaterThan(0)
    })

    it('should include human-readable type names for known types', () => {
      const message = getAllowedFileTypesMessage()
      expect(message).toContain('PDF')
      expect(message).toContain('GIF')
      expect(message).toContain('JPEG')
      expect(message).toContain('PNG')
      expect(message).toContain('SVG')
      expect(message).toContain('WebP')
    })

    it('should return consistent output across calls', () => {
      const first = getAllowedFileTypesMessage()
      const second = getAllowedFileTypesMessage()
      expect(first).toBe(second)
    })
  })
})
