import { DISPOSABLE_EMAIL_DOMAINS } from './disposable-email-providers'

describe('disposable-email-providers', () => {
  describe('DISPOSABLE_EMAIL_DOMAINS', () => {
    it('should be defined', () => {
      expect(DISPOSABLE_EMAIL_DOMAINS).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof DISPOSABLE_EMAIL_DOMAINS).toBe('object')
      expect(DISPOSABLE_EMAIL_DOMAINS).not.toBeNull()
      expect(Array.isArray(DISPOSABLE_EMAIL_DOMAINS)).toBe(false)
    })

    it('should have domain keys with boolean true values', () => {
      const entries = Object.entries(DISPOSABLE_EMAIL_DOMAINS)
      expect(entries.length).toBeGreaterThan(0)
      for (const [domain, value] of entries.slice(0, 5)) {
        expect(typeof domain).toBe('string')
        expect(domain.length).toBeGreaterThan(0)
        expect(value).toBe(true)
      }
    })

    it('should include known disposable domain used in email validation', () => {
      expect(DISPOSABLE_EMAIL_DOMAINS['027168.com']).toBe(true)
    })
  })
})
