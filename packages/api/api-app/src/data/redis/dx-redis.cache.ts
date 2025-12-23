import { ApiLoggingClass } from '@dx3/api-libs/logger'
import { RedisHealthzService, RedisService, type RedisServiceType } from '@dx3/api-libs/redis'

import { getRedisConfig } from '../../config/config-api'
import { isDev } from '../../config/config-api.service'

export class DxRedisCache {
  public static async getRedisConnection(): Promise<RedisServiceType | null> {
    const logger = ApiLoggingClass.instance
    const redisConfig = getRedisConfig()

    try {
      new RedisService({
        isDev: isDev(),
        redis: redisConfig,
      })

      const healthz = new RedisHealthzService()

      await healthz.healthCheck()

      return RedisService.instance
    } catch (err) {
      logger.logError((err as Error).message, err)
      return null
    }
  }
}
