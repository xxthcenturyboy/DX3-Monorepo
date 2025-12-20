import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { cookieServiceMock, mockCookieService } from '@dx3/api-libs/cookies/cookie.service.mock'
import { httpResponseMock, mockHttpResponses } from '@dx3/api-libs/http-response/http-response.mock'
import { ApiLoggingClass } from '@dx3/api-libs/logger'
import type { LoginPayloadType } from '@dx3/models-shared'
import { TEST_AUTH_PASSWORD, TEST_EMAIL } from '@dx3/test-data'

import { AuthController } from './auth-api.controller'

jest.mock('@dx3/api-libs/auth/auth-api.service.ts')
jest.mock('@dx3/api-libs/auth/tokens/token.service.ts')
jest.mock('@dx3/api-libs/logger', () => require('@dx3/api-libs/testing/mocks/internal/logger.mock'))

// This test file contains ONLY unit tests for the controller layer
describe('AuthController', () => {
  let req: IRequest
  let res: IResponse

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Testing' })
    // Setup centralized mocks
    mockHttpResponses()
    mockCookieService()
  })

  beforeEach(() => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
  })

  afterEach(() => {
    // Reset mock call history between tests
    httpResponseMock.sendOK.mockClear()
    httpResponseMock.sendBadRequest.mockClear()
    httpResponseMock.sendUnauthorized.mockClear()
    cookieServiceMock.clearCookie.mockClear()
    cookieServiceMock.clearCookies.mockClear()
    cookieServiceMock.getCookie.mockClear()
    cookieServiceMock.setCookie.mockClear()
    cookieServiceMock.setCookies.mockClear()
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(AuthController).toBeDefined()
  })

  it('should have authLookup method when instantiated', () => {
    // arrange
    // act
    // assert
    expect(AuthController.authLookup).toBeDefined()
  })

  describe('login', () => {
    test('should httpResponseMock.sendBadRequest when invoked', async () => {
      // arrange
      const body: LoginPayloadType = {
        password: TEST_AUTH_PASSWORD,
        value: TEST_EMAIL,
      }
      req.body = body
      // act
      await AuthController.login(req, res)
      // assert
      expect(httpResponseMock.sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    test('should httpResponseMock.sendOK when invoked', async () => {
      // arrange
      // act
      await AuthController.logout(req, res)
      // assert
      expect(httpResponseMock.sendOK).toHaveBeenCalled()
    })
  })

  describe('rejectDevice', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(AuthController.rejectDevice).toBeDefined()
    })
    test('should rejectDevice when invoked', async () => {
      // arrange
      // act
      await AuthController.rejectDevice(req, res)
      // assert
      expect(httpResponseMock.sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('refreshTokens', () => {
    test('should httpResponseMock.sendUnauthorized when invoked', async () => {
      // arrange
      req.cookies = {
        refresh: 'test-refresh-token',
      }
      // act
      await AuthController.refreshTokens(req, res)
      // assert
      expect(httpResponseMock.sendUnauthorized).toHaveBeenCalled()
    })
  })

  describe('sendOtpToEmail', () => {
    test('should sendOk when invoked', async () => {
      // arrange
      req.body = { email: TEST_EMAIL }
      // act
      await AuthController.sendOtpToEmail(req, res)
      // assert
      expect(httpResponseMock.sendOK).toHaveBeenCalled()
    })
  })

  describe('sendOtpToPhone', () => {
    test('should sendOk when invoked', async () => {
      // arrange
      req.body = { email: TEST_EMAIL }
      // act
      await AuthController.sendOtpToPhone(req, res)
      // assert
      expect(httpResponseMock.sendOK).toHaveBeenCalled()
    })
  })

  describe('validateEmail', () => {
    test('should sendOk when invoked', async () => {
      // arrange
      const query = {
        token:
          '413c78fb890955a86d3971828dd05a9b2d844e44d8a30d406f80bf6e79612bb97e8b3b5834c8dbebdf5c4dadc767a579',
      }
      req.query = query
      // act
      await AuthController.validateEmail(req, res)
      // assert
      expect(httpResponseMock.sendOK).toHaveBeenCalled()
    })
  })
})
