import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { TEST_EXISTING_USER_ID, TEST_PASSWORD, TEST_UUID } from '@dx3/test-data'

import { UserController } from './user-api.controller'

jest.mock('@dx3/api-libs/user/user-api.service.ts')
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
      // arrange
      req.params = { id: TEST_UUID }
      // act
      await UserController.deleteUser(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('getUserProfile', () => {
    test('should call sendBadRequest when sent with userId', async () => {
      // arrange
      // req.session = {
      //   userId: TEST_EXISTING_USER_ID
      // };
      // act
      await UserController.getUserProfile(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('getUser', () => {
    test('should call sendBadRequest when sent with userId', async () => {
      // arrange
      req.params = {
        id: TEST_EXISTING_USER_ID,
      }
      // act
      await UserController.getUser(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('getUsersList', () => {
    test('should call sendBadRequest when sent', async () => {
      // arrange
      req.query = {}
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
      // arrange
      // req.session = {
      //   userId: TEST_EXISTING_USER_ID
      // };
      // act
      await UserController.sendOtpCode(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('updatePassword', () => {
    test('should call sendBadRequest when sent', async () => {
      // arrange
      req.body = {
        id: TEST_UUID,
        oldPassword: TEST_PASSWORD,
        otpCode: '323432',
        password: TEST_PASSWORD,
      }
      // act
      await UserController.updatePassword(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('updateRolesRestrictions', () => {
    test('should call sendBadRequest when sent', async () => {
      // arrange
      req.params = { id: TEST_UUID }
      req.body = {
        roles: ['Test'],
      }
      // act
      await UserController.updateRolesRestrictions(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('updateUsername', () => {
    test('should call sendBadRequest when sent', async () => {
      // arrange
      req.params = { id: TEST_UUID }
      req.body = {
        code: 'code',
        username: 'Test',
      }
      // act
      await UserController.updateUserName(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })
  describe('updateUser', () => {
    test('should call sendBadRequest when sent', async () => {
      // arrange
      req.params = { id: TEST_UUID }
      req.body = {
        firstName: 'Test',
      }
      // act
      await UserController.updateUser(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })
})
