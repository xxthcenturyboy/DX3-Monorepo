import type { RedisHealthzResponse } from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { REDIS_HEALTHZ_DATA, REDIS_HEALTHZ_KEY } from './redis.consts'
import { RedisService, type RedisServiceType } from './redis.service'

export class RedisHealthzService {
  logger: ApiLoggingClassType
  redis: RedisServiceType
  testKey = REDIS_HEALTHZ_KEY
  testData = REDIS_HEALTHZ_DATA

  constructor() {
    this.redis = RedisService.instance
    this.logger = ApiLoggingClass.instance
  }

  private async testConnection(silent: boolean) {
    const response = await this.redis.cacheHandle.ping()
    if (!silent) this.logger.logInfo(`Redis PING: ${response}`)
    return response === 'PONG'
  }

  private async testWrite() {
    return await this.redis.setCacheItemWithExpiration(
      this.testKey,
      JSON.stringify(this.testData),
      {
        time: 10,
        token: 'EX',
      },
    )
  }

  private async testRead() {
    const result = await this.redis.getCacheItem<typeof this.testData>(this.testKey)
    if (result) {
      return result
    }

    return null
  }

  public async testReadAndWrite() {
    const write = await this.testWrite()
    this.logger.logInfo(`write result: ${write ? 'OK' : 'FAIL'}`)

    if (write) {
      const read = await this.testRead()
      this.logger.logInfo(`read result: ${JSON.stringify(read || {})}`)
      return !!read
    }

    return false
  }

  public async healthCheck() {
    this.logger.logInfo('***************************************')
    this.logger.logInfo('Checking connection to Redis')
    const connection = await this.testConnection(false)
    if (connection) {
      const readAndWrite = await this.testReadAndWrite()
      // const keys = await this.redis.getKeys();
      // this.logger.logInfo('redis keys', keys);
      if (readAndWrite) {
        this.logger.logInfo('Redis Connection Healthy')
        this.logger.logInfo('***************************************')
        this.logger.logInfo(' ')
        return true
      }
    }

    this.logger.logError('Redis Connection NOT ESTABLISHED')
    this.logger.logInfo('***************************************')
    this.logger.logInfo(' ')
    return false
  }

  public async healthz(): Promise<RedisHealthzResponse> {
    const ping = await this.testConnection(true)
    const write = await this.testWrite()
    const read = await this.testRead()
    return {
      ping,
      read: read.test,
      write,
    }
  }
}

export type RedisHealthzServiceType = typeof RedisHealthzService.prototype
