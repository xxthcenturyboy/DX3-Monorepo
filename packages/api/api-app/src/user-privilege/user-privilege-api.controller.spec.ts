import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'

import { PrivilegeSetController } from './user-privilege-api.controller'

const mockPrivilegeServiceInstance = {
  getAllPrivilegeSets: jest.fn(),
  updatePrivilegeSet: jest.fn(),
}

jest.mock('@dx3/api-libs/user-privilege/user-privilege-api.service', () => ({
  UserPrivilegeService: jest.fn(() => mockPrivilegeServiceInstance),
}))
jest.mock('@dx3/api-libs/http-response/http-responses', () => ({
  sendBadRequest: jest.fn(),
  sendOK: jest.fn(),
}))
jest.mock('@dx3/api-libs/logger/log-request.util', () => ({
  logRequest: jest.fn(),
}))

describe('PrivilegeSetController', () => {
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
    expect(PrivilegeSetController).toBeDefined()
  })

  // ─── getAllPrivilegeSets ────────────────────────────────────────────────────

  describe('getAllPrivilegeSets', () => {
    test('should call sendOK with privilege sets on success', async () => {
      // arrange
      const mockResult = [{ id: 'ps-1', name: 'Standard' }]
      mockPrivilegeServiceInstance.getAllPrivilegeSets.mockResolvedValueOnce(mockResult)
      // act
      await PrivilegeSetController.getAllPrivilegeSets(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    test('should call sendBadRequest when service throws', async () => {
      // arrange
      mockPrivilegeServiceInstance.getAllPrivilegeSets.mockRejectedValueOnce(new Error('DB error'))
      // act
      await PrivilegeSetController.getAllPrivilegeSets(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── updatePrivilegeSet ────────────────────────────────────────────────────

  describe('updatePrivilegeSet', () => {
    test('should call sendOK with updated set on success', async () => {
      // arrange
      const mockResult = { id: 'ps-1', name: 'Updated' }
      mockPrivilegeServiceInstance.updatePrivilegeSet.mockResolvedValueOnce(mockResult)
      req.params = { id: 'ps-1' }
      req.body = { name: 'Updated' }
      // act
      await PrivilegeSetController.updatePrivilegeSet(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    test('should call sendBadRequest when service throws', async () => {
      // arrange
      mockPrivilegeServiceInstance.updatePrivilegeSet.mockRejectedValueOnce(new Error('Not found'))
      req.params = { id: 'bad-id' }
      req.body = { name: 'Updated' }
      // act
      await PrivilegeSetController.updatePrivilegeSet(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })
})
