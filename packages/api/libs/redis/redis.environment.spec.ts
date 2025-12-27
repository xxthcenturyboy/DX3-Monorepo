import fs from 'node:fs'

import { getRedisUrlForEnvironment } from './redis.environment'

// Store original env
const originalEnv = process.env

describe('redis.environment', () => {
  beforeEach(() => {
    // Reset env before each test
    process.env = { ...originalEnv }
    delete process.env.ROOT_DIR
    delete process.env.REDIS_URL
  })

  afterAll(() => {
    // Restore original env
    process.env = originalEnv
  })

  describe('getRedisUrlForEnvironment', () => {
    beforeEach(() => {
      // Default to host environment
      jest.spyOn(fs, 'accessSync').mockImplementation(() => {
        throw new Error('ENOENT')
      })
    })

    it('should throw if REDIS_URL is not set', () => {
      expect(() => getRedisUrlForEnvironment()).toThrow(
        'REDIS_URL environment variable is not set',
      )
    })

    it('should return URL as-is when running in container', () => {
      process.env.ROOT_DIR = '/app'
      process.env.REDIS_URL = 'redis://redis-dx3:6379'

      const url = getRedisUrlForEnvironment()

      expect(url).toBe('redis://redis-dx3:6379')
    })

    it('should swap hostname to localhost when on host', () => {
      process.env.REDIS_URL = 'redis://redis-dx3:6379'

      const url = getRedisUrlForEnvironment()

      expect(url).toBe('redis://localhost:6379/')
    })

    it('should handle redis URL without port', () => {
      process.env.REDIS_URL = 'redis://redis-dx3'

      const url = getRedisUrlForEnvironment()

      expect(url).toBe('redis://localhost/')
    })

    it('should preserve password and other components', () => {
      process.env.REDIS_URL = 'redis://:mypassword@redis-dx3:6379/0'

      const url = getRedisUrlForEnvironment()

      expect(url).toBe('redis://:mypassword@localhost:6379/0')
    })

    it('should use custom environment variable name', () => {
      process.env.CUSTOM_REDIS = 'redis://custom-redis:6379'

      const url = getRedisUrlForEnvironment({ envVar: 'CUSTOM_REDIS' })

      expect(url).toBe('redis://localhost:6379/')
    })

    it('should throw on invalid URL', () => {
      process.env.REDIS_URL = 'not-a-valid-url'

      expect(() => getRedisUrlForEnvironment()).toThrow('Failed to parse REDIS_URL')
    })
  })
})
