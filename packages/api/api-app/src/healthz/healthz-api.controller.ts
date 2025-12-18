import * as process from 'node:process'
import type { Request, Response } from 'express'

import { HEALTHZ_STATUS_ERROR, HEALTHZ_STATUS_OK } from '@dx3/api-libs/healthz/healthz-api.const'
import { HttpHealthzService } from '@dx3/api-libs/healthz/http-healthz-api.service'
import { sendOK } from '@dx3/api-libs/http-response/http-responses'
import { ApiLoggingClass } from '@dx3/api-libs/logger'
import { PostgresDbConnection } from '@dx3/api-libs/pg'
import { RedisHealthzService } from '@dx3/api-libs/redis'
import type {
  HealthzHttpType,
  HealthzMemoryType,
  HealthzPostgresType,
  HealthzRedisType,
  HealthzStatusType,
} from '@dx3/models-shared'

const HttpHealth = {
  getHealth: async (): Promise<HealthzHttpType> => {
    const httpService = new HttpHealthzService()
    return {
      status: await httpService.healthCheck(),
    }
  },
}

const MemoryHealth = {
  getHealth: (): HealthzMemoryType => {
    const usage = process.memoryUsage()
    const status =
      usage.rss && usage.heapTotal && usage.heapUsed && usage.external && usage.arrayBuffers

    return {
      status: status ? HEALTHZ_STATUS_OK : HEALTHZ_STATUS_ERROR,
      usage,
    }
  },
}

const PostgresHealth = {
  getHealth: async (): Promise<HealthzPostgresType> => {
    const dbh = PostgresDbConnection.dbHandle
    try {
      dbh.authenticate()
      return {
        status: HEALTHZ_STATUS_OK,
        version: await dbh.databaseVersion(),
      }
    } catch (err) {
      ApiLoggingClass.instance.logError(err)
    }

    return {
      status: HEALTHZ_STATUS_ERROR,
      version: '',
    }
  },
}

const RedisHealth = {
  getHealth: async (): Promise<HealthzRedisType> => {
    const redisHealths = new RedisHealthzService()
    const result = await redisHealths.healthz()
    const status =
      result.ping && result.read && result.write ? HEALTHZ_STATUS_OK : HEALTHZ_STATUS_ERROR
    return {
      profile: result,
      status,
    }
  },
}

export const HealthzController = {
  getHealth: async (req: Request, res: Response) => {
    const http = await HttpHealth.getHealth()
    const memory = MemoryHealth.getHealth()
    const redis = await RedisHealth.getHealth()
    const postgres = await PostgresHealth.getHealth()

    const apiStatus =
      http.status === HEALTHZ_STATUS_OK &&
      memory.status === HEALTHZ_STATUS_OK &&
      redis.status === HEALTHZ_STATUS_OK &&
      postgres.status === HEALTHZ_STATUS_OK
        ? HEALTHZ_STATUS_OK
        : HEALTHZ_STATUS_ERROR

    const healthz: HealthzStatusType = {
      http,
      memory,
      postgres,
      redis,
      status: apiStatus,
    }

    sendOK(req, res, healthz)
  },
}

export type HealthzControllerType = typeof HealthzController
