import { randomUUID } from 'node:crypto'

import { getRedisConfig } from '../config/config-api'
import { ApiLoggingClass } from '../logger'
import { RedisService } from '../redis'
import type { UserPrivilegeSetModelType } from './user-privilege-api.postgres-model'
import {
  UserPrivilegeSetCache,
  type UserPrivilegeSetCacheType,
} from './user-privilege-api.redis-cache'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
// Note: We don't mock redis here because this test needs real RedisService
// behavior for testing cache operations. The ioredis module is mocked via
// __mocks__/ioredis.ts using ioredis-mock which provides full redis functionality.

describe('UserPrivilegeSetCache', () => {
  let cache: UserPrivilegeSetCacheType
  let redisService: RedisService
  // @ts-expect-error - ok for test
  const data0: UserPrivilegeSetModelType = {
    description: 'Sudo',
    id: randomUUID(),
    name: 'SUPER_ADMIN',
    order: 0,
  }
  // @ts-expect-error - ok for test
  const data1: UserPrivilegeSetModelType = {
    description: 'Add Users',
    id: randomUUID(),
    name: 'ADMIN',
    order: 1,
  }
  // @ts-expect-error - ok for test
  const data2: UserPrivilegeSetModelType = {
    description: 'App Access',
    id: randomUUID(),
    name: 'USER',
    order: 2,
  }

  beforeAll(async () => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
    const redisConfig = getRedisConfig()
    redisService = new RedisService({
      isLocal: true,
      redis: redisConfig,
    })
  })

  beforeEach(() => {
    cache = new UserPrivilegeSetCache()
  })

  afterAll(async () => {
    // Close Redis connection to prevent hanging
    if (redisService?.cacheHandle) {
      await redisService.cacheHandle.quit()
    }
    jest.clearAllMocks()
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(UserPrivilegeSetCache).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    // assert
    expect(cache).toBeDefined()
  })

  describe('setCache', () => {
    test('should return false no data is passed', async () => {
      // arrange
      // act
      const result = await cache.setCache('ADMIN', null)
      // assert
      expect(result).toBeFalsy()
    })
    test('should set Data0 to Cache when all is good', async () => {
      // arrange
      // act
      const result = await cache.setCache(data0.name, data0)
      // assert
      expect(result).toBeTruthy()
    })
    test('should set Data1 to Cache when all is good', async () => {
      // arrange
      // act
      const result = await cache.setCache(data1.name, data1)
      // assert
      expect(result).toBeTruthy()
    })
    test('should set Data2 to Cache when all is good', async () => {
      // arrange
      // act
      const result = await cache.setCache(data2.name, data2)
      // assert
      expect(result).toBeTruthy()
    })
  })

  describe('getCache', () => {
    test('return null when privilege set name not passed', async () => {
      // arrange
      // act
      const result = await cache.getCache(null)
      // assert
      expect(result).toBeFalsy()
    })
    test('should return privilge set when exists', async () => {
      // arrange
      // act
      const result = await cache.getCache(data0.name)
      // assert
      expect(result).toEqual(data0)
    })
  })

  describe('getAllPrivilegeSets', () => {
    test('should get array of privileget sets by the namespace when invoked', async () => {
      // arrange
      // act
      const result = await cache.getAllPrivilegeSets()
      // assert
      expect(result).toHaveLength(3)
      expect(result.sort((a, b) => a.order - b.order)).toEqual([data0, data1, data2])
    })
  })
})
