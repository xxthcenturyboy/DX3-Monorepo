import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'

import { ShortlinkController } from './shortlink-api.controller'

const mockShortlinkServiceInstance = {
  getShortlinkTarget: jest.fn(),
}

jest.mock('@dx3/api-libs/shortlink/shortlink-api.service', () => ({
  ShortlinkService: jest.fn(() => mockShortlinkServiceInstance),
}))
jest.mock('@dx3/api-libs/http-response/http-responses', () => ({
  sendBadRequest: jest.fn(),
  sendOK: jest.fn(),
}))
jest.mock('@dx3/api-libs/logger/log-request.util', () => ({
  logRequest: jest.fn(),
}))

describe('ShortlinkController', () => {
  let req: IRequest
  let res: IResponse

  beforeEach(() => {
    jest.clearAllMocks()
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    req.params = {}
  })

  it('should exist when imported', () => {
    expect(ShortlinkController).toBeDefined()
  })

  describe('getTarget', () => {
    test('should call sendOK with target on success', async () => {
      // arrange
      const mockResult = { target: 'https://example.com/full-url' }
      mockShortlinkServiceInstance.getShortlinkTarget.mockResolvedValueOnce(mockResult)
      req.params = { id: 'abc123' }
      // act
      await ShortlinkController.getTarget(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    test('should call sendBadRequest when service throws', async () => {
      // arrange
      mockShortlinkServiceInstance.getShortlinkTarget.mockRejectedValueOnce(
        new Error('Shortlink not found'),
      )
      req.params = { id: 'bad-id' }
      // act
      await ShortlinkController.getTarget(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })
})
