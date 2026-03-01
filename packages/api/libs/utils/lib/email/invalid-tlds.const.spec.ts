import { INVALID_TLDS, type InvalidTldType } from './invalid-tlds.const'

describe('invalid-tlds.const', () => {
  describe('INVALID_TLDS', () => {
    it('should be defined', () => {
      expect(INVALID_TLDS).toBeDefined()
    })

    it('should be a non-empty readonly array', () => {
      expect(Array.isArray(INVALID_TLDS)).toBe(true)
      expect(INVALID_TLDS.length).toBeGreaterThan(0)
    })

    it('should include RFC 6761 reserved TLDs', () => {
      expect(INVALID_TLDS).toContain('example')
      expect(INVALID_TLDS).toContain('invalid')
      expect(INVALID_TLDS).toContain('local')
      expect(INVALID_TLDS).toContain('localhost')
      expect(INVALID_TLDS).toContain('test')
    })

    it('should have lowercase values for case-insensitive matching', () => {
      for (const tld of INVALID_TLDS) {
        expect(tld).toBe(tld.toLowerCase())
      }
    })
  })

  describe('InvalidTldType', () => {
    it('should allow valid TLD values', () => {
      const tld: InvalidTldType = 'example'
      expect(tld).toBe('example')
    })
  })
})
