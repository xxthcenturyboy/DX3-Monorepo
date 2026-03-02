import type { Request as IRequest, Response as IResponse } from 'express'
import { next } from 'jest-express/lib/next'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { USER_ROLE } from '@dx3/models-shared'
import { TEST_EXISTING_USER_ID, TEST_UUID } from '@dx3/test-data'

import { CookeiService } from '../../cookies/cookie.service'
import { HeaderService } from '../../headers/header.service'
import { sendUnauthorized } from '../../http-response/http-responses'
import { ApiLoggingClass } from '../../logger'
import { UserModel } from '../../user/user-api.postgres-model'
import { TokenService } from '../tokens/token.service'
import {
  hasAdminRole,
  hasEditorRole,
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
jest.mock('../../user/user-api.postgres-model', () => ({
  UserModel: {
    getUserRoles: jest.fn(),
    userHasRole: jest.fn(),
  },
}))

describe('ensureLoggedIn', () => {
  let req: IRequest
  let res: IResponse
  let accessToken: string

  const logErrorSpy = jest.spyOn(ApiLoggingClass.prototype, 'logError')

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(async () => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    req.url = 'http://test-url.com'
    const tokens = TokenService.generateTokens(TEST_EXISTING_USER_ID)
    accessToken = tokens.accessToken
    CookeiService.setCookies(res, true, tokens.refreshToken, tokens.refreshTokenExp)
    req.cookies = {
      refresh: tokens.refreshToken,
      token: tokens.accessToken,
    }
    req.headers = {
      authorization: `Bearer ${tokens.accessToken}`,
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
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

    test('should call next when user is super admin', async () => {
      const getTokenFromRequestMock = HeaderService.getTokenFromRequest as jest.MockedFunction<
        typeof HeaderService.getTokenFromRequest
      >
      const userHasRoleMock = UserModel.userHasRole as jest.MockedFunction<
        typeof UserModel.userHasRole
      >

      getTokenFromRequestMock.mockReturnValue(accessToken)
      userHasRoleMock.mockResolvedValueOnce(true)

      await hasAdminRole(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(sendUnauthorized).not.toHaveBeenCalled()
    })

    test('should call next when user is admin but not super admin', async () => {
      const getTokenFromRequestMock = HeaderService.getTokenFromRequest as jest.MockedFunction<
        typeof HeaderService.getTokenFromRequest
      >
      const userHasRoleMock = UserModel.userHasRole as jest.MockedFunction<
        typeof UserModel.userHasRole
      >

      getTokenFromRequestMock.mockReturnValue(accessToken)
      userHasRoleMock.mockResolvedValueOnce(false).mockResolvedValueOnce(true)

      await hasAdminRole(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(sendUnauthorized).not.toHaveBeenCalled()
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

    test('should call next when user has super admin role', async () => {
      const userHasRoleMock = UserModel.userHasRole as jest.MockedFunction<
        typeof UserModel.userHasRole
      >

      userHasRoleMock.mockResolvedValueOnce(true)

      await hasSuperAdminRole(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(sendUnauthorized).not.toHaveBeenCalled()
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

    test('should return true when UserModel.userHasRole resolves true', async () => {
      const userHasRoleMock = UserModel.userHasRole as jest.MockedFunction<
        typeof UserModel.userHasRole
      >
      userHasRoleMock.mockResolvedValueOnce(true)

      const hasRole = await userHasRole(TEST_EXISTING_USER_ID, USER_ROLE.ADMIN)

      expect(hasRole).toBe(true)
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

    test('should return true when user has required role or higher', async () => {
      const getUserRolesMock = UserModel.getUserRoles as jest.MockedFunction<
        typeof UserModel.getUserRoles
      >
      getUserRolesMock.mockResolvedValueOnce([USER_ROLE.SUPER_ADMIN])

      const hasRole = await userHasRoleOrHigher(TEST_EXISTING_USER_ID, USER_ROLE.LOGGING_ADMIN)

      expect(hasRole).toBe(true)
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

    test('should call next when user has logging admin role', async () => {
      const getTokenFromRequestMock = HeaderService.getTokenFromRequest as jest.MockedFunction<
        typeof HeaderService.getTokenFromRequest
      >
      const getUserRolesMock = UserModel.getUserRoles as jest.MockedFunction<
        typeof UserModel.getUserRoles
      >

      getTokenFromRequestMock.mockReturnValue(accessToken)
      getUserRolesMock.mockResolvedValueOnce([USER_ROLE.LOGGING_ADMIN])

      await hasLoggingAdminRole(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(sendUnauthorized).not.toHaveBeenCalled()
    })
  })

  describe('hasEditorRole', () => {
    it('should exist', () => {
      expect(hasEditorRole).toBeDefined()
    })

    test('should call next when user has editor role', async () => {
      const getTokenFromRequestMock = HeaderService.getTokenFromRequest as jest.MockedFunction<
        typeof HeaderService.getTokenFromRequest
      >
      const getUserRolesMock = UserModel.getUserRoles as jest.MockedFunction<
        typeof UserModel.getUserRoles
      >

      getTokenFromRequestMock.mockReturnValue(accessToken)
      getUserRolesMock.mockResolvedValueOnce([USER_ROLE.EDITOR])

      await hasEditorRole(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(sendUnauthorized).not.toHaveBeenCalled()
    })

    test('should sendUnauthorized when user lacks editor role', async () => {
      const getTokenFromRequestMock = HeaderService.getTokenFromRequest as jest.MockedFunction<
        typeof HeaderService.getTokenFromRequest
      >
      const getUserRolesMock = UserModel.getUserRoles as jest.MockedFunction<
        typeof UserModel.getUserRoles
      >

      getTokenFromRequestMock.mockReturnValue(accessToken)
      getUserRolesMock.mockResolvedValueOnce([USER_ROLE.USER])

      await hasEditorRole(req, res, next)

      expect(sendUnauthorized).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
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

    test('should call next when user has metrics admin role', async () => {
      const getTokenFromRequestMock = HeaderService.getTokenFromRequest as jest.MockedFunction<
        typeof HeaderService.getTokenFromRequest
      >
      const getUserRolesMock = UserModel.getUserRoles as jest.MockedFunction<
        typeof UserModel.getUserRoles
      >

      getTokenFromRequestMock.mockReturnValue(accessToken)
      getUserRolesMock.mockResolvedValueOnce([USER_ROLE.METRICS_ADMIN])

      await hasMetricsAdminRole(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(sendUnauthorized).not.toHaveBeenCalled()
    })
  })
})
