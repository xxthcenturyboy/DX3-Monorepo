import { ApiLoggingClass } from '../logger'
import { REDIS_HEALTHZ_DATA, REDIS_HEALTHZ_KEY } from './redis.consts'
import { RedisHealthzService, type RedisHealthzServiceType } from './redis.healthz'
import { RedisService } from './redis.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('RedisHealthzService', () => {
  let redisHealthz: RedisHealthzServiceType
  const logInfoSpy = jest.spyOn(ApiLoggingClass.prototype, 'logInfo')
  const logErrorSpy = jest.spyOn(ApiLoggingClass.prototype, 'logError')
  const testConnectionSpy = jest.spyOn(
    RedisHealthzService.prototype,
    // @ts-expect-error - private method
    'testConnection',
  )
  const testReadAndWriteSpy = jest.spyOn(RedisHealthzService.prototype, 'testReadAndWrite')

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Test' })
    new RedisService({
      isDev: false,
      redis: {
        port: 6379,
        prefix: 'test',
        url: 'redis://redis',
      },
    })
    redisHealthz = new RedisHealthzService()
  })

  afterEach(() => {
    logInfoSpy.mockClear()
    logErrorSpy.mockClear()
    testConnectionSpy.mockClear()
    testReadAndWriteSpy.mockClear()
  })

  afterAll(async () => {
    jest.clearAllMocks()

    // Close Redis connection to prevent hanging
    try {
      if (RedisService.instance?.cacheHandle) {
        await RedisService.instance.cacheHandle.quit()
      }
    } catch (_error) {
      // Ignore quit errors from mocked ioredis
    }
  })

  describe('Class Definition', () => {
    it('should exist when imported', () => {
      expect(RedisHealthzService).toBeDefined()
    })

    it('should be a constructor function', () => {
      expect(typeof RedisHealthzService).toBe('function')
      expect(RedisHealthzService.name).toBe('RedisHealthzService')
    })

    it('should have values when instantiated but prior to initializaiton', () => {
      expect(redisHealthz).toBeDefined()
      expect(redisHealthz.healthCheck).toBeDefined()
      expect(redisHealthz.logger).toBeDefined()
      expect(redisHealthz.redis).toBeDefined()
      expect(redisHealthz.testData).toBeDefined()
      expect(redisHealthz.testData).toEqual(REDIS_HEALTHZ_DATA)
      expect(redisHealthz.testKey).toBeDefined()
      expect(redisHealthz.testKey).toEqual(REDIS_HEALTHZ_KEY)
      expect(redisHealthz.testReadAndWrite).toBeDefined()
    })
  })

  describe('healthCheck', () => {
    test('should perform a health check when invoked', async () => {
      // Act
      const result = await redisHealthz.healthCheck()
      // Assert
      expect(result).toBe(true)
      expect(testConnectionSpy).toHaveBeenCalledTimes(1)
      expect(testReadAndWriteSpy).toHaveBeenCalledTimes(1)
      expect(logInfoSpy).toHaveBeenCalledWith('***************************************')
      expect(logInfoSpy).toHaveBeenCalledWith('Checking connection to Redis')
      expect(logInfoSpy).toHaveBeenCalledWith('Redis Connection Healthy')
    })

    test('should log connection attempt', async () => {
      // Act
      await redisHealthz.healthCheck()
      // Assert
      expect(logInfoSpy).toHaveBeenCalledWith('***************************************')
      expect(logInfoSpy).toHaveBeenCalledWith('Checking connection to Redis')
    })

    test('should log successful connection', async () => {
      // Act
      await redisHealthz.healthCheck()
      // Assert
      expect(logInfoSpy).toHaveBeenCalledWith('Redis Connection Healthy')
      expect(logInfoSpy).toHaveBeenCalledWith(' ')
    })
  })

  describe('healthz', () => {
    test('should return healthz response', async () => {
      // Act
      const result = await redisHealthz.healthz()
      // Assert
      expect(result).toBeDefined()
      expect(result.ping).toBeDefined()
      expect(result.read).toBeDefined()
      expect(result.write).toBeDefined()
    })

    test('should have boolean ping property', async () => {
      // Act
      const result = await redisHealthz.healthz()
      // Assert
      expect(typeof result.ping).toBe('boolean')
    })

    test('should have boolean write property', async () => {
      // Act
      const result = await redisHealthz.healthz()
      // Assert
      expect(typeof result.write).toBe('boolean')
    })

    test('should not log info in silent mode', async () => {
      // Act
      await redisHealthz.healthz()
      // Assert
      // testConnection is called with silent=true, so no logging
      expect(logInfoSpy).not.toHaveBeenCalled()
    })
  })

  describe('testReadAndWrite', () => {
    test('should test write and read operations', async () => {
      // Act
      const result = await redisHealthz.testReadAndWrite()
      // Assert
      expect(result).toBe(true)
      expect(logInfoSpy).toHaveBeenCalledWith(expect.stringContaining('write result:'))
      expect(logInfoSpy).toHaveBeenCalledWith(expect.stringContaining('read result:'))
    })

    test('should log write result', async () => {
      // Act
      await redisHealthz.testReadAndWrite()
      // Assert
      expect(logInfoSpy).toHaveBeenCalledWith('write result: OK')
    })

    test('should log read result', async () => {
      // Act
      await redisHealthz.testReadAndWrite()
      // Assert
      expect(logInfoSpy).toHaveBeenCalledWith(expect.stringContaining('read result:'))
    })

    test('should return true on successful read/write', async () => {
      // Act
      const result = await redisHealthz.testReadAndWrite()
      // Assert
      expect(result).toBe(true)
    })
  })

  describe('Type Export', () => {
    it('should export RedisHealthzServiceType', () => {
      const serviceType: RedisHealthzServiceType = redisHealthz
      expect(serviceType).toBeDefined()
    })
  })

  describe('Constructor', () => {
    it('should initialize with RedisService instance', () => {
      expect(redisHealthz.redis).toBe(RedisService.instance)
    })

    it('should initialize with ApiLoggingClass instance', () => {
      expect(redisHealthz.logger).toBe(ApiLoggingClass.instance)
    })

    it('should set default test key', () => {
      expect(redisHealthz.testKey).toBe(REDIS_HEALTHZ_KEY)
    })

    it('should set default test data', () => {
      expect(redisHealthz.testData).toEqual(REDIS_HEALTHZ_DATA)
    })
  })
})
