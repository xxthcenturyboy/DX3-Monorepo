import { ApiLoggingClass } from '@dx3/api-libs/logger'

import { DxRedisCache } from './dx-redis.cache'

// Note: We don't mock redis here because this test needs real RedisService
// behavior. The ioredis module is mocked via __mocks__/ioredis.ts using ioredis-mock.
jest.mock('@dx3/api-libs/logger', () => require('@dx3/api-libs/testing/mocks/internal/logger.mock'))

describe('dx-redis.cache', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist', () => {
    // arrange
    // act
    // assert
    expect(DxRedisCache).toBeDefined()
  })

  it('should have a public static method of getRedisConnection', () => {
    // arrange
    // act
    // assert
    expect(DxRedisCache.getRedisConnection).toBeDefined()
  })

  test('should instantiate a redis connection when invoked', async () => {
    // arrange
    // act
    const cacheHandle = await DxRedisCache.getRedisConnection()
    // assert
    expect(cacheHandle).toBeDefined()
  })
})
