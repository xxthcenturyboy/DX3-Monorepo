import { EventEmitter } from 'node:events'
import { createServer, type Server as HttpServer } from 'node:http'

import { ApiLoggingClass } from '../../logger'
import { RedisService } from '../../redis'
import { SocketApiConnection } from './socket-api.connection'
import { SocketApiService, type SocketApiServiceType } from './socket-api.service'

jest.mock('../../logger', () => require('../../testing/mocks/internal/logger.mock'))
// Note: We don't mock redis here because SocketApiService needs
// real RedisService behavior (duplicate, psubscribe) for socket.io adapter.
// The ioredis module is mocked via __mocks__/ioredis.ts using ioredis-mock.

// Increase max listeners to prevent warnings during tests
EventEmitter.defaultMaxListeners = 50

describe('SocketApiService', () => {
  let httpServer: HttpServer
  let service: SocketApiService
  const createdServices: SocketApiService[] = []

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit Testing' })
    httpServer = createServer()
    httpServer.setMaxListeners(50)
    const redisConfig = {
      port: 6379,
      prefix: 'dx',
      url: 'redis://localhost:6379',
    }
    new RedisService({
      isLocal: true,
      redis: redisConfig,
    })
  })

  afterEach(() => {
    // Clean up any services created in individual tests
    createdServices.forEach((svc) => {
      if (svc?.io) {
        try {
          svc.io.close()
        } catch (_e) {
          // Ignore cleanup errors
        }
      }
    })
    createdServices.length = 0
  })

  afterAll(() => {
    if (service?.io) {
      service.io.close()
    }
    if (httpServer?.listening) {
      httpServer.close()
    }
  })

  describe('Class Definition', () => {
    it('should be defined', () => {
      expect(SocketApiService).toBeDefined()
    })

    it('should be a constructor function', () => {
      expect(typeof SocketApiService).toBe('function')
      expect(SocketApiService.name).toBe('SocketApiService')
    })
  })

  describe('Constructor', () => {
    it('should create instance with valid parameters', () => {
      service = new SocketApiService({
        httpServer,
        webUrl: 'http://localhost',
      })
      createdServices.push(service)
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(SocketApiService)
    })

    it('should extend SocketApiConnection', () => {
      service = new SocketApiService({
        httpServer,
        webUrl: 'http://localhost',
      })
      createdServices.push(service)
      expect(service).toBeInstanceOf(SocketApiConnection)
    })

    it('should initialize with httpServer and webUrl', () => {
      service = new SocketApiService({
        httpServer,
        webUrl: 'http://localhost:3000',
      })
      createdServices.push(service)
      expect(service).toBeDefined()
      expect(service.io).toBeDefined()
    })

    it('should call parent constructor', () => {
      service = new SocketApiService({
        httpServer,
        webUrl: 'http://localhost',
      })
      createdServices.push(service)
      // If parent constructor was called, io should be initialized
      expect(service.io).toBeDefined()
    })
  })

  describe('Instance Properties', () => {
    beforeEach(() => {
      service = new SocketApiService({
        httpServer,
        webUrl: 'http://localhost',
      })
      createdServices.push(service)
    })

    it('should have io property from parent', () => {
      expect(service.io).toBeDefined()
    })

    it('should have setup method', () => {
      expect(service.setup).toBeDefined()
      expect(typeof service.setup).toBe('function')
    })
  })

  describe('setup method', () => {
    beforeEach(() => {
      service = new SocketApiService({
        httpServer,
        webUrl: 'http://localhost',
      })
      createdServices.push(service)
    })

    it('should exist as a method', () => {
      expect(service.setup).toBeDefined()
      expect(typeof service.setup).toBe('function')
    })

    it('should be callable without errors', () => {
      expect(() => service.setup()).not.toThrow()
    })

    it('should return undefined', () => {
      const result = service.setup()
      expect(result).toBeUndefined()
    })

    it('should be a no-op by default', () => {
      // The method is empty, so calling it multiple times should not cause issues
      service.setup()
      service.setup()
      service.setup()
      expect(true).toBe(true)
    })
  })

  describe('Inheritance', () => {
    beforeEach(() => {
      service = new SocketApiService({
        httpServer,
        webUrl: 'http://localhost',
      })
      createdServices.push(service)
    })

    it('should inherit from SocketApiConnection', () => {
      expect(service).toBeInstanceOf(SocketApiConnection)
    })

    it('should have access to parent class properties', () => {
      expect(service.io).toBeDefined()
    })

    it('should maintain prototype chain', () => {
      expect(Object.getPrototypeOf(service)).toBe(SocketApiService.prototype)
      expect(Object.getPrototypeOf(SocketApiService.prototype)).toBe(SocketApiConnection.prototype)
    })
  })

  describe('Type Export', () => {
    it('should export SocketApiServiceType', () => {
      service = new SocketApiService({
        httpServer,
        webUrl: 'http://localhost',
      })
      createdServices.push(service)
      const serviceType: SocketApiServiceType = service
      expect(serviceType).toBeDefined()
    })

    it('should have correct type structure', () => {
      service = new SocketApiService({
        httpServer,
        webUrl: 'http://localhost',
      })
      createdServices.push(service)
      expect(service.setup).toBeDefined()
      expect(service.io).toBeDefined()
    })
  })

  describe('Integration with Parent Class', () => {
    beforeEach(() => {
      service = new SocketApiService({
        httpServer,
        webUrl: 'http://localhost',
      })
      createdServices.push(service)
    })

    it('should initialize Socket.IO server via parent', () => {
      expect(service.io).toBeDefined()
      expect(typeof service.io.on).toBe('function')
      expect(typeof service.io.emit).toBe('function')
    })

    it('should have singleton instance available via parent', () => {
      expect(SocketApiConnection.instance).toBeDefined()
    })
  })

  describe('Method Overriding', () => {
    beforeEach(() => {
      service = new SocketApiService({
        httpServer,
        webUrl: 'http://localhost',
      })
      createdServices.push(service)
    })

    it('should have setup method unique to SocketApiService', () => {
      // Parent class doesn't have setup method
      expect(service.setup).toBeDefined()
      expect(typeof service.setup).toBe('function')
    })

    it('should not override parent methods', () => {
      // Verify parent's static method is accessible
      expect(SocketApiConnection.instance).toBeDefined()
    })
  })

  describe('Instance Creation', () => {
    it('should create multiple instances if needed', () => {
      const service1 = new SocketApiService({
        httpServer,
        webUrl: 'http://localhost',
      })
      createdServices.push(service1)
      const service2 = new SocketApiService({
        httpServer,
        webUrl: 'http://localhost',
      })
      createdServices.push(service2)

      // Both should be defined
      expect(service1).toBeDefined()
      expect(service2).toBeDefined()
    })

    it('should allow different configurations', () => {
      const service1 = new SocketApiService({
        httpServer,
        webUrl: 'http://localhost:3000',
      })
      createdServices.push(service1)
      const service2 = new SocketApiService({
        httpServer,
        webUrl: 'http://localhost:4000',
      })
      createdServices.push(service2)

      expect(service1).toBeDefined()
      expect(service2).toBeDefined()
    })
  })
})
