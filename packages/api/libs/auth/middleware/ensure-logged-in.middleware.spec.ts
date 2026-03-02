import type { Request as IRequest, Response as IResponse } from 'express'
import { next } from 'jest-express/lib/next'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { AUTH_TOKEN_NAMES } from '@dx3/models-shared'
import { TEST_EXISTING_USER_ID, TEST_UUID } from '@dx3/test-data'

import { CookeiService } from '../../cookies/cookie.service'
import { HeaderService } from '../../headers/header.service'
import { sendForbiddenWithCode } from '../../http-response/http-responses'
import { ApiLoggingClass } from '../../logger'
import { UserModel } from '../../user/user-api.postgres-model'
import { TokenService } from '../tokens/token.service'
import { ensureLoggedIn, ensureLoggedInMedia } from './ensure-logged-in.middleware'

jest.mock('../../logger', () => require('../../testing/mocks/internal/logger.mock'))
jest.mock('../../cookies/cookie.service.ts')
jest.mock('../../headers/header.service')
jest.mock('../../http-response/http-responses')
jest.mock('../../user/user-api.postgres-model', () => ({
  UserModel: {
    getUserSessionData: jest.fn(),
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

  it('should exist', () => {
    expect(ensureLoggedIn).toBeDefined()
  })

  test('should sendUnauthorized when no authorizaiton header', async () => {
    // arrange
    req.headers = {}
    // act
    await ensureLoggedIn(req, res, next)
    // assert
    expect(logErrorSpy).toHaveBeenCalled()
    expect(sendForbiddenWithCode).toHaveBeenCalled()
  })

  test('should sendUnauthorized when token is invalid', async () => {
    // arrange
    req.headers = {
      authorization: `Bearer ${TEST_UUID}`,
    }
    // act
    await ensureLoggedIn(req, res, next)
    // assert
    expect(logErrorSpy).toHaveBeenCalled()
    expect(sendForbiddenWithCode).toHaveBeenCalled()
  })

  test('should call next when token and user session are valid', async () => {
    const getTokenFromRequestMock = HeaderService.getTokenFromRequest as jest.MockedFunction<
      typeof HeaderService.getTokenFromRequest
    >
    const getUserSessionDataMock = UserModel.getUserSessionData as jest.MockedFunction<
      typeof UserModel.getUserSessionData
    >

    getTokenFromRequestMock.mockReturnValue(accessToken)
    getUserSessionDataMock.mockResolvedValue({
      id: TEST_EXISTING_USER_ID,
    } as never)

    await ensureLoggedIn(req, res, next)

    expect(UserModel.getUserSessionData).toHaveBeenCalledWith(TEST_EXISTING_USER_ID)
    expect(next).toHaveBeenCalled()
    expect(sendForbiddenWithCode).not.toHaveBeenCalled()
  })

  test('should send forbidden when user session lookup throws', async () => {
    const getTokenFromRequestMock = HeaderService.getTokenFromRequest as jest.MockedFunction<
      typeof HeaderService.getTokenFromRequest
    >
    const getUserSessionDataMock = UserModel.getUserSessionData as jest.MockedFunction<
      typeof UserModel.getUserSessionData
    >

    getTokenFromRequestMock.mockReturnValue(accessToken)
    getUserSessionDataMock.mockRejectedValue(new Error('Session lookup failed'))

    await ensureLoggedIn(req, res, next)

    expect(logErrorSpy).toHaveBeenCalled()
    expect(sendForbiddenWithCode).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })
})

describe('ensureLoggedInMedia', () => {
  let req: IRequest
  let res: IResponse
  let refreshToken: string

  beforeEach(() => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse

    const tokens = TokenService.generateTokens(TEST_EXISTING_USER_ID)
    refreshToken = tokens.refreshToken
    req.cookies = {
      [AUTH_TOKEN_NAMES.REFRESH]: refreshToken,
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should call next when refresh token and session are valid', async () => {
    const getCookieMock = CookeiService.getCookie as jest.MockedFunction<
      typeof CookeiService.getCookie
    >
    const getUserSessionDataMock = UserModel.getUserSessionData as jest.MockedFunction<
      typeof UserModel.getUserSessionData
    >

    getCookieMock.mockReturnValue(refreshToken)
    getUserSessionDataMock.mockResolvedValue({
      id: TEST_EXISTING_USER_ID,
    } as never)

    await ensureLoggedInMedia(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(sendForbiddenWithCode).not.toHaveBeenCalled()
  })

  test('should send forbidden when no refresh token cookie exists', async () => {
    const getCookieMock = CookeiService.getCookie as jest.MockedFunction<
      typeof CookeiService.getCookie
    >

    getCookieMock.mockReturnValue('')

    await ensureLoggedInMedia(req, res, next)

    expect(sendForbiddenWithCode).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  test('should send forbidden when refresh token is invalid', async () => {
    const getCookieMock = CookeiService.getCookie as jest.MockedFunction<
      typeof CookeiService.getCookie
    >
    const getUserIdFromRefreshTokenMock =
      TokenService.getUserIdFromRefreshToken as jest.MockedFunction<
        typeof TokenService.getUserIdFromRefreshToken
      >

    getCookieMock.mockReturnValue('not-a-jwt-token')
    getUserIdFromRefreshTokenMock.mockReturnValue('')

    await ensureLoggedInMedia(req, res, next)

    expect(sendForbiddenWithCode).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  test('should send forbidden when user session lookup fails', async () => {
    const getCookieMock = CookeiService.getCookie as jest.MockedFunction<
      typeof CookeiService.getCookie
    >
    const getUserSessionDataMock = UserModel.getUserSessionData as jest.MockedFunction<
      typeof UserModel.getUserSessionData
    >

    getCookieMock.mockReturnValue(refreshToken)
    getUserSessionDataMock.mockRejectedValue(new Error('DB error'))

    await ensureLoggedInMedia(req, res, next)

    expect(sendForbiddenWithCode).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })
})
