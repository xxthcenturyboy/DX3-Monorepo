import type { RedisConfigType, RedisConstructorType, RedisExpireOptions } from './redis.types'

describe('redis.types', () => {
  describe('RedisExpireOptions', () => {
    it('should define RedisExpireOptions type', () => {
      const options: RedisExpireOptions = {
        time: 60,
        token: 'EX',
      }
      expect(options).toBeDefined()
    })

    it('should accept EX token', () => {
      const options: RedisExpireOptions = {
        time: 60,
        token: 'EX',
      }
      expect(options.token).toBe('EX')
    })

    it('should accept PX token', () => {
      const options: RedisExpireOptions = {
        time: 60000,
        token: 'PX',
      }
      expect(options.token).toBe('PX')
    })

    it('should accept EXAT token', () => {
      const options: RedisExpireOptions = {
        time: Date.now() + 1000,
        token: 'EXAT',
      }
      expect(options.token).toBe('EXAT')
    })

    it('should accept PXAT token', () => {
      const options: RedisExpireOptions = {
        time: Date.now() + 60000,
        token: 'PXAT',
      }
      expect(options.token).toBe('PXAT')
    })

    it('should accept KEEPTTL token', () => {
      const options: RedisExpireOptions = {
        time: 0,
        token: 'KEEPTTL',
      }
      expect(options.token).toBe('KEEPTTL')
    })

    it('should have time property as number', () => {
      const options: RedisExpireOptions = {
        time: 3600,
        token: 'EX',
      }
      expect(typeof options.time).toBe('number')
    })

    it('should allow various time values', () => {
      const options1: RedisExpireOptions = { time: 1, token: 'EX' }
      const options2: RedisExpireOptions = { time: 86400, token: 'EX' }
      const options3: RedisExpireOptions = { time: 60000, token: 'PX' }

      expect(options1.time).toBe(1)
      expect(options2.time).toBe(86400)
      expect(options3.time).toBe(60000)
    })
  })

  describe('RedisConfigType', () => {
    it('should define RedisConfigType type', () => {
      const config: RedisConfigType = {
        port: 6379,
        prefix: 'dx',
        url: 'redis://localhost',
      }
      expect(config).toBeDefined()
    })

    it('should have port property as number', () => {
      const config: RedisConfigType = {
        port: 6379,
        prefix: 'test',
        url: 'redis://localhost',
      }
      expect(typeof config.port).toBe('number')
    })

    it('should have prefix property as string', () => {
      const config: RedisConfigType = {
        port: 6379,
        prefix: 'myapp',
        url: 'redis://localhost',
      }
      expect(typeof config.prefix).toBe('string')
    })

    it('should have url property as string', () => {
      const config: RedisConfigType = {
        port: 6379,
        prefix: 'test',
        url: 'redis://localhost:6379',
      }
      expect(typeof config.url).toBe('string')
    })

    it('should accept various port numbers', () => {
      const config1: RedisConfigType = { port: 6379, prefix: 'test', url: 'redis://localhost' }
      const config2: RedisConfigType = { port: 6380, prefix: 'test', url: 'redis://localhost' }

      expect(config1.port).toBe(6379)
      expect(config2.port).toBe(6380)
    })

    it('should accept various prefixes', () => {
      const config: RedisConfigType = {
        port: 6379,
        prefix: 'my-app-prefix',
        url: 'redis://localhost',
      }
      expect(config.prefix).toBe('my-app-prefix')
    })

    it('should accept various URL formats', () => {
      const urls = [
        'redis://localhost',
        'redis://localhost:6379',
        'redis://user:pass@host:6379',
        'rediss://secure.redis.com:6380',
      ]

      urls.forEach((url) => {
        const config: RedisConfigType = {
          port: 6379,
          prefix: 'test',
          url,
        }
        expect(config.url).toBe(url)
      })
    })
  })

  describe('RedisConstructorType', () => {
    it('should define RedisConstructorType type', () => {
      const params: RedisConstructorType = {
        isDev: true,
        redis: {
          port: 6379,
          prefix: 'dx',
          url: 'redis://localhost',
        },
      }
      expect(params).toBeDefined()
    })

    it('should have isDev property as boolean', () => {
      const params: RedisConstructorType = {
        isDev: true,
        redis: {
          port: 6379,
          prefix: 'test',
          url: 'redis://localhost',
        },
      }
      expect(typeof params.isDev).toBe('boolean')
    })

    it('should have redis property as RedisConfigType', () => {
      const params: RedisConstructorType = {
        isDev: false,
        redis: {
          port: 6379,
          prefix: 'app',
          url: 'redis://localhost',
        },
      }
      expect(params.redis).toBeDefined()
      expect(params.redis.port).toBeDefined()
      expect(params.redis.prefix).toBeDefined()
      expect(params.redis.url).toBeDefined()
    })

    it('should work with isDev true', () => {
      const params: RedisConstructorType = {
        isDev: true,
        redis: {
          port: 6379,
          prefix: 'local',
          url: 'redis://localhost',
        },
      }
      expect(params.isDev).toBe(true)
    })

    it('should work with isDev false for cluster', () => {
      const params: RedisConstructorType = {
        isDev: false,
        redis: {
          port: 6379,
          prefix: 'cluster',
          url: 'redis://node1|redis://node2',
        },
      }
      expect(params.isDev).toBe(false)
    })
  })

  describe('Type Integration', () => {
    it('should allow RedisConfigType to be used in RedisConstructorType', () => {
      const config: RedisConfigType = {
        port: 6379,
        prefix: 'app',
        url: 'redis://localhost',
      }

      const params: RedisConstructorType = {
        isDev: true,
        redis: config,
      }

      expect(params.redis).toBe(config)
    })

    it('should support complete configuration', () => {
      const params: RedisConstructorType = {
        isDev: true,
        redis: {
          port: 6379,
          prefix: 'production',
          url: 'redis://prod-redis:6379',
        },
      }

      expect(params.isDev).toBe(true)
      expect(params.redis.port).toBe(6379)
      expect(params.redis.prefix).toBe('production')
      expect(params.redis.url).toBe('redis://prod-redis:6379')
    })
  })
})
