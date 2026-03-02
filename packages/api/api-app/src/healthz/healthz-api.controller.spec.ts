import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { HEALTHZ_STATUS_ERROR, HEALTHZ_STATUS_OK } from '@dx3/api-libs/healthz/healthz-api.const'
import { sendOK } from '@dx3/api-libs/http-response/http-responses'

import { HealthzController } from './healthz-api.controller'

jest.mock('@dx3/api-libs/healthz/http-healthz-api.service', () => ({
  HttpHealthzService: jest.fn(() => ({
    healthCheck: jest.fn().mockResolvedValue(HEALTHZ_STATUS_OK),
  })),
}))
jest.mock('@dx3/api-libs/redis', () => ({
  RedisHealthzService: jest.fn(() => ({
    healthz: jest.fn().mockResolvedValue({ ping: true, read: true, write: true }),
  })),
}))
jest.mock('@dx3/api-libs/pg', () => ({
  PostgresDbConnection: {
    dbHandle: {
      authenticate: jest.fn(),
      databaseVersion: jest.fn().mockResolvedValue('16.0'),
    },
  },
}))
jest.mock('@dx3/api-libs/logger', () => ({
  ApiLoggingClass: {
    instance: {
      logError: jest.fn(),
    },
  },
}))
jest.mock('@dx3/api-libs/http-response/http-responses', () => ({
  sendOK: jest.fn(),
}))

describe('HealthzController', () => {
  let req: IRequest
  let res: IResponse

  beforeEach(() => {
    jest.clearAllMocks()
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
  })

  it('should exist when imported', () => {
    expect(HealthzController).toBeDefined()
  })

  it('should have getHealth method', () => {
    expect(HealthzController.getHealth).toBeDefined()
  })

  // ─── getHealth ─────────────────────────────────────────────────────────────

  describe('getHealth', () => {
    it('should call sendOK with overall OK status when all sub-checks pass', async () => {
      // arrange (all mocks default to healthy)
      // act
      await HealthzController.getHealth(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(
        req,
        res,
        expect.objectContaining({
          status: HEALTHZ_STATUS_OK,
        }),
      )
    })

    it('should call sendOK with overall ERROR status when Redis check fails', async () => {
      // arrange
      const { RedisHealthzService } = jest.requireMock('@dx3/api-libs/redis')
      RedisHealthzService.mockImplementationOnce(() => ({
        healthz: jest.fn().mockResolvedValue({ ping: false, read: false, write: false }),
      }))
      // act
      await HealthzController.getHealth(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(
        req,
        res,
        expect.objectContaining({
          status: HEALTHZ_STATUS_ERROR,
        }),
      )
    })

    it('should call sendOK with overall ERROR status when Postgres check fails', async () => {
      // arrange
      const { PostgresDbConnection } = jest.requireMock('@dx3/api-libs/pg')
      PostgresDbConnection.dbHandle.authenticate.mockImplementationOnce(() => {
        throw new Error('Connection refused')
      })
      // act
      await HealthzController.getHealth(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(
        req,
        res,
        expect.objectContaining({
          status: HEALTHZ_STATUS_ERROR,
        }),
      )
    })

    it('should include http, memory, redis, and postgres sub-checks in response', async () => {
      // arrange
      // act
      await HealthzController.getHealth(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(
        req,
        res,
        expect.objectContaining({
          http: expect.objectContaining({ status: expect.any(String) }),
          memory: expect.objectContaining({ status: expect.any(String) }),
          postgres: expect.objectContaining({ status: expect.any(String) }),
          redis: expect.objectContaining({ status: expect.any(String) }),
        }),
      )
    })
  })
})
