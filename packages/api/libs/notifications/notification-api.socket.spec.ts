import { createServer, type Server } from 'node:http'

import { getRedisConfig } from '../config/config-api'
import { ApiLoggingClass } from '../logger'
import { RedisService } from '../redis'
import { ensureLoggedInSocket, getUserIdFromHandshake, SocketApiConnection } from '../socket-io-api'
import { NotificationSocketApiService } from './notification-api.socket'

// Mock with factories to use centralized mocks for source code's relative imports
jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

// Preserve real SocketApiConnection but mock the socket helper utilities
jest.mock('../socket-io-api', () => ({
  ...jest.requireActual('../socket-io-api'),
  ensureLoggedInSocket: jest.fn(),
  getUserIdFromHandshake: jest.fn(),
}))
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
      isDev: true,
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

  describe('sendNotificationToUser', () => {
    it('should call ns.to(userId).emit when notification has userId', () => {
      new NotificationSocketApiService()
      const instance = NotificationSocketApiService.instance
      const emitSpy = jest.fn()
      const toSpy = jest.spyOn(instance.ns, 'to').mockReturnValue({ emit: emitSpy } as never)

      instance.sendNotificationToUser({ id: 'n1', message: 'Hello', userId: 'user-99' } as never)

      expect(toSpy).toHaveBeenCalledWith('user-99')
      expect(emitSpy).toHaveBeenCalledWith(
        'sendNotification',
        expect.objectContaining({ userId: 'user-99' }),
      )
    })

    it('should not call ns.to when notification has no userId', () => {
      new NotificationSocketApiService()
      const instance = NotificationSocketApiService.instance
      const toSpy = jest.spyOn(instance.ns, 'to').mockReturnValue({ emit: jest.fn() } as never)

      instance.sendNotificationToUser({ id: 'n2', message: 'No user' } as never)

      expect(toSpy).not.toHaveBeenCalled()
    })

    it('should log error when ns.to throws', () => {
      new NotificationSocketApiService()
      const instance = NotificationSocketApiService.instance
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')
      jest.spyOn(instance.ns, 'to').mockImplementation(() => {
        throw new Error('socket error')
      })

      instance.sendNotificationToUser({ id: 'n3', message: 'Fail', userId: 'user-1' } as never)

      expect(logErrorSpy).toHaveBeenCalledWith(expect.stringContaining('socket error'))
    })
  })

  describe('sendNotificationToAll', () => {
    it('should call ns.emit with sendSystemNotification', () => {
      new NotificationSocketApiService()
      const instance = NotificationSocketApiService.instance
      const emitSpy = jest.spyOn(instance.ns, 'emit').mockReturnValue(instance.ns as never)

      instance.sendNotificationToAll({ id: 'n1', message: 'Broadcast' } as never)

      expect(emitSpy).toHaveBeenCalledWith(
        'sendSystemNotification',
        expect.objectContaining({ id: 'n1' }),
      )
    })

    it('should log error when ns.emit throws', () => {
      new NotificationSocketApiService()
      const instance = NotificationSocketApiService.instance
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')
      jest.spyOn(instance.ns, 'emit').mockImplementation(() => {
        throw new Error('emit error')
      })

      instance.sendNotificationToAll({ id: 'n2', message: 'Fail' } as never)

      expect(logErrorSpy).toHaveBeenCalledWith(expect.stringContaining('emit error'))
    })
  })

  describe('sendAppUpdateNotification', () => {
    it('should call ns.emit with sendAppUpdateNotification', () => {
      new NotificationSocketApiService()
      const instance = NotificationSocketApiService.instance
      const emitSpy = jest.spyOn(instance.ns, 'emit').mockReturnValue(instance.ns as never)

      instance.sendAppUpdateNotification('App updated!')

      expect(emitSpy).toHaveBeenCalledWith('sendAppUpdateNotification', 'App updated!')
    })

    it('should log error when ns.emit throws', () => {
      new NotificationSocketApiService()
      const instance = NotificationSocketApiService.instance
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')
      jest.spyOn(instance.ns, 'emit').mockImplementation(() => {
        throw new Error('update emit error')
      })

      instance.sendAppUpdateNotification('Update fail')

      expect(logErrorSpy).toHaveBeenCalledWith(expect.stringContaining('update emit error'))
    })
  })

  describe('configureNamespace', () => {
    it('should call ns.use and ns.on', () => {
      new NotificationSocketApiService()
      const instance = NotificationSocketApiService.instance
      const useSpy = jest.spyOn(instance.ns, 'use').mockImplementation(() => instance.ns as never)
      const onSpy = jest.spyOn(instance.ns, 'on').mockImplementation(() => instance.ns as never)

      instance.configureNamespace()

      expect(useSpy).toHaveBeenCalledWith(expect.any(Function))
      expect(onSpy).toHaveBeenCalledWith('connection', expect.any(Function))
    })

    it('should call next() when socket is logged in', () => {
      new NotificationSocketApiService()
      const instance = NotificationSocketApiService.instance
      ;(ensureLoggedInSocket as jest.Mock).mockReturnValue(true)

      let capturedMiddleware: (socket: unknown, next: (err?: Error) => void) => void = () => {}
      jest.spyOn(instance.ns, 'use').mockImplementation((fn) => {
        capturedMiddleware = fn as never
        return instance.ns as never
      })
      jest.spyOn(instance.ns, 'on').mockImplementation(() => instance.ns as never)

      instance.configureNamespace()

      const nextFn = jest.fn()
      capturedMiddleware({ handshake: {} }, nextFn)

      expect(nextFn).toHaveBeenCalledWith()
    })

    it('should call next(Error) when socket is not logged in', () => {
      new NotificationSocketApiService()
      const instance = NotificationSocketApiService.instance
      ;(ensureLoggedInSocket as jest.Mock).mockReturnValue(false)

      let capturedMiddleware: (socket: unknown, next: (err?: Error) => void) => void = () => {}
      jest.spyOn(instance.ns, 'use').mockImplementation((fn) => {
        capturedMiddleware = fn as never
        return instance.ns as never
      })
      jest.spyOn(instance.ns, 'on').mockImplementation(() => instance.ns as never)

      instance.configureNamespace()

      const nextFn = jest.fn()
      capturedMiddleware({ handshake: {} }, nextFn)

      expect(nextFn).toHaveBeenCalledWith(expect.any(Error))
    })

    it('should join userId room when connection has userId', () => {
      new NotificationSocketApiService()
      const instance = NotificationSocketApiService.instance
      ;(getUserIdFromHandshake as jest.Mock).mockReturnValue('user-abc')

      jest.spyOn(instance.ns, 'use').mockImplementation(() => instance.ns as never)

      let capturedConnectionHandler: (socket: unknown) => void = () => {}
      jest.spyOn(instance.ns, 'on').mockImplementation((event, fn) => {
        if (event === 'connection') capturedConnectionHandler = fn as never
        return instance.ns as never
      })

      instance.configureNamespace()

      const joinFn = jest.fn()
      capturedConnectionHandler({ handshake: {}, join: joinFn })

      expect(joinFn).toHaveBeenCalledWith('user-abc')
    })

    it('should not join a room when connection has no userId', () => {
      new NotificationSocketApiService()
      const instance = NotificationSocketApiService.instance
      ;(getUserIdFromHandshake as jest.Mock).mockReturnValue(null)

      jest.spyOn(instance.ns, 'use').mockImplementation(() => instance.ns as never)

      let capturedConnectionHandler: (socket: unknown) => void = () => {}
      jest.spyOn(instance.ns, 'on').mockImplementation((event, fn) => {
        if (event === 'connection') capturedConnectionHandler = fn as never
        return instance.ns as never
      })

      instance.configureNamespace()

      const joinFn = jest.fn()
      capturedConnectionHandler({ handshake: {}, join: joinFn })

      expect(joinFn).not.toHaveBeenCalled()
    })
  })
})
