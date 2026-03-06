import { createServer, type Server } from 'node:http'

import { getRedisConfig } from '../config/config-api'
import { ApiLoggingClass } from '../logger'
import { RedisService } from '../redis'
import { SocketApiConnection } from '../socket-io-api'
import { FeatureFlagSocketApiService } from './feature-flag-api.socket'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('FeatureFlagSocketApiService', () => {
  let redisService: RedisService
  let httpServer: Server

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'TEST' })
    const redisConfig = getRedisConfig()
    redisService = new RedisService({
      isDev: true,
      redis: redisConfig,
    })
    httpServer = createServer()
    new SocketApiConnection({ httpServer, webUrl: '' })
  })

  afterAll(async () => {
    SocketApiConnection.instance.io.close()
    httpServer.close()
    if (redisService?.cacheHandle) {
      await redisService.cacheHandle.quit()
    }
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(FeatureFlagSocketApiService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    new FeatureFlagSocketApiService()
    // assert
    expect(FeatureFlagSocketApiService.instance).toBeDefined()
  })

  it('should have all methods', () => {
    new FeatureFlagSocketApiService()
    expect(FeatureFlagSocketApiService.instance.broadcastFlagsUpdated).toBeDefined()
    expect(FeatureFlagSocketApiService.instance.configureNamespace).toBeDefined()
    expect(FeatureFlagSocketApiService.instance.ns).toBeDefined()
    expect(FeatureFlagSocketApiService.instance.socket).toBeDefined()
  })

  describe('broadcastFlagsUpdated', () => {
    it('should emit featureFlagsUpdated to the room without throwing', () => {
      new FeatureFlagSocketApiService()
      const svc = FeatureFlagSocketApiService.instance
      const toSpy = jest.spyOn(svc.ns, 'to').mockReturnValue({
        emit: jest.fn(),
      } as never)

      expect(() => svc.broadcastFlagsUpdated()).not.toThrow()
      expect(toSpy).toHaveBeenCalledWith('feature-flag-updates')
    })

    it('should log error when broadcast throws', () => {
      new FeatureFlagSocketApiService()
      const svc = FeatureFlagSocketApiService.instance
      jest.spyOn(svc.ns, 'to').mockImplementation(() => {
        throw new Error('Socket emit failed')
      })
      // biome-ignore lint/complexity/useLiteralKeys: bracket notation required to access private class member
      const logErrorSpy = jest.spyOn(svc['logger'], 'logError')

      svc.broadcastFlagsUpdated()

      expect(logErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Socket emit failed'))
    })
  })

  describe('configureNamespace', () => {
    it('should register use middleware and connection handler', () => {
      new FeatureFlagSocketApiService()
      const svc = FeatureFlagSocketApiService.instance
      const useSpy = jest.spyOn(svc.ns, 'use').mockImplementation(() => svc.ns)
      const onSpy = jest.spyOn(svc.ns, 'on').mockImplementation(() => svc.ns)

      svc.configureNamespace()

      expect(useSpy).toHaveBeenCalledWith(expect.any(Function))
      expect(onSpy).toHaveBeenCalledWith('connection', expect.any(Function))
    })

    it('should call next() when ensureLoggedInSocket returns true', () => {
      new FeatureFlagSocketApiService()
      const svc = FeatureFlagSocketApiService.instance

      let capturedMiddleware: ((socket: unknown, next: (err?: Error) => void) => void) | undefined
      jest.spyOn(svc.ns, 'use').mockImplementation((fn) => {
        capturedMiddleware = fn as typeof capturedMiddleware
        return svc.ns
      })
      jest.spyOn(svc.ns, 'on').mockImplementation(() => svc.ns)

      jest.spyOn(require('../socket-io-api'), 'ensureLoggedInSocket').mockReturnValue(true)

      svc.configureNamespace()

      const nextFn = jest.fn()
      capturedMiddleware?.({ handshake: {} }, nextFn)
      expect(nextFn).toHaveBeenCalledWith()
    })

    it('should call next(error) when ensureLoggedInSocket returns false', () => {
      new FeatureFlagSocketApiService()
      const svc = FeatureFlagSocketApiService.instance

      let capturedMiddleware: ((socket: unknown, next: (err?: Error) => void) => void) | undefined
      jest.spyOn(svc.ns, 'use').mockImplementation((fn) => {
        capturedMiddleware = fn as typeof capturedMiddleware
        return svc.ns
      })
      jest.spyOn(svc.ns, 'on').mockImplementation(() => svc.ns)

      jest.spyOn(require('../socket-io-api'), 'ensureLoggedInSocket').mockReturnValue(false)

      svc.configureNamespace()

      const nextFn = jest.fn()
      capturedMiddleware?.({ handshake: {} }, nextFn)
      expect(nextFn).toHaveBeenCalledWith(expect.any(Error))
    })
  })
})
