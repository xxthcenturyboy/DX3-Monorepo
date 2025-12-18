import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { sendBadRequest } from '@dx3/api-libs/http-response/http-responses'

import { PhoneController } from './phone-api.controller'

jest.mock('@dx3/api-libs/phone/phone-api.service.ts')
jest.mock('@dx3/api-libs/http-response/http-responses.ts', () => ({
  sendBadRequest: jest.fn(),
  sendOK: jest.fn(),
}))

describe('PhoneController', () => {
  let req: IRequest
  let res: IResponse

  beforeEach(() => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(PhoneController).toBeDefined()
  })

  describe('createPhone', () => {
    test('should call sendBadRequest when sent without proper payload', async () => {
      // arrange
      // act
      // assert
      try {
        expect(await PhoneController.createPhone(req, res)).toThrow()
      } catch (_err) {
        expect(sendBadRequest).toHaveBeenCalled()
      }
    })
  })

  describe('updatePhone', () => {
    test('should call sendBadRequest when sent without proper params', async () => {
      // arrange
      // act
      // assert
      try {
        expect(await PhoneController.updatePhone(req, res)).toThrow()
      } catch (_err) {
        expect(sendBadRequest).toHaveBeenCalled()
      }
    })
  })

  describe('deletePhone', () => {
    test('should call sendBadRequest when sent without proper query params', async () => {
      // arrange
      // act
      // assert
      try {
        expect(await PhoneController.deletePhone(req, res)).toThrow()
      } catch (_err) {
        expect(sendBadRequest).toHaveBeenCalled()
      }
    })
  })
})
