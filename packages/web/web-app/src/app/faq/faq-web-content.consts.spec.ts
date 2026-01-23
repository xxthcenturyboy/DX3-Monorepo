import { FAQ_CONTENT } from './faq-web-content.consts'

describe('FAQ_CONTENT', () => {
  describe('Public FAQ items', () => {
    it('should have unique IDs', () => {
      const ids = FAQ_CONTENT.public.map((item) => item.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have valid question and answer keys', () => {
      for (const item of FAQ_CONTENT.public) {
        expect(item.questionKey).toBeTruthy()
        expect(item.answerKey).toBeTruthy()
        expect(typeof item.questionKey).toBe('string')
        expect(typeof item.answerKey).toBe('string')
      }
    })

    it('should have at least one public FAQ item', () => {
      expect(FAQ_CONTENT.public.length).toBeGreaterThan(0)
    })
  })

  describe('Authenticated FAQ items', () => {
    it('should have unique IDs', () => {
      const ids = FAQ_CONTENT.authenticated.map((item) => item.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have valid question and answer keys', () => {
      for (const item of FAQ_CONTENT.authenticated) {
        expect(item.questionKey).toBeTruthy()
        expect(item.answerKey).toBeTruthy()
        expect(typeof item.questionKey).toBe('string')
        expect(typeof item.answerKey).toBe('string')
      }
    })

    it('should have at least one authenticated FAQ item', () => {
      expect(FAQ_CONTENT.authenticated.length).toBeGreaterThan(0)
    })
  })

  describe('Combined FAQs', () => {
    it('should have unique IDs across public and authenticated', () => {
      const allIds = [...FAQ_CONTENT.public, ...FAQ_CONTENT.authenticated].map((item) => item.id)
      const uniqueIds = new Set(allIds)
      expect(uniqueIds.size).toBe(allIds.length)
    })
  })
})
