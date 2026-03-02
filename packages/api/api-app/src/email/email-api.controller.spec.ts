import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'

import { EmailController } from './email-api.controller'

const mockEmailServiceInstance = {
  createEmail: jest.fn(),
  deleteEmail: jest.fn(),
  isEmailAvailableAndValid: jest.fn(),
  updateEmail: jest.fn(),
}

jest.mock('@dx3/api-libs/email/email-api.service', () => ({
  EmailService: jest.fn(() => mockEmailServiceInstance),
}))
jest.mock('@dx3/api-libs/http-response/http-responses', () => ({
  sendBadRequest: jest.fn(),
  sendOK: jest.fn(),
}))
jest.mock('@dx3/api-libs/logger/log-request.util', () => ({
  logRequest: jest.fn(),
}))

describe('EmailController', () => {
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
    expect(EmailController).toBeDefined()
  })

  // ─── checkAvailability ─────────────────────────────────────────────────────

  describe('checkAvailability', () => {
    it('should call sendOK with isAvailable true on success', async () => {
      // arrange
      mockEmailServiceInstance.isEmailAvailableAndValid.mockResolvedValueOnce(undefined)
      req.body = { email: 'test@example.com' }
      // act
      await EmailController.checkAvailability(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, { isAvailable: true })
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockEmailServiceInstance.isEmailAvailableAndValid.mockRejectedValueOnce(
        new Error('Email taken'),
      )
      req.body = { email: 'taken@example.com' }
      // act
      await EmailController.checkAvailability(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── createEmail ───────────────────────────────────────────────────────────

  describe('createEmail', () => {
    it('should call sendOK with created email on success', async () => {
      // arrange
      const mockResult = { id: 'email-1', value: 'test@example.com' }
      mockEmailServiceInstance.createEmail.mockResolvedValueOnce(mockResult)
      req.body = { email: 'test@example.com', userId: 'user-1' }
      // act
      await EmailController.createEmail(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockEmailServiceInstance.createEmail.mockRejectedValueOnce(new Error('Duplicate email'))
      req.body = { email: 'test@example.com' }
      // act
      await EmailController.createEmail(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── updateEmail ───────────────────────────────────────────────────────────

  describe('updateEmail', () => {
    it('should call sendOK with updated email on success', async () => {
      // arrange
      const mockResult = { id: 'email-1', label: 'Work' }
      mockEmailServiceInstance.updateEmail.mockResolvedValueOnce(mockResult)
      req.params = { id: 'email-1' }
      req.body = { label: 'Work' }
      // act
      await EmailController.updateEmail(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockEmailServiceInstance.updateEmail.mockRejectedValueOnce(new Error('Not found'))
      req.params = { id: 'bad-id' }
      req.body = { label: 'Work' }
      // act
      await EmailController.updateEmail(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── deleteEmail ───────────────────────────────────────────────────────────

  describe('deleteEmail', () => {
    it('should call sendOK with deleted result on success', async () => {
      // arrange
      const mockResult = { deleted: true }
      mockEmailServiceInstance.deleteEmail.mockResolvedValueOnce(mockResult)
      req.params = { id: 'email-1' }
      // act
      await EmailController.deleteEmail(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockEmailServiceInstance.deleteEmail.mockRejectedValueOnce(new Error('Not found'))
      req.params = { id: 'bad-id' }
      // act
      await EmailController.deleteEmail(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── deleteEmailUserProfile ────────────────────────────────────────────────

  describe('deleteEmailUserProfile', () => {
    it('should call sendOK on success (user-scoped delete)', async () => {
      // arrange
      const mockResult = { deleted: true }
      mockEmailServiceInstance.deleteEmail.mockResolvedValueOnce(mockResult)
      req.params = { id: 'email-1' }
      req.user = { id: 'user-1' } as IRequest['user']
      // act
      await EmailController.deleteEmailUserProfile(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockEmailServiceInstance.deleteEmail.mockRejectedValueOnce(new Error('Not found'))
      req.params = { id: 'bad-id' }
      // act
      await EmailController.deleteEmailUserProfile(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })
})
