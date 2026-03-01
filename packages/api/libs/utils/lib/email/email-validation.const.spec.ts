import { INVALID_EMAIL_NAMES } from './email-validation.const'

describe('email-validation.const', () => {
  describe('INVALID_EMAIL_NAMES', () => {
    it('should be defined', () => {
      expect(INVALID_EMAIL_NAMES).toBeDefined()
    })

    it('should be a non-empty array', () => {
      expect(Array.isArray(INVALID_EMAIL_NAMES)).toBe(true)
      expect(INVALID_EMAIL_NAMES.length).toBeGreaterThan(0)
    })

    it('should contain only strings', () => {
      for (const name of INVALID_EMAIL_NAMES) {
        expect(typeof name).toBe('string')
      }
    })

    it('should include common restricted names', () => {
      expect(INVALID_EMAIL_NAMES).toContain('admin')
      expect(INVALID_EMAIL_NAMES).toContain('support')
      expect(INVALID_EMAIL_NAMES).toContain('noreply')
      expect(INVALID_EMAIL_NAMES).toContain('info')
    })
  })
})
