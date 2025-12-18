import { REDIS_DELIMITER, REDIS_HEALTHZ_DATA, REDIS_HEALTHZ_KEY } from './redis.consts'

describe('redis.consts', () => {
  describe('REDIS_DELIMITER', () => {
    it('should be defined when imported', () => {
      expect(REDIS_DELIMITER).toBeDefined()
    })

    it('should be a string', () => {
      expect(typeof REDIS_DELIMITER).toBe('string')
    })

    it('should have correct value', () => {
      expect(REDIS_DELIMITER).toBe(':')
    })

    it('should be a single character', () => {
      expect(REDIS_DELIMITER.length).toBe(1)
    })

    it('should be used as key separator', () => {
      const key = `prefix${REDIS_DELIMITER}key`
      expect(key).toBe('prefix:key')
    })
  })

  describe('REDIS_HEALTHZ_KEY', () => {
    it('should be defined when imported', () => {
      expect(REDIS_HEALTHZ_KEY).toBeDefined()
    })

    it('should be a string', () => {
      expect(typeof REDIS_HEALTHZ_KEY).toBe('string')
    })

    it('should have correct value', () => {
      expect(REDIS_HEALTHZ_KEY).toBe('test')
    })

    it('should not be empty', () => {
      expect(REDIS_HEALTHZ_KEY.length).toBeGreaterThan(0)
    })
  })

  describe('REDIS_HEALTHZ_DATA', () => {
    it('should be defined when imported', () => {
      expect(REDIS_HEALTHZ_DATA).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof REDIS_HEALTHZ_DATA).toBe('object')
    })

    it('should have test property', () => {
      expect(REDIS_HEALTHZ_DATA).toHaveProperty('test')
    })

    it('should have test property set to true', () => {
      expect(REDIS_HEALTHZ_DATA.test).toBe(true)
    })

    it('should be serializable to JSON', () => {
      const json = JSON.stringify(REDIS_HEALTHZ_DATA)
      expect(json).toBe('{"test":true}')
    })

    it('should be parseable from JSON', () => {
      const json = JSON.stringify(REDIS_HEALTHZ_DATA)
      const parsed = JSON.parse(json)
      expect(parsed).toEqual(REDIS_HEALTHZ_DATA)
    })
  })

  describe('Constant Integration', () => {
    it('should work together for Redis healthcheck', () => {
      const fullKey = `health${REDIS_DELIMITER}${REDIS_HEALTHZ_KEY}`
      const data = JSON.stringify(REDIS_HEALTHZ_DATA)

      expect(fullKey).toBe('health:test')
      expect(data).toBe('{"test":true}')
    })
  })
})
