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
    // arrange
    // act
    new FeatureFlagSocketApiService()
    // assert
    expect(FeatureFlagSocketApiService.instance.broadcastFlagsUpdated).toBeDefined()
    expect(FeatureFlagSocketApiService.instance.configureNamespace).toBeDefined()
    expect(FeatureFlagSocketApiService.instance.ns).toBeDefined()
    expect(FeatureFlagSocketApiService.instance.socket).toBeDefined()
  })
})
