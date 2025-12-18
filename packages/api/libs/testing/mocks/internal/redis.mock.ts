/**
 * Mock for RedisService from @dx3/api-libs/redis
 * Provides a stub Redis connection for unit tests
 */
import type { Redis } from 'ioredis'

import type { ApiLoggingClassType } from '../../../logger'
import type { RedisConstructorType, RedisExpireOptions } from '../../../redis/redis.types'

// Mock cacheHandle with all necessary Redis methods
const mockCacheHandle = {
  del: jest.fn().mockResolvedValue(1),
  disconnect: jest.fn().mockResolvedValue(undefined),
  // duplicate() is used by socket.io redis adapter for pub/sub clients
  duplicate: jest.fn().mockReturnThis(),
  get: jest.fn().mockResolvedValue(null),
  keys: jest.fn().mockResolvedValue([]),
  on: jest.fn().mockReturnThis(),
  once: jest.fn().mockReturnThis(),
  quit: jest.fn().mockResolvedValue('OK'),
  set: jest.fn().mockResolvedValue('OK'),
}

export class RedisService {
  cacheHandle: typeof Redis.Cluster.prototype | typeof Redis.prototype
  static #instance: RedisServiceType
  logger: ApiLoggingClassType | undefined

  constructor(_params: RedisConstructorType) {
    // Initialize cacheHandle with mock to prevent real Redis connections
    this.cacheHandle = mockCacheHandle as unknown as typeof Redis.prototype
    RedisService.#instance = this
  }

  public static get instance() {
    return RedisService.#instance
  }

  public async setCacheItem(key: string, data: string) {
    return new Promise((resolve) => {
      resolve(!!key && !!data)
    })
  }

  public async setCacheItemWithExpiration(
    key: string,
    data: string,
    expireOptions: RedisExpireOptions,
  ) {
    return new Promise((resolve) => {
      resolve(!!key && !!data && !!expireOptions)
    })
  }

  public async getCacheItem<TData>(key: string) {
    return new Promise((resolve) => {
      resolve(JSON.stringify({ data: key }) as TData)
    })
  }

  public async deleteCacheItem(key: string) {
    return new Promise((resolve) => {
      resolve(!!key)
    })
  }
}

type RedisServiceType = typeof RedisService.prototype

export class RedisHealthzService {
  public async healthCheck() {
    return new Promise((resolve) => {
      resolve(true)
    })
  }
}

/**
 * Export mock cache handle for direct manipulation in tests
 */
export const mockRedisCacheHandle = mockCacheHandle

/**
 * Setup function for RedisService mocking
 * Call this in test setup to initialize the mock
 */
export const mockRedisService = () => {
  // Reset mock implementations
  mockCacheHandle.del.mockResolvedValue(1)
  mockCacheHandle.get.mockResolvedValue(null)
  mockCacheHandle.keys.mockResolvedValue([])
  mockCacheHandle.set.mockResolvedValue('OK')
  mockCacheHandle.quit.mockResolvedValue('OK')
}

/**
 * Helper to reset all Redis mocks between tests
 */
export const resetRedisMocks = () => {
  Object.values(mockCacheHandle).forEach((mock) => {
    if (typeof mock.mockClear === 'function') {
      mock.mockClear()
    }
  })
}
