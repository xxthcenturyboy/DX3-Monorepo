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
  endpointNotFound,
  send400,
  sendBadRequest,
  sendBadRequestWithCode,
  sendFile,
  sendForbidden,
  sendForbiddenWithCode,
  sendMethodNotAllowed,
  sendNoContent,
  sendNotFound,
  sendNotFoundWithCode,
  sendOK,
  sendServiceUnavailable,
  sendTooManyRequests,
  sendUnauthorized,
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
      const data = { test: 'data' }
      sendOK(req, res, data)
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK)
      expect(res.send).toHaveBeenCalled()
      expect(res.send).toHaveBeenCalledWith(data)
      expect(res.end).toHaveBeenCalled()
    })
  })

  describe('sendNoContent', () => {
    it('should send a 204 No Content response', () => {
      sendNoContent(req, res, null)
      expect(res.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT)
      expect(res.send).toHaveBeenCalledWith(null)
      expect(res.end).toHaveBeenCalled()
    })
  })

  describe('sendFile', () => {
    it('should invoke res.download with the correct path and fileName', () => {
      const filePath = '/tmp/file.png'
      const fileName = 'test.png'
      sendFile(req, res, filePath, fileName)
      expect(res.download).toHaveBeenCalledWith(filePath, fileName, expect.any(Function))
    })

    it('should log an error when res.download callback receives an error', () => {
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')
      const fileName = 'test.png'
      const downloadError = new Error('disk read failure')
      // Simulate res.download invoking its callback with an error
      ;(res.download as jest.Mock).mockImplementationOnce(
        (_path: string, _name: string, cb: (err?: Error) => void) => {
          cb(downloadError)
        },
      )
      sendFile(req, res, '/tmp/file.png', fileName)
      expect(logErrorSpy).toHaveBeenCalledWith('Send file error', downloadError)
    })

    it('should log info when res.download callback succeeds (no error)', () => {
      const logInfoSpy = jest.spyOn(ApiLoggingClass.instance, 'logInfo')
      const fileName = 'success.pdf'
      ;(res.download as jest.Mock).mockImplementationOnce(
        (_path: string, _name: string, cb: (err?: Error) => void) => {
          cb(undefined)
        },
      )
      sendFile(req, res, '/tmp/file.pdf', fileName)
      expect(logInfoSpy).toHaveBeenCalledWith(`File sent to client: ${fileName}`)
    })
  })

  describe('sendMethodNotAllowed', () => {
    it('should send a 405 Method Not Allowed response', () => {
      const logWarnSpy = jest.spyOn(ApiLoggingClass.instance, 'logWarn')
      sendMethodNotAllowed(req, res, 'Method not allowed.')
      expect(logWarnSpy).toHaveBeenCalledWith(expect.stringContaining('No Method'))
      expect(res.status).toHaveBeenCalledWith(StatusCodes.METHOD_NOT_ALLOWED)
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Method not allowed.',
          status: StatusCodes.METHOD_NOT_ALLOWED,
        }),
      )
    })
  })

  describe('sendTooManyRequests', () => {
    it('should send a 429 Too Many Requests response', () => {
      const logWarnSpy = jest.spyOn(ApiLoggingClass.instance, 'logWarn')
      sendTooManyRequests(req, res, 'Rate limit exceeded.')
      expect(logWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Too many requests'))
      expect(res.status).toHaveBeenCalledWith(StatusCodes.TOO_MANY_REQUESTS)
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Rate limit exceeded.',
          status: StatusCodes.TOO_MANY_REQUESTS,
        }),
      )
    })
  })

  describe('endpointNotFound', () => {
    it('should send a 405 response for missing endpoints', () => {
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')
      const next = jest.fn()
      endpointNotFound(req, res, next)
      expect(logErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Endpoint not found'))
      expect(res.status).toHaveBeenCalledWith(StatusCodes.METHOD_NOT_ALLOWED)
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'API endpoint not found.',
        }),
      )
    })
  })

  describe('sendBadRequest', () => {
    it('should send a 400 response when given a string error', () => {
      sendBadRequest(req, res, 'Something went wrong.')
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST)
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Something went wrong.',
          status: StatusCodes.BAD_REQUEST,
        }),
      )
    })

    it('should send a 400 response when given an Error object', () => {
      sendBadRequest(req, res, new Error('Validation error'))
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST)
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Validation error', status: StatusCodes.BAD_REQUEST }),
      )
    })
  })

  describe('sendUnauthorized', () => {
    it('should send a 401 response and log the url', () => {
      const logWarnSpy = jest.spyOn(ApiLoggingClass.instance, 'logWarn')
      sendUnauthorized(req, res, 'Not authenticated.')
      expect(logWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Unauthorized'))
      expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED)
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Not authenticated.',
          status: StatusCodes.UNAUTHORIZED,
        }),
      )
    })

    it('should fallback to "unavailable" when req.user is absent', () => {
      const logWarnSpy = jest.spyOn(ApiLoggingClass.instance, 'logWarn')
      // req.user is undefined by default in jest-express Request
      sendUnauthorized(req, res, 'No user context.')
      expect(logWarnSpy).toHaveBeenCalledWith(expect.stringContaining('unavailable'))
    })
  })

  describe('sendForbidden', () => {
    it('should send a 403 response', () => {
      const logWarnSpy = jest.spyOn(ApiLoggingClass.instance, 'logWarn')
      sendForbidden(req, res, 'Access denied.')
      expect(logWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Forbidden'))
      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN)
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Access denied.', status: StatusCodes.FORBIDDEN }),
      )
    })

    it('should fallback to "unavailable" when req.user is absent', () => {
      const logWarnSpy = jest.spyOn(ApiLoggingClass.instance, 'logWarn')
      sendForbidden(req, res, 'No user context.')
      expect(logWarnSpy).toHaveBeenCalledWith(expect.stringContaining('unavailable'))
    })
  })

  describe('sendNotFound', () => {
    it('should send a 404 response', () => {
      const logWarnSpy = jest.spyOn(ApiLoggingClass.instance, 'logWarn')
      sendNotFound(req, res, 'Resource not found.')
      expect(logWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Not Found'))
      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND)
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Resource not found.', status: StatusCodes.NOT_FOUND }),
      )
    })
  })

  describe('sendServiceUnavailable', () => {
    it('should send a 503 response', () => {
      const logWarnSpy = jest.spyOn(ApiLoggingClass.instance, 'logWarn')
      sendServiceUnavailable(req, res, 'Service unavailable.')
      expect(logWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Service Unavailable'))
      expect(res.status).toHaveBeenCalledWith(StatusCodes.SERVICE_UNAVAILABLE)
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Service unavailable.',
          status: StatusCodes.SERVICE_UNAVAILABLE,
        }),
      )
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
