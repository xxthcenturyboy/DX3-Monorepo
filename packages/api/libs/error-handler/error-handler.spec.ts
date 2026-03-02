import type { Request as IRequest, Response as IResponse } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { sendBadRequest, sendForbidden } from '../http-response/http-responses'
import { ApiLoggingClass } from '../logger'
import { handleError } from './error-handler'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('../http-response/http-responses.ts')

describe('handleError', () => {
  let req: IRequest
  let res: IResponse

  const logErrorSpy = jest.spyOn(ApiLoggingClass.prototype, 'logError')

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  it('should exist', () => {
    expect(handleError).toBeDefined()
  })

  it('should log error and send bad request when Error is passed', () => {
    // arrange
    const message = 'test message'
    const error = new Error(message)
    // act
    handleError(req, res, error, message)
    // assert
    expect(logErrorSpy).toHaveBeenCalled()
    expect(sendBadRequest).toHaveBeenCalled()
  })

  it('should send forbidden when error code is FORBIDDEN', () => {
    // arrange
    const message = 'test message'
    const error = {
      code: StatusCodes.FORBIDDEN,
      message,
    }
    // act
    handleError(req, res, error)
    // assert
    expect(sendForbidden).toHaveBeenCalled()
  })

  it('should send bad request when error has code and message', () => {
    const message = 'test message'
    const error = { code: StatusCodes.BAD_REQUEST, message }
    handleError(req, res, error)
    expect(sendBadRequest).toHaveBeenCalled()
  })

  it('should set custom status code when code is provided', () => {
    const mockStatus = jest.spyOn(res, 'status')
    handleError(req, res, new Error('err'), undefined, 500)
    expect(mockStatus).toHaveBeenCalledWith(500)
  })

  it('should default to 400 when no code is provided', () => {
    const mockStatus = jest.spyOn(res, 'status')
    handleError(req, res, new Error('err'))
    expect(mockStatus).toHaveBeenCalledWith(400)
  })

  it('should send bad request with err.message when no override message for Error', () => {
    const error = new Error('raw error message')
    handleError(req, res, error)
    expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'raw error message')
  })

  it('should send bad request with string error when message override is provided', () => {
    handleError(req, res, 'string-error', 'override message')
    expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'override message')
  })

  it('should send bad request with the string itself when no message override', () => {
    handleError(req, res, 'plain string error')
    expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'plain string error')
  })

  it('should send generic bad request when error is not object, Error, or string', () => {
    handleError(req, res, null as never)
    expect(sendBadRequest).toHaveBeenCalledWith(req, res, 'Bad Request')
  })
})
