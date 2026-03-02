import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { TEST_AUTH_PASSWORD, TEST_UUID } from '@dx3/test-data'

import { UserController } from './user-api.controller'

const mockUserServiceInstance = {
  checkUsernameAvailability: jest.fn().mockResolvedValue(true),
  createUser: jest.fn(),
  deleteUser: jest.fn(),
  getProfile: jest.fn(),
  getUser: jest.fn(),
  getUserList: jest.fn(),
  isUsernameAvailable: jest.fn().mockResolvedValue(true),
  sendOtpCode: jest.fn(),
  updatePassword: jest.fn(),
  updateRolesAndRestrictions: jest.fn(),
  updateUser: jest.fn(),
  updateUserName: jest.fn(),
}

jest.mock('@dx3/api-libs/user/user-api.service.ts', () => ({
  UserService: jest.fn(() => mockUserServiceInstance),
}))
jest.mock('@dx3/api-libs/http-response/http-responses.ts', () => ({
  sendBadRequest: jest.fn(),
  sendOK: jest.fn(),
}))

describe('UserController', () => {
  let req: IRequest
  let res: IResponse

  beforeEach(() => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    mockUserServiceInstance.deleteUser.mockResolvedValue(undefined)
    mockUserServiceInstance.getProfile.mockResolvedValue({ profile: null })
    mockUserServiceInstance.getUser.mockResolvedValue(null)
    mockUserServiceInstance.getUserList.mockResolvedValue({ items: [], total: 0 })
    mockUserServiceInstance.sendOtpCode.mockResolvedValue(undefined)
    mockUserServiceInstance.updatePassword.mockResolvedValue({ success: true })
    mockUserServiceInstance.updateRolesAndRestrictions.mockResolvedValue({})
    mockUserServiceInstance.updateUser.mockResolvedValue({})
    mockUserServiceInstance.updateUserName.mockResolvedValue({})
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(UserController).toBeDefined()
  })

  describe('checkUsernameAvailability', () => {
    test('should call sendBadRequest when sent', async () => {
      // arrange
      req.query = {}
      // act
      await UserController.checkUsernameAvailability(req, res)
      // assert
      expect(sendOK).toHaveBeenCalled()
    })
  })

  // describe('createUser', () => {
  //   test('should call sendBadRequest when sent', async () => {
  //     // arrange
  //     req.body = TEST_USER_CREATE;
  //     // act
  //     await UserController.createUser(req, res);
  //     // assert
  //     expect(sendBadRequest).toHaveBeenCalled();
  //   });
  // });

  describe('deleteUser', () => {
    test('should call sendBadRequest when sent', async () => {
      // arrange - service throws when id is empty
      req.params = {}
      mockUserServiceInstance.deleteUser.mockRejectedValueOnce(new Error('No id provided'))
      // act
      await UserController.deleteUser(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('getUserProfile', () => {
    test('should call sendBadRequest when sent with userId', async () => {
      // arrange - service throws when userId is empty
      req.headers = {}
      mockUserServiceInstance.getProfile.mockRejectedValueOnce(new Error('No ID supplied'))
      // act
      await UserController.getUserProfile(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('getUser', () => {
    test('should call sendBadRequest when sent with userId', async () => {
      // arrange - service throws when id is empty
      req.params = {}
      mockUserServiceInstance.getUser.mockRejectedValueOnce(new Error('No id provided'))
      // act
      await UserController.getUser(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('getUsersList', () => {
    test('should call sendBadRequest when sent', async () => {
      // arrange - service throws
      req.query = {}
      mockUserServiceInstance.getUserList.mockRejectedValueOnce(new Error('Service error'))
      // act
      await UserController.getUsersList(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // describe('resendInvite', () => {
  //   test('should call sendBadRequest when sent', async () => {
  //     // arrange
  //     req.body = {
  //       id: TEST_UUID,
  //       email: TEST_EMAIL
  //     };
  //     // act
  //     await UserController.resendInvite(req, res);
  //     // assert
  //     expect(sendBadRequest).toHaveBeenCalled();
  //   });
  // });

  describe('sendOtpCode', () => {
    test('should call sendBadRequest when sent with userId', async () => {
      // arrange - service throws when no auth token
      req.headers = {}
      mockUserServiceInstance.sendOtpCode.mockRejectedValueOnce(new Error('Invalid token'))
      // act
      await UserController.sendOtpCode(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('updatePassword', () => {
    test('should call sendBadRequest when sent', async () => {
      // arrange - service throws when payload invalid (missing otp/signature)
      req.body = {
        id: TEST_UUID,
        oldPassword: TEST_AUTH_PASSWORD,
        otpCode: '323432',
        password: TEST_AUTH_PASSWORD,
      }
      mockUserServiceInstance.updatePassword.mockRejectedValueOnce(new Error('No value provided'))
      // act
      await UserController.updatePassword(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('updateRolesRestrictions', () => {
    test('should call sendBadRequest when sent', async () => {
      // arrange - service throws
      req.params = { id: TEST_UUID }
      req.body = { roles: ['Test'] }
      mockUserServiceInstance.updateRolesAndRestrictions.mockRejectedValueOnce(
        new Error('No value provided'),
      )
      // act
      await UserController.updateRolesRestrictions(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('updateUsername', () => {
    test('should call sendBadRequest when sent', async () => {
      // arrange - service throws
      req.params = { id: TEST_UUID }
      req.body = { code: 'code', username: 'Test' }
      mockUserServiceInstance.updateUserName.mockRejectedValueOnce(
        new Error('No otp or signature provided'),
      )
      // act
      await UserController.updateUserName(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('updateUser', () => {
    test('should call sendBadRequest when sent', async () => {
      // arrange - service throws
      req.params = { id: TEST_UUID }
      req.body = { firstName: 'Test' }
      mockUserServiceInstance.updateUser.mockRejectedValueOnce(new Error('No id provided'))
      // act
      await UserController.updateUser(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })
})
