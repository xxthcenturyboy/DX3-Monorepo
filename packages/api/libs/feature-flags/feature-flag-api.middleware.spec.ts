import type { Request as IRequest, Response as IResponse } from 'express'
import { next } from 'jest-express/lib/next'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { ERROR_CODES, FEATURE_FLAG_NAMES } from '@dx3/models-shared'

import { sendForbiddenWithCode } from '../http-response/http-responses'
import { ApiLoggingClass } from '../logger'
import { FeatureFlagService } from './feature-flag-api.service'
import { requireFeatureFlag } from './feature-flag-api.middleware'

jest.mock('../http-response/http-responses')
jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('./feature-flag-api.service')

describe('requireFeatureFlag', () => {
  let req: IRequest
  let res: IResponse

  const evaluateFlagMock = jest.fn()

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    ;(FeatureFlagService as jest.Mock).mockImplementation(() => ({
      evaluateFlag: evaluateFlagMock,
    }))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(requireFeatureFlag).toBeDefined()
  })

  test('should call next when flag is enabled', async () => {
    // arrange
    evaluateFlagMock.mockResolvedValue(true)
    const middleware = requireFeatureFlag(FEATURE_FLAG_NAMES.BLOG)
    // act
    await middleware(req, res, next)
    // assert
    expect(next).toHaveBeenCalled()
  })

  test('should sendForbiddenWithCode when flag is disabled', async () => {
    // arrange
    evaluateFlagMock.mockResolvedValue(false)
    const middleware = requireFeatureFlag(FEATURE_FLAG_NAMES.BLOG)
    // act
    await middleware(req, res, next)
    // assert
    expect(sendForbiddenWithCode).toHaveBeenCalledWith(
      req,
      res,
      ERROR_CODES.FEATURE_FLAG_DISABLED,
      expect.stringContaining(FEATURE_FLAG_NAMES.BLOG),
    )
  })
})
