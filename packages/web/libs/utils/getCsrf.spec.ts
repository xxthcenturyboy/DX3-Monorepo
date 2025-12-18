import { getCsrfToken } from './getCsrf'

describe('getCsrfToken', () => {
  beforeEach(() => {
    // Clear any existing meta tags
    const existingMeta = document.querySelector('meta[name="csrf-token"]')
    if (existingMeta) {
      existingMeta.remove()
    }
  })

  afterEach(() => {
    // Cleanup
    const metaTags = document.querySelectorAll('meta[name="csrf-token"]')
    metaTags.forEach((tag) => tag.remove())
  })

  it('should return the CSRF token from meta tag', () => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'csrf-token')
    meta.setAttribute('content', 'test-csrf-token-123')
    document.head.appendChild(meta)

    const token = getCsrfToken()

    expect(token).toBe('test-csrf-token-123')
  })

  it('should return empty string when meta tag does not exist', () => {
    const token = getCsrfToken()

    expect(token).toBe('')
  })

  it('should return empty string when meta tag exists but has no content attribute', () => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'csrf-token')
    document.head.appendChild(meta)

    const token = getCsrfToken()

    expect(token).toBe('')
  })

  it('should return empty string when content attribute is empty', () => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'csrf-token')
    meta.setAttribute('content', '')
    document.head.appendChild(meta)

    const token = getCsrfToken()

    expect(token).toBe('')
  })

  it('should handle tokens with special characters', () => {
    const specialToken = 'abc-123_XYZ.token$special'
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'csrf-token')
    meta.setAttribute('content', specialToken)
    document.head.appendChild(meta)

    const token = getCsrfToken()

    expect(token).toBe(specialToken)
  })

  it('should handle long token values', () => {
    const longToken = 'a'.repeat(500)
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'csrf-token')
    meta.setAttribute('content', longToken)
    document.head.appendChild(meta)

    const token = getCsrfToken()

    expect(token).toBe(longToken)
  })

  it('should use the first meta tag if multiple exist', () => {
    const meta1 = document.createElement('meta')
    meta1.setAttribute('name', 'csrf-token')
    meta1.setAttribute('content', 'first-token')
    document.head.appendChild(meta1)

    const meta2 = document.createElement('meta')
    meta2.setAttribute('name', 'csrf-token')
    meta2.setAttribute('content', 'second-token')
    document.head.appendChild(meta2)

    const token = getCsrfToken()

    expect(token).toBe('first-token')
  })

  it('should handle tokens with whitespace', () => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'csrf-token')
    meta.setAttribute('content', '  token-with-spaces  ')
    document.head.appendChild(meta)

    const token = getCsrfToken()

    expect(token).toBe('  token-with-spaces  ')
  })
})
