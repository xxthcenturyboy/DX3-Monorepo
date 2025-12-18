// process.env.NODE_ENV = process.env.NODE_ENV || 'test'
// process.env.JWT_SECRET = process.env.JWT_SECRET || 'some-string'
// process.env.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'SG.secret'
// process.env.SENDGRID_URL = process.env.SENDGRID_URL || 'http://sendgrid:3000'
// process.env.SESSION_SECRET = process.env.SESSION_SECRET || '0123456789'
// process.env.HOST = process.env.HOST || 'http://localhost'
// process.env.REDIS_PORT = process.env.REDIS_PORT || '6379'
// process.env.REDIS_URL = process.env.REDIS_URL || 'redis://redis-dx3'
// process.env.WEB_URL = process.env.WEB_URL || 'http://localhost:3000'
// process.env.PORT = process.env.PORT || '4000'
// process.env.POSTGRES_URI = process.env.POSTGRES_URI || 'postgres://user:pass@localhost:5432/dx_test'

import type { Sequelize } from 'sequelize-typescript'

import { ApiLoggingClass } from '@dx3/api-libs/logger'
import { PostgresDbConnection } from '@dx3/api-libs/pg'
import { RedisService } from '@dx3/api-libs/redis'
import { ShortLinkModel } from '@dx3/api-libs/shortlink/shortlink-api.postgres-model'
import { APP_PREFIX } from '@dx3/models-shared'

import { getApiConfig, getRedisConfig } from './config-api'
import { API_APP_NAME, POSTGRES_URI, SENDGRID_API_KEY, SENDGRID_URL } from './config-api.consts'

jest.mock('@dx3/api-libs/logger', () => require('@dx3/api-libs/testing/mocks/internal/logger.mock'))
jest.mock('@dx3/api-libs/redis', () => require('@dx3/api-libs/testing/mocks/internal/redis.mock'))
jest.mock('@dx3/api-libs/pg', () => require('@dx3/api-libs/testing/mocks/internal/pg.mock'))

describe('getApiConfig', () => {
  let db: Sequelize
  let redis: RedisService

  beforeAll(async () => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
    const connection = new PostgresDbConnection({
      models: [ShortLinkModel],
      postgresUri: POSTGRES_URI,
    })
    await connection.initialize()
    db = PostgresDbConnection.dbHandle
    redis = new RedisService({
      isLocal: true,
      redis: {
        port: 6379,
        prefix: 'dx',
        url: 'redis://redis',
      },
    })
  })

  afterAll(async () => {
    jest.clearAllMocks()
    await db?.close()
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(getApiConfig).toBeDefined()
  })
  it('should have correct values', () => {
    // arrange
    // act
    const config = getApiConfig(ApiLoggingClass.instance, db, redis)
    // console.log('Config:', config)
    // assert
    expect(config.appName).toEqual(API_APP_NAME)
    expect(config.auth).toEqual({ jwtSecret: process.env.JWT_SECRET })
    expect(config.logger).toBeDefined()
    expect(config.nodeEnv).toEqual(process.env.NODE_ENV)
    expect(config.postgresDbh).toBeDefined()
    expect(config.redis).toBeDefined()
    expect(config.sendgrid).toEqual({ apiKey: SENDGRID_API_KEY, url: SENDGRID_URL })
    expect(config.sessionSecret).toEqual(process.env.SESSION_SECRET)
  })
})

describe('getRedisConfig', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(getRedisConfig).toBeDefined()
  })
  it('should have the correct values', () => {
    // arrange
    // act
    const settings = getRedisConfig()
    // assert
    expect(settings.port).toEqual(process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379)
    expect(settings.prefix).toEqual(APP_PREFIX)
    expect(settings.url).toContain(process.env.REDIS_URL)
  })
})
