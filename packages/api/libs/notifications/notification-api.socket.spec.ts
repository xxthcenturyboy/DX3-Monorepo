import { createServer, type Server } from 'node:http'

import { getRedisConfig } from '../config/config-api'
import { ApiLoggingClass } from '../logger'
import { RedisService } from '../redis'
import { SocketApiConnection } from '../socket-io-api'
import { NotificationSocketApiService } from './notification-api.socket'

// Mock with factories to use centralized mocks for source code's relative imports
jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
// Note: We don't mock redis here because this test needs real RedisService
// behavior (duplicate, psubscribe) for socket.io adapter.
// The ioredis module is mocked via __mocks__/ioredis.ts using ioredis-mock.

describe('NotificationSocketApiService', () => {
  let redisService: RedisService
  let httpServer: Server

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'TEST' })
    const redisConfig = getRedisConfig()
    redisService = new RedisService({
      isLocal: true,
      redis: redisConfig,
    })
    httpServer = createServer()
    new SocketApiConnection({ httpServer, webUrl: '' })
  })

  afterAll(async () => {
    // Close socket.io connection
    SocketApiConnection.instance.io.close()
    // Close HTTP server
    httpServer.close()
    // Close Redis connection to prevent hanging
    if (redisService?.cacheHandle) {
      await redisService.cacheHandle.quit()
    }
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(NotificationSocketApiService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    new NotificationSocketApiService()
    // assert
    expect(NotificationSocketApiService.instance).toBeDefined()
  })

  it('should have all methods', () => {
    // arrange
    // act
    new NotificationSocketApiService()
    // assert
    expect(NotificationSocketApiService.instance.ns).toBeDefined()
    expect(NotificationSocketApiService.instance.socket).toBeDefined()
    expect(NotificationSocketApiService.instance.configureNamespace).toBeDefined()
    expect(NotificationSocketApiService.instance.sendAppUpdateNotification).toBeDefined()
    expect(NotificationSocketApiService.instance.sendNotificationToAll).toBeDefined()
    expect(NotificationSocketApiService.instance.sendNotificationToUser).toBeDefined()
  })
})
