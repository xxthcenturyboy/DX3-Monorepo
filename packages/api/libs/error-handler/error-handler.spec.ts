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
    // arrange
    const message = 'test message'
    const error = {
      code: StatusCodes.BAD_REQUEST,
      message,
    }
    // act
    handleError(req, res, error)
    // assert
    expect(sendBadRequest).toHaveBeenCalled()
  })
})
