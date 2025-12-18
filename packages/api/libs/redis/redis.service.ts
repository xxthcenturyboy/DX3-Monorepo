import { Redis } from 'ioredis'

import { isNumber, parseJson } from '@dx3/utils-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { REDIS_DELIMITER } from './redis.consts'
import type { RedisConfigType, RedisConstructorType, RedisExpireOptions } from './redis.types'

export class RedisService {
  cacheHandle: typeof Redis.Cluster.prototype | typeof Redis.prototype
  config: RedisConfigType
  static #instance: RedisServiceType
  logger: ApiLoggingClassType

  constructor(params: RedisConstructorType) {
    this.config = params.redis
    this.logger = ApiLoggingClass.instance
    RedisService.#instance = this

    if (params.isLocal) {
      const url = `${params.redis.url}:${params.redis.port}/0`
      this.cacheHandle = new Redis(url, {
        keyPrefix: `${params.redis.prefix}${REDIS_DELIMITER}`,
      })
      return
    }

    const hosts = params.redis.url.split('|')
    console.log(`trying to connect to: Redis Cluster ${JSON.stringify(hosts)}`)
    this.cacheHandle = new Redis.Cluster(hosts, {
      keyPrefix: `${params.redis.prefix}${REDIS_DELIMITER}`,
      redisOptions: {
        tls: {
          checkServerIdentity: () => undefined,
        },
      },
      scaleReads: 'slave',
    })
  }

  public static get instance() {
    return RedisService.#instance
  }

  public async setCacheItem(key: string, data: string) {
    if (!key && !data) {
      return false
    }

    try {
      const save = await this.cacheHandle.set(key, data)
      return save === 'OK'
    } catch (error) {
      this.logger.logError((error as Error).message, error as Error)
      return false
    }
  }

  public async setCacheItemWithExpiration(
    key: string,
    data: string,
    expireOptions: RedisExpireOptions,
  ) {
    if (!key && !data) {
      return false
    }

    try {
      const save = await this.cacheHandle.set(
        key,
        data,
        // @ts-expect-error - types are ok here
        expireOptions.token,
        expireOptions.time,
      )
      return save === 'OK'
    } catch (error) {
      this.logger.logError((error as Error).message, error as Error)
      return false
    }
  }

  public async getCacheItemSimple(key: string) {
    if (!key) {
      return null
    }
    try {
      return await this.cacheHandle.get(key)
    } catch (error) {
      this.logger.logError((error as Error).message, error as Error)
      return null
    }
  }

  public async getCacheItem<TData>(key: string) {
    if (!key) {
      return null
    }

    try {
      const data = await this.cacheHandle.get(key)
      if (data) {
        return parseJson<TData>(data)
      }

      return null
    } catch (error) {
      this.logger.logError((error as Error).message, error as Error)
      return null
    }
  }

  public async getAllNamespace<TData>(namespace: string): Promise<TData[] | null> {
    if (!namespace) {
      return null
    }
    const result: TData[] = []

    try {
      const keys = await this.getKeys(namespace)

      if (Array.isArray(keys)) {
        const prefix = this.config.prefix
        for (const key of keys) {
          const trimmedKey = key.replace(`${prefix}${REDIS_DELIMITER}`, '')
          const cacheItem = await this.getCacheItem<TData>(trimmedKey)
          if (cacheItem) {
            result.push(cacheItem)
          }
        }
      }

      return result
    } catch (error) {
      this.logger.logError((error as Error).message, error as Error)
      return result
    }
  }

  public async deleteCacheItem(key: string) {
    if (!key) {
      return false
    }

    try {
      const data = await this.cacheHandle.del(key)
      return isNumber(data)
    } catch (error) {
      this.logger.logError((error as Error).message, error as Error)
      return false
    }
  }

  public async getKeys(namespace?: string) {
    if (namespace) {
      return await this.cacheHandle.keys(`${namespace}*`)
    }
    return await this.cacheHandle.keys('*')
  }
}

export type RedisServiceType = typeof RedisService.prototype
