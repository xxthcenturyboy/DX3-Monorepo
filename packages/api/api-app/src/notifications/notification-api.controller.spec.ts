import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { sendOK } from '@dx3/api-libs/http-response/http-responses'

import { NotificationController } from './notification-api.controller'

jest.mock('@dx3/api-libs/notifications/notification-api.service')
jest.mock('@dx3/api-libs/http-response/http-responses', () => ({
  sendBadRequest: jest.fn(),
  sendOK: jest.fn(),
}))

describe('NotificationController', () => {
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
    expect(NotificationController).toBeDefined()
  })

  describe('createNotification', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(NotificationController.createNotification).toBeDefined()
    })
    test('should sendOK when invoked', async () => {
      // arrange
      // act
      await NotificationController.createNotification(req, res)
      // assert
      expect(sendOK).toHaveBeenCalled()
    })
  })

  describe('createNotificationToAll', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(NotificationController.createNotificationToAll).toBeDefined()
    })
    test('should sendOK when invoked', async () => {
      // arrange
      // act
      await NotificationController.createNotificationToAll(req, res)
      // assert
      expect(sendOK).toHaveBeenCalled()
    })
  })

  describe('getAppBadgeCount', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(NotificationController.getAppBadgeCount).toBeDefined()
    })
    test('should sendOK when invoked', async () => {
      // arrange
      // act
      await NotificationController.getAppBadgeCount(req, res)
      // assert
      expect(sendOK).toHaveBeenCalled()
    })
  })

  describe('getByUserId', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(NotificationController.getByUserId).toBeDefined()
    })
    test('should sendOK when invoked', async () => {
      // arrange
      // act
      await NotificationController.getByUserId(req, res)
      // assert
      expect(sendOK).toHaveBeenCalled()
    })
  })

  describe('markAllAsRead', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(NotificationController.markAllAsRead).toBeDefined()
    })
    test('should sendOK when invoked', async () => {
      // arrange
      // act
      await NotificationController.markAllAsRead(req, res)
      // assert
      expect(sendOK).toHaveBeenCalled()
    })
  })

  describe('markAllAsViewed', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(NotificationController.markAllAsViewed).toBeDefined()
    })
    test('should sendOK when invoked', async () => {
      // arrange
      // act
      await NotificationController.markAllAsViewed(req, res)
      // assert
      expect(sendOK).toHaveBeenCalled()
    })
  })

  describe('markAllDismissed', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(NotificationController.markAllDismissed).toBeDefined()
    })
    test('should sendOK when invoked', async () => {
      // arrange
      // act
      await NotificationController.markAllDismissed(req, res)
      // assert
      expect(sendOK).toHaveBeenCalled()
    })
  })

  describe('markAsDismissed', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(NotificationController.markAsDismissed).toBeDefined()
    })
    test('should sendOK when invoked', async () => {
      // arrange
      // act
      await NotificationController.markAsDismissed(req, res)
      // assert
      expect(sendOK).toHaveBeenCalled()
    })
  })

  describe('markAsRead', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(NotificationController.markAsRead).toBeDefined()
    })
    test('should sendOK when invoked', async () => {
      // arrange
      // act
      await NotificationController.markAsRead(req, res)
      // assert
      expect(sendOK).toHaveBeenCalled()
    })
  })

  describe('createAppNotification', () => {
    it('should exist', () => {
      expect(NotificationController.createAppNotification).toBeDefined()
    })

    test('should sendOK when invoked', async () => {
      // arrange
      // act
      await NotificationController.createAppNotification(req, res)
      // assert
      expect(sendOK).toHaveBeenCalled()
    })

    test('should sendBadRequest when service throws', async () => {
      // arrange
      const { sendBadRequest } = jest.requireMock('@dx3/api-libs/http-response/http-responses')
      const { NotificationService } = jest.requireMock(
        '@dx3/api-libs/notifications/notification-api.service',
      )
      NotificationService.mockImplementationOnce(() => ({
        createAndSendAppUpdate: jest.fn().mockRejectedValueOnce(new Error('Push failed')),
      }))
      // act
      await NotificationController.createAppNotification(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('testSocket', () => {
    it('should exist', () => {
      expect(NotificationController.testSocket).toBeDefined()
    })

    test('should sendOK when invoked with userId', async () => {
      // arrange
      req.params = { userId: 'user-1' }
      // act
      await NotificationController.testSocket(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, 'OK')
    })

    test('should sendBadRequest when service throws', async () => {
      // arrange
      const { sendBadRequest } = jest.requireMock('@dx3/api-libs/http-response/http-responses')
      const { NotificationService } = jest.requireMock(
        '@dx3/api-libs/notifications/notification-api.service',
      )
      NotificationService.mockImplementationOnce(() => ({
        testSockets: jest.fn().mockRejectedValueOnce(new Error('Socket error')),
      }))
      req.params = { userId: 'user-1' }
      // act
      await NotificationController.testSocket(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })
})
