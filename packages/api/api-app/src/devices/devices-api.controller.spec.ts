import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { httpResponseMock, mockHttpResponses } from '@dx3/api-libs/http-response/http-response.mock'

import { DevicesController } from './devices-api.controller'

jest.mock('@dx3/api-libs/devices/devices-api.service.ts')

describe('DevicesController', () => {
  let req: IRequest
  let res: IResponse

  beforeAll(() => {
    // Setup centralized mocks
    mockHttpResponses()
  })

  beforeEach(() => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
  })

  afterEach(() => {
    jest.resetAllMocks()
    httpResponseMock.sendOK.mockClear()
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(DevicesController).toBeDefined()
  })

  describe('disconnectDevice', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(DevicesController.disconnectDevice).toBeDefined()
    })
    test('should sendBadRequest when invoked', async () => {
      // arrange
      // act
      await DevicesController.disconnectDevice(req, res)
      // assert
      expect(httpResponseMock.sendOK).toHaveBeenCalled()
    })
  })

  describe('updateFcmToken', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(DevicesController.updateFcmToken).toBeDefined()
    })
    test('should sendBadRequest when invoked', async () => {
      // arrange
      // act
      await DevicesController.updateFcmToken(req, res)
      // assert
      expect(httpResponseMock.sendOK).toHaveBeenCalled()
    })
  })

  describe('updatePublicKey', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(DevicesController.updatePublicKey).toBeDefined()
    })
    test('should sendBadRequest when invoked', async () => {
      // arrange
      // act
      await DevicesController.updatePublicKey(req, res)
      // assert
      expect(httpResponseMock.sendOK).toHaveBeenCalled()
    })
  })
})
