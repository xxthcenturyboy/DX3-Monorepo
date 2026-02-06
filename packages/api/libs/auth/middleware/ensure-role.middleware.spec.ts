import type { Request as IRequest, Response as IResponse } from 'express'
import { next } from 'jest-express/lib/next'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { USER_ROLE } from '@dx3/models-shared'
import { TEST_EXISTING_USER_ID, TEST_UUID } from '@dx3/test-data'

import { CookeiService } from '../../cookies/cookie.service'
import { sendUnauthorized } from '../../http-response/http-responses'
import { ApiLoggingClass } from '../../logger'
import { TokenService } from '../tokens/token.service'
import {
  hasAdminRole,
  hasLoggingAdminRole,
  hasMetricsAdminRole,
  hasSuperAdminRole,
  userHasRole,
  userHasRoleOrHigher,
} from './ensure-role.middleware'

jest.mock('../../logger', () => require('../../testing/mocks/internal/logger.mock'))
jest.mock('../../cookies/cookie.service.ts')
jest.mock('../../headers/header.service')
jest.mock('../../http-response/http-responses')
jest.mock('../../user/user-api.postgres-model')

describe('ensureLoggedIn', () => {
  let req: IRequest
  let res: IResponse

  const logErrorSpy = jest.spyOn(ApiLoggingClass.prototype, 'logError')

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(async () => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    req.url = 'http://test-url.com'
    const tokens = TokenService.generateTokens(TEST_EXISTING_USER_ID)
    CookeiService.setCookies(res, true, tokens.refreshToken, tokens.refreshTokenExp)
    req.cookies = {
      refresh: tokens.refreshToken,
      token: tokens.accessToken,
    }
    req.headers = {
      authorization: `Bearer ${tokens.accessToken}`,
    }
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  describe('hasAdminRole', () => {
    it('should exist', () => {
      expect(hasAdminRole).toBeDefined()
    })

    test('should sendUnauthorized when no authorizaiton header', async () => {
      // arrange
      req.headers = {}
      // act
      await hasAdminRole(req, res, next)
      // assert
      expect(logErrorSpy).toHaveBeenCalled()
      expect(sendUnauthorized).toHaveBeenCalled()
    })

    test('should sendUnauthorized when token is invalid', async () => {
      // arrange
      req.headers = {
        authorization: `Bearer ${TEST_UUID}`,
      }
      // act
      await hasAdminRole(req, res, next)
      // assert
      expect(logErrorSpy).toHaveBeenCalled()
      expect(sendUnauthorized).toHaveBeenCalled()
    })
  })

  describe('hasSuperAdminRole', () => {
    it('should exist', () => {
      expect(hasSuperAdminRole).toBeDefined()
    })

    test('should sendUnauthorized when no authorizaiton header', async () => {
      // arrange
      req.headers = {}
      // act
      await hasSuperAdminRole(req, res, next)
      // assert
      expect(logErrorSpy).toHaveBeenCalled()
      expect(sendUnauthorized).toHaveBeenCalled()
    })

    test('should sendUnauthorized when token is invalid', async () => {
      // arrange
      req.headers = {
        authorization: `Bearer ${TEST_UUID}`,
      }
      // act
      await hasSuperAdminRole(req, res, next)
      // assert
      expect(logErrorSpy).toHaveBeenCalled()
      expect(sendUnauthorized).toHaveBeenCalled()
    })
  })

  describe('userHasRole', () => {
    it('should exist', () => {
      expect(userHasRole).toBeDefined()
    })

    test('should return false when userId does not exist', async () => {
      // arrange
      // act
      const hasRole = await userHasRole('notValidId', USER_ROLE.ADMIN)
      // assert
      expect(hasRole).toBeFalsy()
    })
  })

  describe('userHasRoleOrHigher', () => {
    it('should exist', () => {
      expect(userHasRoleOrHigher).toBeDefined()
    })

    test('should return false when userId does not exist', async () => {
      // arrange
      // act
      const hasRole = await userHasRoleOrHigher('notValidId', USER_ROLE.LOGGING_ADMIN)
      // assert
      expect(hasRole).toBeFalsy()
    })
  })

  describe('hasLoggingAdminRole', () => {
    it('should exist', () => {
      expect(hasLoggingAdminRole).toBeDefined()
    })

    test('should sendUnauthorized when no authorization header', async () => {
      // arrange
      req.headers = {}
      // act
      await hasLoggingAdminRole(req, res, next)
      // assert
      expect(logErrorSpy).toHaveBeenCalled()
      expect(sendUnauthorized).toHaveBeenCalled()
    })

    test('should sendUnauthorized when token is invalid', async () => {
      // arrange
      req.headers = {
        authorization: `Bearer ${TEST_UUID}`,
      }
      // act
      await hasLoggingAdminRole(req, res, next)
      // assert
      expect(logErrorSpy).toHaveBeenCalled()
      expect(sendUnauthorized).toHaveBeenCalled()
    })
  })

  describe('hasMetricsAdminRole', () => {
    it('should exist', () => {
      expect(hasMetricsAdminRole).toBeDefined()
    })

    test('should sendUnauthorized when no authorization header', async () => {
      // arrange
      req.headers = {}
      // act
      await hasMetricsAdminRole(req, res, next)
      // assert
      expect(logErrorSpy).toHaveBeenCalled()
      expect(sendUnauthorized).toHaveBeenCalled()
    })

    test('should sendUnauthorized when token is invalid', async () => {
      // arrange
      req.headers = {
        authorization: `Bearer ${TEST_UUID}`,
      }
      // act
      await hasMetricsAdminRole(req, res, next)
      // assert
      expect(logErrorSpy).toHaveBeenCalled()
      expect(sendUnauthorized).toHaveBeenCalled()
    })
  })
})
