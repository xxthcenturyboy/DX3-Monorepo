import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'

import { FeatureFlagController } from './feature-flag-api.controller'

const mockFeatureFlagServiceInstance = {
  createFlag: jest.fn(),
  evaluateAllFlags: jest.fn(),
  getAllFlags: jest.fn(),
  updateFlag: jest.fn(),
}

jest.mock('@dx3/api-libs/feature-flags/feature-flag-api.service', () => ({
  FeatureFlagService: jest.fn(() => mockFeatureFlagServiceInstance),
}))
jest.mock('@dx3/api-libs/feature-flags/feature-flag-api.socket', () => ({
  FeatureFlagSocketApiService: {
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

describe('FeatureFlagController', () => {
  let req: IRequest
  let res: IResponse

  beforeEach(() => {
    jest.clearAllMocks()
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    req.body = {}
    req.query = {}
  })

  it('should exist when imported', () => {
    expect(FeatureFlagController).toBeDefined()
  })

  // ─── createFlag ────────────────────────────────────────────────────────────

  describe('createFlag', () => {
    it('should be a function', () => {
      expect(typeof FeatureFlagController.createFlag).toBe('function')
    })

    it('should call sendOK with created flag on success', async () => {
      // arrange
      const mockFlag = { id: 'flag-1', name: 'NEW_FEATURE', status: 'enabled' }
      mockFeatureFlagServiceInstance.createFlag.mockResolvedValueOnce(mockFlag)
      req.body = {
        description: 'A new feature',
        name: 'NEW_FEATURE',
        percentage: 100,
        status: 'enabled',
        target: 'all',
      }
      // act
      await FeatureFlagController.createFlag(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockFlag)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockFeatureFlagServiceInstance.createFlag.mockRejectedValueOnce(
        new Error('Duplicate flag name'),
      )
      req.body = { name: 'DUPLICATE', status: 'enabled' }
      // act
      await FeatureFlagController.createFlag(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })

    it('should broadcast flags updated when socket service instance is available', async () => {
      // arrange
      const mockBroadcast = jest.fn()
      const { FeatureFlagSocketApiService } = jest.requireMock(
        '@dx3/api-libs/feature-flags/feature-flag-api.socket',
      )
      FeatureFlagSocketApiService.instance = { broadcastFlagsUpdated: mockBroadcast }
      mockFeatureFlagServiceInstance.createFlag.mockResolvedValueOnce({ id: 'flag-1' })
      req.body = { name: 'NEW_FEATURE', status: 'enabled' }
      // act
      await FeatureFlagController.createFlag(req, res)
      // assert
      expect(mockBroadcast).toHaveBeenCalled()
      // cleanup
      FeatureFlagSocketApiService.instance = null
    })
  })

  // ─── getAdminFlags ─────────────────────────────────────────────────────────

  describe('getAdminFlags', () => {
    it('should be a function', () => {
      expect(typeof FeatureFlagController.getAdminFlags).toBe('function')
    })

    it('should call sendOK with flags on success', async () => {
      // arrange
      const mockFlags = [{ id: 'flag-1', name: 'FEATURE_A' }]
      mockFeatureFlagServiceInstance.getAllFlags.mockResolvedValueOnce(mockFlags)
      req.query = { status: 'enabled' }
      // act
      await FeatureFlagController.getAdminFlags(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockFlags)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockFeatureFlagServiceInstance.getAllFlags.mockRejectedValueOnce(new Error('DB error'))
      // act
      await FeatureFlagController.getAdminFlags(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── getAllFlags ───────────────────────────────────────────────────────────

  describe('getAllFlags', () => {
    it('should be a function', () => {
      expect(typeof FeatureFlagController.getAllFlags).toBe('function')
    })

    it('should call sendOK with evaluated flags on success', async () => {
      // arrange
      const mockEvaluated = { FEATURE_A: true, FEATURE_B: false }
      mockFeatureFlagServiceInstance.evaluateAllFlags.mockResolvedValueOnce(mockEvaluated)
      // act
      await FeatureFlagController.getAllFlags(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockEvaluated)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockFeatureFlagServiceInstance.evaluateAllFlags.mockRejectedValueOnce(
        new Error('Evaluation failed'),
      )
      // act
      await FeatureFlagController.getAllFlags(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── updateFlag ────────────────────────────────────────────────────────────

  describe('updateFlag', () => {
    it('should be a function', () => {
      expect(typeof FeatureFlagController.updateFlag).toBe('function')
    })

    it('should call sendOK with updated flag on success', async () => {
      // arrange
      const mockUpdated = { id: 'flag-1', status: 'disabled' }
      mockFeatureFlagServiceInstance.updateFlag.mockResolvedValueOnce(mockUpdated)
      req.body = { id: 'flag-1', percentage: 0, status: 'disabled' }
      // act
      await FeatureFlagController.updateFlag(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockUpdated)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockFeatureFlagServiceInstance.updateFlag.mockRejectedValueOnce(new Error('Flag not found'))
      req.body = { id: 'bad-id', status: 'disabled' }
      // act
      await FeatureFlagController.updateFlag(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })

    it('should broadcast flags updated when socket service instance is available', async () => {
      // arrange
      const mockBroadcast = jest.fn()
      const { FeatureFlagSocketApiService } = jest.requireMock(
        '@dx3/api-libs/feature-flags/feature-flag-api.socket',
      )
      FeatureFlagSocketApiService.instance = { broadcastFlagsUpdated: mockBroadcast }
      mockFeatureFlagServiceInstance.updateFlag.mockResolvedValueOnce({ id: 'flag-1' })
      req.body = { id: 'flag-1', status: 'disabled' }
      // act
      await FeatureFlagController.updateFlag(req, res)
      // assert
      expect(mockBroadcast).toHaveBeenCalled()
      // cleanup
      FeatureFlagSocketApiService.instance = null
    })
  })
})
