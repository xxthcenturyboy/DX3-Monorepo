import {
  REDIS_DELIMITER,
  type RedisConfigType,
  type RedisConstructorType,
  type RedisExpireOptions,
  RedisHealthzService,
  type RedisHealthzServiceType,
  RedisService,
  type RedisServiceType,
} from './index'

describe('index', () => {
  describe('Constant Exports', () => {
    it('should export REDIS_DELIMITER', () => {
      expect(REDIS_DELIMITER).toBeDefined()
      expect(REDIS_DELIMITER).toBe(':')
    })

    it('should export REDIS_DELIMITER as string', () => {
      expect(typeof REDIS_DELIMITER).toBe('string')
    })
  })

  describe('Class Exports', () => {
    it('should export RedisService', () => {
      expect(RedisService).toBeDefined()
    })

    it('should export RedisService as a class', () => {
      expect(typeof RedisService).toBe('function')
      expect(RedisService.name).toBe('RedisService')
    })

    it('should export RedisHealthzService', () => {
      expect(RedisHealthzService).toBeDefined()
    })

    it('should export RedisHealthzService as a class', () => {
      expect(typeof RedisHealthzService).toBe('function')
      expect(RedisHealthzService.name).toBe('RedisHealthzService')
    })
  })

  describe('Type Exports', () => {
    it('should export RedisServiceType type', () => {
      // TypeScript compilation will fail if this type is not exported
      const testType = {} as RedisServiceType
      expect(testType).toBeDefined()
    })

    it('should export RedisHealthzServiceType type', () => {
      const testType = {} as RedisHealthzServiceType
      expect(testType).toBeDefined()
    })

    it('should export RedisConfigType type', () => {
      const config: RedisConfigType = {
        port: 6379,
        prefix: 'test',
        url: 'redis://localhost',
      }
      expect(config).toBeDefined()
    })

    it('should export RedisConstructorType type', () => {
      const params: RedisConstructorType = {
        isLocal: true,
        redis: {
          port: 6379,
          prefix: 'test',
          url: 'redis://localhost',
        },
      }
      expect(params).toBeDefined()
    })

    it('should export RedisExpireOptions type', () => {
      const options: RedisExpireOptions = {
        time: 60,
        token: 'EX',
      }
      expect(options).toBeDefined()
    })
  })

  describe('Named Imports', () => {
    it('should allow importing RedisService', () => {
      expect(RedisService).toBeDefined()
    })

    it('should allow importing RedisHealthzService', () => {
      expect(RedisHealthzService).toBeDefined()
    })

    it('should allow importing REDIS_DELIMITER', () => {
      expect(REDIS_DELIMITER).toBeDefined()
    })
  })

  describe('Module Structure', () => {
    it('should provide clean module interface', () => {
      expect(RedisService).toBeDefined()
      expect(RedisHealthzService).toBeDefined()
      expect(REDIS_DELIMITER).toBeDefined()
    })

    it('should have correct class prototypes', () => {
      expect(RedisService.prototype).toBeDefined()
      expect(RedisHealthzService.prototype).toBeDefined()
    })
  })

  describe('RedisService Methods', () => {
    it('should have expected methods on prototype', () => {
      expect(RedisService.prototype.setCacheItem).toBeDefined()
      expect(RedisService.prototype.setCacheItemWithExpiration).toBeDefined()
      expect(RedisService.prototype.getCacheItem).toBeDefined()
      expect(RedisService.prototype.getCacheItemSimple).toBeDefined()
      expect(RedisService.prototype.getAllNamespace).toBeDefined()
      expect(RedisService.prototype.deleteCacheItem).toBeDefined()
      expect(RedisService.prototype.getKeys).toBeDefined()
    })

    it('should have methods as functions', () => {
      expect(typeof RedisService.prototype.setCacheItem).toBe('function')
      expect(typeof RedisService.prototype.getCacheItem).toBe('function')
      expect(typeof RedisService.prototype.deleteCacheItem).toBe('function')
    })

    it('should have static instance property', () => {
      // Instance getter exists on the class, but may be undefined until instantiated
      expect(RedisService).toHaveProperty('instance')
    })
  })

  describe('RedisHealthzService Methods', () => {
    it('should have expected methods on prototype', () => {
      expect(RedisHealthzService.prototype.healthCheck).toBeDefined()
      expect(RedisHealthzService.prototype.healthz).toBeDefined()
      expect(RedisHealthzService.prototype.testReadAndWrite).toBeDefined()
    })

    it('should have methods as functions', () => {
      expect(typeof RedisHealthzService.prototype.healthCheck).toBe('function')
      expect(typeof RedisHealthzService.prototype.healthz).toBe('function')
      expect(typeof RedisHealthzService.prototype.testReadAndWrite).toBe('function')
    })
  })

  describe('Export Consistency', () => {
    it('should export all expected items', () => {
      expect(REDIS_DELIMITER).toBeDefined()
      expect(RedisService).toBeDefined()
      expect(RedisHealthzService).toBeDefined()
    })

    it('should maintain correct export types', () => {
      const service: RedisServiceType = {} as RedisServiceType
      const healthz: RedisHealthzServiceType = {} as RedisHealthzServiceType
      const config: RedisConfigType = {} as RedisConfigType
      const expireOptions: RedisExpireOptions = {} as RedisExpireOptions

      expect(service).toBeDefined()
      expect(healthz).toBeDefined()
      expect(config).toBeDefined()
      expect(expireOptions).toBeDefined()
    })
  })

  describe('Re-exports from redis.consts', () => {
    it('should re-export REDIS_DELIMITER constant', () => {
      expect(REDIS_DELIMITER).toBe(':')
    })
  })

  describe('Re-exports from redis.service', () => {
    it('should re-export RedisService class', () => {
      expect(RedisService.name).toBe('RedisService')
    })

    it('should maintain class functionality through re-export', () => {
      expect(RedisService.prototype.constructor).toBe(RedisService)
    })
  })

  describe('Re-exports from redis.healthz', () => {
    it('should re-export RedisHealthzService class', () => {
      expect(RedisHealthzService.name).toBe('RedisHealthzService')
    })

    it('should maintain class functionality through re-export', () => {
      expect(RedisHealthzService.prototype.constructor).toBe(RedisHealthzService)
    })
  })

  describe('Re-exports from redis.types', () => {
    it('should re-export type definitions', () => {
      // Types are compile-time only, verify by using them
      const config: RedisConfigType = {
        port: 6379,
        prefix: 'app',
        url: 'redis://localhost',
      }
      expect(config.port).toBe(6379)
    })
  })
})
