import { BORDER_RADIUS, BOX_SHADOW } from './common'

describe('common constants', () => {
  describe('BORDER_RADIUS', () => {
    it('should be defined', () => {
      expect(BORDER_RADIUS).toBeDefined()
    })

    it('should be a string', () => {
      expect(typeof BORDER_RADIUS).toBe('string')
    })

    it('should have a valid CSS border-radius value', () => {
      expect(BORDER_RADIUS).toBe('6px')
    })

    it('should be a non-empty string', () => {
      expect(BORDER_RADIUS.length).toBeGreaterThan(0)
    })
  })

  describe('BOX_SHADOW', () => {
    it('should be defined', () => {
      expect(BOX_SHADOW).toBeDefined()
    })

    it('should be a string', () => {
      expect(typeof BOX_SHADOW).toBe('string')
    })

    it('should contain valid CSS box-shadow values', () => {
      expect(BOX_SHADOW).toContain('px')
      expect(BOX_SHADOW).toContain('rgb')
    })

    it('should contain multiple shadow definitions', () => {
      const shadowParts = BOX_SHADOW.split(',')
      expect(shadowParts.length).toBe(3)
    })

    it('should be a non-empty string', () => {
      expect(BOX_SHADOW.length).toBeGreaterThan(0)
    })
  })

  describe('Constants Stability', () => {
    it('should return the same value on multiple accesses', () => {
      const firstRadius = BORDER_RADIUS
      const secondRadius = BORDER_RADIUS
      expect(firstRadius).toBe(secondRadius)
    })

    it('should maintain consistent box shadow value', () => {
      const firstShadow = BOX_SHADOW
      const secondShadow = BOX_SHADOW
      expect(firstShadow).toBe(secondShadow)
    })
  })

  describe('CSS Validity', () => {
    it('BORDER_RADIUS should be usable in CSS', () => {
      expect(() => {
        const style = { borderRadius: BORDER_RADIUS }
        expect(style.borderRadius).toBe(BORDER_RADIUS)
      }).not.toThrow()
    })

    it('BOX_SHADOW should be usable in CSS', () => {
      expect(() => {
        const style = { boxShadow: BOX_SHADOW }
        expect(style.boxShadow).toBe(BOX_SHADOW)
      }).not.toThrow()
    })
  })
})
