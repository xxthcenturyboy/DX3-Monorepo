/**
 * HTTP Response Helpers Tests
 *
 * Unit tests for HTTP response utility functions.
 */

import type { Request as IRequest, Response as IResponse } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { ERROR_CODES } from '@dx3/models-shared'

import { ApiLoggingClass } from '../logger'

jest.unmock('./http-responses')
jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

// Import after jest.unmock
import {
  send400,
  sendBadRequestWithCode,
  sendFile,
  sendForbiddenWithCode,
  sendNotFoundWithCode,
  sendOK,
  sendUnauthorizedWithCode,
} from './http-responses'

describe('HttpResponses', () => {
  let req: IRequest
  let res: IResponse

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    req.url = '/api/test'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('sendOK', () => {
    it('should send a success response with data', () => {
      // arrange
      const data = { test: 'data' }

      // act
      sendOK(req, res, data)

      // assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK)
      expect(res.send).toHaveBeenCalled()
      expect(res.send).toHaveBeenCalledWith(data)
      expect(res.end).toHaveBeenCalled()
    })
  })

  describe('sendFile', () => {
    it('should send a file response', () => {
      // arrange
      const filePath = '/download'
      const fileName = 'test.png'

      // act
      sendFile(req, res, filePath, fileName)

      // assert
      expect(res.download).toHaveBeenCalled()
    })
  })

  describe('send400', () => {
    it('should send response with provided status code', () => {
      // arrange
      const data = {
        message: 'Test error',
        status: StatusCodes.CONFLICT,
      }

      // act
      send400(res, data)

      // assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT)
      expect(res.send).toHaveBeenCalledWith(data)
      expect(res.end).toHaveBeenCalled()
    })

    it('should default to BAD_REQUEST when no status provided', () => {
      // arrange
      const data = { message: 'Test error' }

      // act
      send400(res, data)

      // assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST)
    })
  })

  describe('sendBadRequestWithCode', () => {
    it('should send a 400 response with formatted error code message', () => {
      // arrange
      const code = ERROR_CODES.AUTH_FAILED
      const message = 'Authentication failed.'

      // act
      sendBadRequestWithCode(req, res, code, message)

      // assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST)
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '100 Authentication failed.',
          status: StatusCodes.BAD_REQUEST,
        }),
      )
      expect(res.end).toHaveBeenCalled()
    })

    it('should include description and url in response', () => {
      // arrange
      const code = ERROR_CODES.GENERIC_BAD_REQUEST
      const message = 'Invalid request.'
      req.url = '/api/test-url'

      // act
      sendBadRequestWithCode(req, res, code, message)

      // assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Bad Request',
          url: '/api/test-url',
        }),
      )
    })
  })

  describe('sendUnauthorizedWithCode', () => {
    it('should send a 401 response with formatted error code message', () => {
      // arrange
      const code = ERROR_CODES.AUTH_TOKEN_INVALID
      const message = 'Token invalid or expired.'

      // act
      sendUnauthorizedWithCode(req, res, code, message)

      // assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED)
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '105 Token invalid or expired.',
          status: StatusCodes.UNAUTHORIZED,
        }),
      )
      expect(res.end).toHaveBeenCalled()
    })

    it('should include description in response', () => {
      // arrange
      const code = ERROR_CODES.AUTH_SESSION_EXPIRED
      const message = 'Session expired.'

      // act
      sendUnauthorizedWithCode(req, res, code, message)

      // assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Unauthorized',
        }),
      )
    })
  })

  describe('sendForbiddenWithCode', () => {
    it('should send a 403 response with formatted error code message', () => {
      // arrange
      const code = ERROR_CODES.AUTH_UNAUTHORIZED
      const message = 'Not authorized to access this resource.'

      // act
      sendForbiddenWithCode(req, res, code, message)

      // assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN)
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '106 Not authorized to access this resource.',
          status: StatusCodes.FORBIDDEN,
        }),
      )
      expect(res.end).toHaveBeenCalled()
    })

    it('should include description in response', () => {
      // arrange
      const code = ERROR_CODES.GENERIC_FORBIDDEN
      const message = 'Access denied.'

      // act
      sendForbiddenWithCode(req, res, code, message)

      // assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Forbidden',
        }),
      )
    })
  })

  describe('sendNotFoundWithCode', () => {
    it('should send a 404 response with formatted error code message', () => {
      // arrange
      const code = ERROR_CODES.USER_NOT_FOUND
      const message = 'User not found.'

      // act
      sendNotFoundWithCode(req, res, code, message)

      // assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND)
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '302 User not found.',
          status: StatusCodes.NOT_FOUND,
        }),
      )
      expect(res.end).toHaveBeenCalled()
    })

    it('should include description in response', () => {
      // arrange
      const code = ERROR_CODES.EMAIL_NOT_FOUND
      const message = 'Email not found.'

      // act
      sendNotFoundWithCode(req, res, code, message)

      // assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Not Found',
        }),
      )
    })
  })
})
