import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'

import { PhoneController } from './phone-api.controller'

const mockPhoneServiceInstance = {
  createPhone: jest.fn(),
  deletePhone: jest.fn(),
  isPhoneAvailableAndValid: jest.fn(),
  updatePhone: jest.fn(),
}

jest.mock('@dx3/api-libs/phone/phone-api.service', () => ({
  PhoneService: jest.fn(() => mockPhoneServiceInstance),
}))
jest.mock('@dx3/api-libs/http-response/http-responses', () => ({
  sendBadRequest: jest.fn(),
  sendOK: jest.fn(),
}))
jest.mock('@dx3/api-libs/logger/log-request.util', () => ({
  logRequest: jest.fn(),
}))

describe('PhoneController', () => {
  let req: IRequest
  let res: IResponse

  beforeEach(() => {
    jest.clearAllMocks()
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    req.params = {}
    req.body = {}
  })

  it('should exist when imported', () => {
    expect(PhoneController).toBeDefined()
  })

  // ─── checkAvailability ─────────────────────────────────────────────────────

  describe('checkAvailability', () => {
    it('should call sendOK with isAvailable true on success', async () => {
      // arrange
      mockPhoneServiceInstance.isPhoneAvailableAndValid.mockResolvedValueOnce(undefined)
      req.body = { phone: '+15551234567', regionCode: 'US' }
      // act
      await PhoneController.checkAvailability(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, { isAvailable: true })
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockPhoneServiceInstance.isPhoneAvailableAndValid.mockRejectedValueOnce(
        new Error('Phone taken'),
      )
      req.body = { phone: '+15551234567', regionCode: 'US' }
      // act
      await PhoneController.checkAvailability(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── createPhone ───────────────────────────────────────────────────────────

  describe('createPhone', () => {
    it('should call sendOK with created phone on success', async () => {
      // arrange
      const mockResult = { id: 'phone-1', value: '+15551234567' }
      mockPhoneServiceInstance.createPhone.mockResolvedValueOnce(mockResult)
      req.body = { phone: '+15551234567', userId: 'user-1' }
      // act
      await PhoneController.createPhone(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockPhoneServiceInstance.createPhone.mockRejectedValueOnce(new Error('Duplicate phone'))
      req.body = { phone: '+15551234567' }
      // act
      await PhoneController.createPhone(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── updatePhone ───────────────────────────────────────────────────────────

  describe('updatePhone', () => {
    it('should call sendOK with updated phone on success', async () => {
      // arrange
      const mockResult = { id: 'phone-1', label: 'Mobile' }
      mockPhoneServiceInstance.updatePhone.mockResolvedValueOnce(mockResult)
      req.params = { id: 'phone-1' }
      req.body = { label: 'Mobile' }
      // act
      await PhoneController.updatePhone(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockPhoneServiceInstance.updatePhone.mockRejectedValueOnce(new Error('Not found'))
      req.params = { id: 'bad-id' }
      req.body = { label: 'Mobile' }
      // act
      await PhoneController.updatePhone(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── deletePhone ───────────────────────────────────────────────────────────

  describe('deletePhone', () => {
    it('should call sendOK with deleted result on success', async () => {
      // arrange
      const mockResult = { deleted: true }
      mockPhoneServiceInstance.deletePhone.mockResolvedValueOnce(mockResult)
      req.params = { id: 'phone-1' }
      // act
      await PhoneController.deletePhone(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockPhoneServiceInstance.deletePhone.mockRejectedValueOnce(new Error('Not found'))
      req.params = { id: 'bad-id' }
      // act
      await PhoneController.deletePhone(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── deletePhoneUserProfile ────────────────────────────────────────────────

  describe('deletePhoneUserProfile', () => {
    it('should call sendOK on success (user-scoped delete)', async () => {
      // arrange
      const mockResult = { deleted: true }
      mockPhoneServiceInstance.deletePhone.mockResolvedValueOnce(mockResult)
      req.params = { id: 'phone-1' }
      req.user = { id: 'user-1' } as IRequest['user']
      // act
      await PhoneController.deletePhoneUserProfile(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockPhoneServiceInstance.deletePhone.mockRejectedValueOnce(new Error('Not found'))
      req.params = { id: 'bad-id' }
      // act
      await PhoneController.deletePhoneUserProfile(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })
})
