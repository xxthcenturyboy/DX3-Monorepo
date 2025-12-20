import { TEST_BAD_UUID, TEST_UUID, TEST_WEB_URL } from './test.consts'

describe('Test Constants (test.const.ts)', () => {
  describe('UUID Constants', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    it('should export TEST_UUID', () => {
      expect(TEST_UUID).toBeDefined()
      expect(typeof TEST_UUID).toBe('string')
    })

    it('should have TEST_UUID in valid UUID format', () => {
      expect(TEST_UUID).toMatch(uuidRegex)
      expect(TEST_UUID).toBe('9472bfb8-f7a9-4146-951e-15520f392baf')
    })

    it('should export TEST_BAD_UUID', () => {
      expect(TEST_BAD_UUID).toBeDefined()
      expect(typeof TEST_BAD_UUID).toBe('string')
    })

    it('should have TEST_BAD_UUID in valid UUID format', () => {
      expect(TEST_BAD_UUID).toMatch(uuidRegex)
      expect(TEST_BAD_UUID).toBe('9472bfb8-f7a9-4146-951e-15520f392baf')
    })

    it('should have TEST_UUID and TEST_BAD_UUID as same value (intentional for testing bad UUIDs)', () => {
      expect(TEST_UUID).toBe(TEST_BAD_UUID)
    })
  })

  describe('URL Constants', () => {
    it('should export TEST_WEB_URL', () => {
      expect(TEST_WEB_URL).toBeDefined()
      expect(typeof TEST_WEB_URL).toBe('string')
    })

    it('should have TEST_WEB_URL as valid localhost URL', () => {
      expect(TEST_WEB_URL).toBe('http://localhost:3000')
      expect(TEST_WEB_URL).toMatch(/^https?:\/\//)
    })
  })
})
