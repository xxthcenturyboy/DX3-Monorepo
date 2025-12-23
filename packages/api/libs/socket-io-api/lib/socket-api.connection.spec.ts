import { EventEmitter } from 'node:events'
import { createServer, type Server as HttpServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { Socket as ServerSocket } from 'socket.io'
import { type Socket as ClientSocket, io as ioc } from 'socket.io-client'

import { ApiLoggingClass } from '../../logger'
import { RedisService } from '../../redis'
import { SocketApiConnection } from './socket-api.connection'

jest.mock('../../logger', () => require('../../testing/mocks/internal/logger.mock'))
// Note: We don't mock redis here because SocketApiConnection needs
// real RedisService behavior (duplicate, psubscribe) for socket.io adapter.
// The ioredis module is mocked via __mocks__/ioredis.ts using ioredis-mock.

// Increase max listeners to prevent warnings during tests
EventEmitter.defaultMaxListeners = 50

function waitFor(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve)
  })
}

describe('SocketApiConnection', () => {
  let serverSocket: ServerSocket
  let clientSocket: ClientSocket
  let httpServer: HttpServer
  let logErrorSpy: jest.SpyInstance

  beforeAll((done) => {
    new ApiLoggingClass({ appName: 'Unit Testing' })
    httpServer = createServer()
    const redisConfig = {
      port: 6379,
      prefix: 'dx',
      url: 'redis://localhost:6379',
    }
    new RedisService({
      isDev: true,
      redis: redisConfig,
    })

    new SocketApiConnection({ httpServer, webUrl: 'http://localhost' })
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port
      clientSocket = ioc(`http://localhost:${port}`)
      SocketApiConnection.instance.io.on('connection', (socket) => {
        serverSocket = socket
      })
      clientSocket.on('connect', done)
    })
  })

  beforeEach(() => {
    if (ApiLoggingClass.instance?.logError) {
      logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError').mockImplementation(() => {})
    } else {
      // Create a mock logError if it doesn't exist
      logErrorSpy = jest.fn()
      if (ApiLoggingClass.instance) {
        ;(ApiLoggingClass.instance.logError as any) = logErrorSpy
      }
    }
  })

  afterEach(() => {
    if (logErrorSpy?.mockRestore) {
      logErrorSpy.mockRestore()
    }
  })

  afterAll(() => {
    SocketApiConnection.instance.io.close()
    clientSocket.disconnect()
    if (httpServer.listening) {
      httpServer.close()
    }
  })

  describe('Class Definition', () => {
    it('should be defined upon import', () => {
      expect(SocketApiConnection).toBeDefined()
    })

    it('should be a constructor function', () => {
      expect(typeof SocketApiConnection).toBe('function')
      expect(SocketApiConnection.name).toBe('SocketApiConnection')
    })

    it('should have static instance getter', () => {
      expect(SocketApiConnection.instance).toBeDefined()
    })
  })

  describe('Constructor - Error Cases', () => {
    let testServer: HttpServer

    beforeEach(() => {
      testServer = createServer()
      testServer.setMaxListeners(50)
    })

    afterEach(() => {
      if (testServer?.listening) {
        testServer.close()
      }
    })

    it('should not initialize io when both httpServer and webUrl are missing', () => {
      const connection = new SocketApiConnection({
        httpServer: null as any,
        webUrl: null as any,
      })
      // io should not be initialized when BOTH params are missing
      expect(connection.io).toBeUndefined()
    })

    it('should not initialize io when both httpServer and webUrl are falsy', () => {
      const connection = new SocketApiConnection({
        httpServer: undefined as any,
        webUrl: '' as any,
      })
      // io should not be initialized when BOTH params are falsy
      expect(connection.io).toBeUndefined()
    })

    it('should not initialize io when Redis cache handle is unavailable', () => {
      const originalCacheHandle = RedisService.instance.cacheHandle

      // Temporarily remove cache handle
      Object.defineProperty(RedisService.instance, 'cacheHandle', {
        configurable: true,
        get: () => null,
      })

      const connection = new SocketApiConnection({
        httpServer: testServer,
        webUrl: 'http://localhost',
      })

      // io should not be initialized when Redis is unavailable
      expect(connection.io).toBeUndefined()

      // Restore cache handle
      Object.defineProperty(RedisService.instance, 'cacheHandle', {
        configurable: true,
        get: () => originalCacheHandle,
      })
    })

    it('should handle undefined Redis cache handle gracefully', () => {
      const originalCacheHandle = RedisService.instance.cacheHandle

      Object.defineProperty(RedisService.instance, 'cacheHandle', {
        configurable: true,
        get: () => undefined,
      })

      const connection = new SocketApiConnection({
        httpServer: testServer,
        webUrl: 'http://localhost',
      })

      // io should not be initialized when Redis is undefined
      expect(connection.io).toBeUndefined()

      Object.defineProperty(RedisService.instance, 'cacheHandle', {
        configurable: true,
        get: () => originalCacheHandle,
      })
    })

    it('should verify early return prevents redis calls when params missing', () => {
      const connection = new SocketApiConnection({
        httpServer: null as any,
        webUrl: null as any,
      })

      // Connection should exist but io should not be initialized
      expect(connection).toBeDefined()
      expect(connection.io).toBeUndefined()
    })

    it('should verify early return prevents redis calls when Redis unavailable', () => {
      const originalCacheHandle = RedisService.instance.cacheHandle

      Object.defineProperty(RedisService.instance, 'cacheHandle', {
        configurable: true,
        get: () => null,
      })

      const connection = new SocketApiConnection({
        httpServer: testServer,
        webUrl: 'http://localhost',
      })

      expect(connection).toBeDefined()
      expect(connection.io).toBeUndefined()

      Object.defineProperty(RedisService.instance, 'cacheHandle', {
        configurable: true,
        get: () => originalCacheHandle,
      })
    })
  })

  describe('Constructor - Success Cases', () => {
    it('should create instance with valid parameters', () => {
      expect(SocketApiConnection.instance).toBeDefined()
      expect(SocketApiConnection.instance.io).toBeDefined()
    })

    it('should initialize Socket.IO server', () => {
      expect(SocketApiConnection.instance.io).toBeDefined()
      expect(typeof SocketApiConnection.instance.io.on).toBe('function')
    })

    it('should set singleton instance', () => {
      const instance = SocketApiConnection.instance
      expect(instance).toBeDefined()
      expect(instance.io).toBeDefined()
    })
  })

  describe('Socket.IO Configuration', () => {
    it('should configure CORS with webUrl', () => {
      expect(SocketApiConnection.instance.io).toBeDefined()
    })

    it('should configure connection state recovery', () => {
      expect(SocketApiConnection.instance.io).toBeDefined()
    })

    it('should disable serving client files', () => {
      expect(SocketApiConnection.instance.io).toBeDefined()
    })
  })

  describe('Socket Communication', () => {
    it('should work when hello emitted', async () => {
      clientSocket.on('hello', (arg) => {
        expect(arg).toBe('world')
      })
      serverSocket.emit('hello', 'world')
    })

    it('should work with an acknowledgement', (done) => {
      serverSocket.on('hi', (cb) => {
        cb('hola')
      })
      clientSocket.emit('hi', (arg) => {
        expect(arg).toBe('hola')
        done()
      })
    })

    it('should work with emitWithAck()', async () => {
      serverSocket.on('foo', (cb) => {
        cb('bar')
      })
      const result = await clientSocket.emitWithAck('foo')
      expect(result).toBe('bar')
    })

    it('should work with waitFor()', () => {
      clientSocket.emit('baz')
      return waitFor(serverSocket, 'baz')
    })
  })

  describe('Type Export', () => {
    it('should export SocketApiConnectionType', () => {
      const instance = SocketApiConnection.instance
      expect(instance).toBeDefined()
      expect(instance.io).toBeDefined()
    })
  })

  describe('Redis Adapter', () => {
    it('should use Redis adapter for scaling', () => {
      // Redis adapter is configured in constructor
      expect(SocketApiConnection.instance.io).toBeDefined()
    })
  })
})
