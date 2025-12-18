import { EventEmitter } from 'events'

import { ApiLoggingClass } from '../logger'
import { clearMockStore } from './__mocks__/ioredis'
import { REDIS_HEALTHZ_DATA, REDIS_HEALTHZ_KEY } from './redis.consts'
import { RedisService, type RedisServiceType } from './redis.service'

// Increase max listeners slightly for Redis service tests (4 instances × ~3 listeners each)
EventEmitter.defaultMaxListeners = 15

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('RedisService', () => {
  let redisService: RedisServiceType
  let localRedisService: RedisServiceType
  let consoleLogSpy: jest.SpyInstance

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'TEST' })
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

    redisService = new RedisService({
      isLocal: false,
      redis: {
        port: 6379,
        prefix: 'test:',
        url: 'redis://redis',
      },
    })

    localRedisService = new RedisService({
      isLocal: true,
      redis: {
        port: 6379,
        prefix: 'local:',
        url: 'redis://localhost',
      },
    })
  })

  afterEach(() => {
    // Clear mock store between tests for isolation
    clearMockStore()
  })

  afterAll(async () => {
    jest.clearAllMocks()
    consoleLogSpy.mockRestore()

    // Close Redis connections to prevent hanging
    try {
      if (redisService?.cacheHandle) {
        await redisService.cacheHandle.quit()
      }
    } catch (_error) {
      // Ignore quit errors from mocked ioredis
    }

    try {
      if (localRedisService?.cacheHandle) {
        await localRedisService.cacheHandle.quit()
      }
    } catch (_error) {
      // Ignore quit errors from mocked ioredis
    }
  })

  describe('Class Definition', () => {
    it('should exist when imported', () => {
      expect(RedisService).toBeDefined()
    })

    it('should be a constructor function', () => {
      expect(typeof RedisService).toBe('function')
      expect(RedisService.name).toBe('RedisService')
    })

    it('should have values when instantiated but prior to initializaiton', () => {
      expect(redisService).toBeDefined()
      expect(RedisService.instance).toBeDefined()
      expect(redisService.logger).toBeDefined()
      expect(redisService.setCacheItem).toBeDefined()
      expect(redisService.setCacheItemWithExpiration).toBeDefined()
      expect(redisService.getCacheItem).toBeDefined()
      expect(redisService.deleteCacheItem).toBeDefined()
      expect(redisService.getKeys).toBeDefined()
    })

    it('should set singleton instance', () => {
      expect(RedisService.instance).toBe(localRedisService)
    })
  })

  describe('Constructor', () => {
    it('should create instance with mocked Redis', () => {
      expect(redisService.cacheHandle).toBeDefined()
    })

    it('should create instance for local Redis', () => {
      expect(localRedisService.config.prefix).toBe('local:')
      expect(localRedisService.cacheHandle).toBeDefined()
    })

    it('should log cluster connection attempt for non-local', async () => {
      const clusterService = new RedisService({
        isLocal: false,
        redis: {
          port: 6379,
          prefix: 'cluster:',
          url: 'redis://node1|redis://node2',
        },
      })
      expect(consoleLogSpy).toHaveBeenCalled()

      // Clean up to prevent memory leak warning
      try {
        if (clusterService?.cacheHandle) {
          await clusterService.cacheHandle.quit()
        }
      } catch (_error) {
        // Ignore quit errors from mocked ioredis
      }
    })
  })

  describe('setCacheItem', () => {
    test('should set an item to cache when invoked', async () => {
      const result = await redisService.setCacheItem(
        REDIS_HEALTHZ_KEY,
        JSON.stringify(REDIS_HEALTHZ_DATA),
      )
      expect(result).toBeTruthy()
    })

    test('should return false when both key and data are missing', async () => {
      // Code uses && so both must be missing
      const result = await redisService.setCacheItem('', '')
      expect(result).toBe(false)
    })

    test('should succeed when only key has value', async () => {
      // Code uses && so if either has value, it continues
      const result = await redisService.setCacheItem('key-only', '')
      expect(result).toBeTruthy()
    })

    test('should succeed when only data has value', async () => {
      // Code uses && so if either has value, it continues
      const result = await redisService.setCacheItem('', 'data-only')
      expect(result).toBeTruthy()
    })
  })

  describe('setCacheItemWithExpiration', () => {
    test('should set an item with expiration to cache when invoked', async () => {
      const result = await redisService.setCacheItemWithExpiration(
        REDIS_HEALTHZ_KEY,
        JSON.stringify(REDIS_HEALTHZ_DATA),
        {
          time: Date.now() + 20,
          token: 'EXAT',
        },
      )
      expect(result).toBeTruthy()
    })

    test('should work with EX token', async () => {
      const result = await redisService.setCacheItemWithExpiration('test-ex', 'data', {
        time: 60,
        token: 'EX',
      })
      expect(result).toBeTruthy()
    })

    test('should work with PX token', async () => {
      const result = await redisService.setCacheItemWithExpiration('test-px', 'data', {
        time: 60000,
        token: 'PX',
      })
      expect(result).toBeTruthy()
    })

    test('should return false when both key and data are missing', async () => {
      // Code uses && so both must be missing
      const result = await redisService.setCacheItemWithExpiration('', '', {
        time: 60,
        token: 'EX',
      })
      expect(result).toBe(false)
    })
  })

  describe('getCacheItem', () => {
    test('should get an item from cache when invoked', async () => {
      await redisService.setCacheItem(REDIS_HEALTHZ_KEY, JSON.stringify(REDIS_HEALTHZ_DATA))
      const result = await redisService.getCacheItem(REDIS_HEALTHZ_KEY)
      expect(result).toBeDefined()
      expect(result).toEqual(REDIS_HEALTHZ_DATA)
    })

    test('should return null when key is missing', async () => {
      const result = await redisService.getCacheItem('')
      expect(result).toBeNull()
    })

    test('should return null when item does not exist', async () => {
      const result = await redisService.getCacheItem('non-existent-key')
      expect(result).toBeNull()
    })
  })

  describe('getCacheItemSimple', () => {
    test('should get an item as string from cache', async () => {
      await redisService.setCacheItem('simple-key', 'simple-value')
      const result = await redisService.getCacheItemSimple('simple-key')
      expect(result).toBeDefined()
    })

    test('should return null when key is missing', async () => {
      const result = await redisService.getCacheItemSimple('')
      expect(result).toBeNull()
    })
  })

  describe('getAllNamespace', () => {
    test('should get all items from a namespace', async () => {
      await redisService.setCacheItem('ns:item1', JSON.stringify({ id: 1 }))
      await redisService.setCacheItem('ns:item2', JSON.stringify({ id: 2 }))
      const result = await redisService.getAllNamespace('ns:')
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    test('should return null when namespace is missing', async () => {
      const result = await redisService.getAllNamespace('')
      expect(result).toBeNull()
    })

    test('should return empty array when no keys match namespace', async () => {
      const result = await redisService.getAllNamespace('nonexistent-namespace:')
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('deleteCacheItem', () => {
    test('should delete item from cache when invoked', async () => {
      await redisService.setCacheItem('delete-test-key', JSON.stringify(REDIS_HEALTHZ_DATA))
      const keysBefore = await redisService.getKeys('delete-test-key')
      expect(keysBefore.length).toBeGreaterThan(0)

      const result = await redisService.deleteCacheItem('delete-test-key')
      const keysAfter = await redisService.getKeys('delete-test-key')

      expect(result).toBeDefined()
      expect(keysAfter.length).toBe(0)
    })

    test('should return false when key is missing', async () => {
      const result = await redisService.deleteCacheItem('')
      expect(result).toBe(false)
    })

    test('should handle deleting non-existent key', async () => {
      const result = await redisService.deleteCacheItem('non-existent-key-to-delete')
      expect(result).toBeDefined()
    })
  })

  describe('getKeys', () => {
    test('should get all keys from cache when invoked', async () => {
      await redisService.setCacheItem('unique-getkeys-test', JSON.stringify(REDIS_HEALTHZ_DATA))
      const result = await redisService.getKeys('unique-getkeys-test')
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
      // Key includes prefix from config (test::)
      expect(result.some((key) => key.includes('unique-getkeys-test'))).toBe(true)
    })

    test('should get keys with namespace filter', async () => {
      await redisService.setCacheItem('test:key1', 'value1')
      await redisService.setCacheItem('test:key2', 'value2')
      const result = await redisService.getKeys('test:')
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThanOrEqual(2)
    })

    test('should return all keys when no namespace provided', async () => {
      const result = await redisService.getKeys()
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Type Export', () => {
    it('should export RedisServiceType', () => {
      const serviceType: RedisServiceType = redisService
      expect(serviceType).toBeDefined()
    })
  })

  describe('Configuration', () => {
    it('should store config', () => {
      expect(redisService.config).toBeDefined()
      expect(redisService.config.prefix).toBe('test:')
      expect(redisService.config.port).toBe(6379)
    })

    it('should handle cluster URLs', async () => {
      const clusterService = new RedisService({
        isLocal: false,
        redis: {
          port: 6379,
          prefix: 'cluster',
          url: 'node1.redis.com|node2.redis.com|node3.redis.com',
        },
      })
      expect(clusterService).toBeDefined()

      // Close the connection immediately
      try {
        if (clusterService?.cacheHandle) {
          await clusterService.cacheHandle.quit()
        }
      } catch (_error) {
        // Ignore quit errors from mocked ioredis
      }
    })
  })
})
