import dotenv from 'dotenv'

// Load environment variables from .env file (for development)
dotenv.config()

import express from 'express'

import { BlogService } from '@dx3/api-libs/blog/blog-api.service'
import { startBlogScheduler } from '@dx3/api-libs/blog/blog-scheduler.service'
import { ApiLoggingClass } from '@dx3/api-libs/logger'
import { MetricsService } from '@dx3/api-libs/metrics/metrics-api.service'
import { TimescaleConnection } from '@dx3/api-libs/timescale/timescale.connection'
import { LoggingService } from '@dx3/api-libs/timescale/timescale.logging.service'

import { getApiConfig } from './config/config-api'
import { API_APP_NAME } from './config/config-api.consts'
import { DxPostgresDb } from './data/pg/dx-postgres.db'
import { DxRedisCache } from './data/redis/dx-redis.cache'
import { DxS3Class } from './data/s3/dx-s3'
import { DxSocketClass } from './data/sockets/dx-socket.class'
import { configureExpress } from './express'
import { ApiRoutes } from './routes/api.routes'

const app = express()

async function run() {
  const logger = new ApiLoggingClass({ appName: API_APP_NAME })

  const postgres = await DxPostgresDb.getPostgresConnection()
  if (!postgres) {
    logger.logInfo('Failed to instantiate the Postgres DB. Exiting')
    return 1
  }

  const redis = await DxRedisCache.getRedisConnection()
  if (!redis) {
    logger.logInfo('Failed to connect to Redis. Exiting')
    return 1
  }

  const s3 = await DxS3Class.initializeS3()
  if (!s3) {
    logger.logInfo('Failed to instantiate S3')
  }

  // Initialize TimescaleDB for centralized logging and metrics (optional - graceful degradation)
  const timescale = new TimescaleConnection()
  const timescaleConnected = await timescale.initialize()
  if (timescaleConnected) {
    // Initialize LoggingService and MetricsService singletons
    new LoggingService()
    new MetricsService()
    logger.logInfo('TimescaleDB: Connected (centralized logging and metrics enabled)')
  } else {
    logger.logInfo('TimescaleDB: Not connected (centralized logging and metrics disabled)')
  }

  const config = getApiConfig(logger, postgres, redis)

  await configureExpress(app, {
    DEBUG: config.debug,
    SESSION_SECRET: config.sessionSecret,
  })

  const apiRoutes = new ApiRoutes(app)
  apiRoutes.loadRoutes()

  startBlogScheduler(new BlogService())

  const server = app.listen(config.port, config.host, () => {
    logger.logInfo(
      `
============================================================================
                                ${config.appName}
============================================================================
Environment variables:
  Node Env:   ${config.nodeEnv}
  __dirname:  ${__dirname}
  cwd:        ${process.cwd()}

Settings:
  Host:       ${config.host}
  Port:       ${config.port}
  Debug:      ${config.debug}
    `,
    )
    logger.logInfo(`[ ready ] http://${config.host}:${config.port}`)
  })

  DxSocketClass.startSockets(server)
}

run()
