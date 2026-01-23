import { ABOUT_CONTENT } from './about-web-content.consts'

describe('ABOUT_CONTENT', () => {
  describe('About sections', () => {
    it('should have unique IDs', () => {
      const ids = ABOUT_CONTENT.sections.map((section) => section.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have valid title and content keys', () => {
      for (const section of ABOUT_CONTENT.sections) {
        expect(section.titleKey).toBeTruthy()
        expect(section.contentKey).toBeTruthy()
        expect(typeof section.titleKey).toBe('string')
        expect(typeof section.contentKey).toBe('string')
      }
    })

    it('should have at least one About section', () => {
      expect(ABOUT_CONTENT.sections.length).toBeGreaterThan(0)
    })
  })
})
