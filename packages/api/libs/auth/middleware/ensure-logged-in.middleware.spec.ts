import type { Request as IRequest, Response as IResponse } from 'express'
import { next } from 'jest-express/lib/next'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { TEST_EXISTING_USER_ID, TEST_UUID } from '@dx3/test-data'

import { CookeiService } from '../../cookies/cookie.service'
import { sendForbiddenWithCode } from '../../http-response/http-responses'
import { ApiLoggingClass } from '../../logger'
import { TokenService } from '../tokens/token.service'
import { ensureLoggedIn } from './ensure-logged-in.middleware'

jest.mock('../../logger', () => require('../../testing/mocks/internal/logger.mock'))
jest.mock('../../cookies/cookie.service.ts')
jest.mock('../../headers/header.service')
jest.mock('../../http-response/http-responses')

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
})
