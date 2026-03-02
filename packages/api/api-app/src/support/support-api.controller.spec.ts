import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'

import { SupportController } from './support-api.controller'

const mockSupportServiceInstance = {
  bulkUpdateStatus: jest.fn(),
  createRequest: jest.fn(),
  getById: jest.fn(),
  getByUserId: jest.fn(),
  getList: jest.fn(),
  getUnviewedCount: jest.fn(),
  markAllAsViewed: jest.fn(),
  markAsViewed: jest.fn(),
  updateStatus: jest.fn(),
}

const mockUserModelInstance = {
  hasSecuredAccount: jest.fn(),
  timezone: null,
}

jest.mock('@dx3/api-libs/support/support-api.service', () => ({
  SupportService: jest.fn(() => mockSupportServiceInstance),
}))
jest.mock('@dx3/api-libs/support/support-api.socket', () => ({
  SupportSocketApiService: {
    instance: null,
  },
}))
jest.mock('@dx3/api-libs/auth/tokens/token.service', () => ({
  TokenService: {
    getUserIdFromToken: jest.fn().mockReturnValue('test-user-id'),
  },
}))
jest.mock('@dx3/api-libs/headers/header.service', () => ({
  HeaderService: {
    getTokenFromRequest: jest.fn().mockReturnValue('test-token'),
  },
}))
jest.mock('@dx3/api-libs/user/user-api.postgres-model', () => ({
  UserModel: {
    findByPk: jest.fn(),
  },
}))
jest.mock('@dx3/api-libs/metrics/metrics-api.service', () => ({
  MetricsService: {
    instance: null,
  },
}))
jest.mock('@dx3/api-libs/http-response/http-responses', () => ({
  sendBadRequest: jest.fn(),
  sendOK: jest.fn(),
}))
jest.mock('@dx3/api-libs/logger/log-request.util', () => ({
  logRequest: jest.fn(),
}))
jest.mock('@dx3/api-libs/utils', () => ({
  createApiErrorMessage: jest.fn((code: string, msg: string) => `${code}: ${msg}`),
}))

describe('SupportController', () => {
  let req: IRequest
  let res: IResponse

  beforeEach(() => {
    jest.clearAllMocks()
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    req.params = {}
    req.query = {}
    req.body = {}
    req.headers = {}
  })

  it('should exist when imported', () => {
    expect(SupportController).toBeDefined()
  })

  it('should have the correct methods', () => {
    expect(SupportController.bulkUpdateStatus).toBeDefined()
    expect(SupportController.createRequest).toBeDefined()
    expect(SupportController.getById).toBeDefined()
    expect(SupportController.getByUserId).toBeDefined()
    expect(SupportController.getList).toBeDefined()
    expect(SupportController.getUnviewedCount).toBeDefined()
    expect(SupportController.markAllAsViewed).toBeDefined()
    expect(SupportController.markAsViewed).toBeDefined()
    expect(SupportController.updateStatus).toBeDefined()
  })

  // ─── bulkUpdateStatus ──────────────────────────────────────────────────────

  describe('bulkUpdateStatus', () => {
    it('should call sendOK with result on success', async () => {
      // arrange
      const mockResult = { updated: 3 }
      mockSupportServiceInstance.bulkUpdateStatus.mockResolvedValueOnce(mockResult)
      req.body = { ids: ['id-1', 'id-2', 'id-3'], status: 'closed' }
      // act
      await SupportController.bulkUpdateStatus(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockSupportServiceInstance.bulkUpdateStatus.mockRejectedValueOnce(new Error('DB error'))
      req.body = { ids: [], status: 'closed' }
      // act
      await SupportController.bulkUpdateStatus(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── createRequest ─────────────────────────────────────────────────────────

  describe('createRequest', () => {
    it('should be a function', () => {
      expect(typeof SupportController.createRequest).toBe('function')
    })

    it('should call sendBadRequest when user is not found in DB', async () => {
      // arrange
      const { UserModel } = jest.requireMock('@dx3/api-libs/user/user-api.postgres-model')
      UserModel.findByPk.mockResolvedValueOnce(null)
      // act
      await SupportController.createRequest(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })

    it('should call sendBadRequest when user account is not secured', async () => {
      // arrange
      const { UserModel } = jest.requireMock('@dx3/api-libs/user/user-api.postgres-model')
      mockUserModelInstance.hasSecuredAccount.mockResolvedValueOnce(false)
      UserModel.findByPk.mockResolvedValueOnce(mockUserModelInstance)
      req.body = { category: 'billing', message: 'Help me' }
      // act
      await SupportController.createRequest(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })

    it('should call sendOK with created request on success', async () => {
      // arrange
      const { UserModel } = jest.requireMock('@dx3/api-libs/user/user-api.postgres-model')
      mockUserModelInstance.hasSecuredAccount.mockResolvedValueOnce(true)
      UserModel.findByPk.mockResolvedValueOnce(mockUserModelInstance)
      const mockResult = { id: 'req-1', status: 'open' }
      mockSupportServiceInstance.createRequest.mockResolvedValueOnce(mockResult)
      req.body = { category: 'billing', message: 'Help me' }
      // act
      await SupportController.createRequest(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })
  })

  // ─── getById ───────────────────────────────────────────────────────────────

  describe('getById', () => {
    it('should call sendOK with request on success', async () => {
      // arrange
      const mockResult = { id: 'req-1', status: 'open' }
      mockSupportServiceInstance.getById.mockResolvedValueOnce(mockResult)
      req.params = { id: 'req-1' }
      // act
      await SupportController.getById(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockSupportServiceInstance.getById.mockRejectedValueOnce(new Error('Not found'))
      req.params = { id: 'bad-id' }
      // act
      await SupportController.getById(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── getByUserId ───────────────────────────────────────────────────────────

  describe('getByUserId', () => {
    it('should call sendOK with requests on success', async () => {
      // arrange
      const mockResult = [{ id: 'req-1' }]
      mockSupportServiceInstance.getByUserId.mockResolvedValueOnce(mockResult)
      req.params = { userId: 'user-1' }
      req.query = { openOnly: 'true' }
      // act
      await SupportController.getByUserId(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockSupportServiceInstance.getByUserId.mockRejectedValueOnce(new Error('DB error'))
      req.params = { userId: 'user-1' }
      // act
      await SupportController.getByUserId(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── getList ───────────────────────────────────────────────────────────────

  describe('getList', () => {
    it('should call sendOK with paginated list on success', async () => {
      // arrange
      const mockResult = { count: 5, rows: [] }
      mockSupportServiceInstance.getList.mockResolvedValueOnce(mockResult)
      req.query = { limit: '10', offset: '0' }
      // act
      await SupportController.getList(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockSupportServiceInstance.getList.mockRejectedValueOnce(new Error('Query error'))
      // act
      await SupportController.getList(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── getUnviewedCount ──────────────────────────────────────────────────────

  describe('getUnviewedCount', () => {
    it('should call sendOK with count on success', async () => {
      // arrange
      mockSupportServiceInstance.getUnviewedCount.mockResolvedValueOnce(7)
      // act
      await SupportController.getUnviewedCount(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, 7)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockSupportServiceInstance.getUnviewedCount.mockRejectedValueOnce(new Error('DB error'))
      // act
      await SupportController.getUnviewedCount(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── markAllAsViewed ───────────────────────────────────────────────────────

  describe('markAllAsViewed', () => {
    it('should call sendOK on success', async () => {
      // arrange
      mockSupportServiceInstance.markAllAsViewed.mockResolvedValueOnce({ updated: 3 })
      // act
      await SupportController.markAllAsViewed(req, res)
      // assert
      expect(sendOK).toHaveBeenCalled()
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockSupportServiceInstance.markAllAsViewed.mockRejectedValueOnce(new Error('DB error'))
      // act
      await SupportController.markAllAsViewed(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── markAsViewed ──────────────────────────────────────────────────────────

  describe('markAsViewed', () => {
    it('should call sendOK on success', async () => {
      // arrange
      mockSupportServiceInstance.markAsViewed.mockResolvedValueOnce({ id: 'req-1' })
      req.params = { id: 'req-1' }
      // act
      await SupportController.markAsViewed(req, res)
      // assert
      expect(sendOK).toHaveBeenCalled()
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockSupportServiceInstance.markAsViewed.mockRejectedValueOnce(new Error('Not found'))
      req.params = { id: 'bad-id' }
      // act
      await SupportController.markAsViewed(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── updateStatus ──────────────────────────────────────────────────────────

  describe('updateStatus', () => {
    it('should call sendOK with updated request on success', async () => {
      // arrange
      const mockResult = { id: 'req-1', status: 'resolved' }
      mockSupportServiceInstance.updateStatus.mockResolvedValueOnce(mockResult)
      req.params = { id: 'req-1' }
      req.body = { status: 'resolved' }
      // act
      await SupportController.updateStatus(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockSupportServiceInstance.updateStatus.mockRejectedValueOnce(new Error('Not found'))
      req.params = { id: 'bad-id' }
      req.body = { status: 'resolved' }
      // act
      await SupportController.updateStatus(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })
})
