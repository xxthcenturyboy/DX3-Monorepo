import type { Sequelize } from 'sequelize-typescript'

import { APP_PREFIX, LOCAL_ENV_NAME } from '@dx3/models-shared'

import type { ApiLoggingClassType } from '../logger'
import type { RedisConfigType, RedisServiceType } from '../redis'
import { API_APP_NAME, SENDGRID_API_KEY, SENDGRID_URL } from './config-api.consts'
import { getEnvironment, isDebug, isLocal } from './config-api.service'
import type { ApiConfigType } from './config-api.type'

export function getRedisConfig(): RedisConfigType {
  const env = getEnvironment()
  const _nodeEnv = env.NODE_ENV || LOCAL_ENV_NAME

  return {
    port: Number(env.REDIS_PORT) || 6379,
    prefix: `${APP_PREFIX}`,
    url: env.REDIS_URL || '',
  }
}

export function getApiConfig(
  logger: ApiLoggingClassType,
  postgresDbh: typeof Sequelize.prototype,
  redisService: RedisServiceType,
): ApiConfigType {
  const env = getEnvironment()

  const nodeEnv = env.NODE_ENV || LOCAL_ENV_NAME
  const host = isLocal() ? '0.0.0.0' : env.API_URL

  return {
    appName: API_APP_NAME,
    auth: {
      jwtSecret: env.JWT_SECRET || '',
    },
    debug: isDebug(),
    host: host || '',
    isLocal: nodeEnv === LOCAL_ENV_NAME,
    logger: logger,
    nodeEnv: nodeEnv,
    port: Number(env.API_PORT),
    postgresDbh: postgresDbh,
    redis: redisService,
    sendgrid: {
      apiKey: SENDGRID_API_KEY,
      url: SENDGRID_URL,
    },
    sessionSecret: env.SESSION_SECRET || '',
    webUrl: `${env.WEB_APP_URL}:${env.WEB_APP_PORT}`,
  }
}
