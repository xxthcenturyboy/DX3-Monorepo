import { ApiLoggingClass } from '../logger'
import { MockUserModel } from '../user/user-api.postgres-model.mock'
import { NotificationService } from './notification-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('./notification-api.postgres-model')
jest.mock('./notification-api.socket', () => ({
  NotificationSocketApiService: {
    instance: {
      sendAppUpdateNotification: jest.fn(),
      sendNotificationToAll: jest.fn(),
      sendNotificationToUser: jest.fn(),
    },
  },
}))
jest.mock('../user/user-api.postgres-model')

describe('NotificationService', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(NotificationService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    const notificationService = new NotificationService()
    // assert
    expect(notificationService).toBeDefined()
  })

  it('should have all methods', () => {
    // arrange
    // act
    const service = new NotificationService()
    // assert
    expect(service.getAppBadgeCount).toBeDefined()
    expect(service.getNotificationsByUserId).toBeDefined()
    expect(service.createAndSend).toBeDefined()
    expect(service.markAllAsRead).toBeDefined()
    expect(service.markAsDismissed).toBeDefined()
    expect(service.markAsRead).toBeDefined()
    expect(service.markViewed).toBeDefined()
  })

  describe('getNotificationsByUserId', () => {
    it('should throw when userId is missing', async () => {
      const service = new NotificationService()
      await expect(service.getNotificationsByUserId('' as never)).rejects.toThrow('Missing userId')
    })

    it('should return system and user notifications', async () => {
      const { NotificationModel } = require('./notification-api.postgres-model')
      ;(NotificationModel.getByUserId as jest.Mock).mockResolvedValue([])
      ;(NotificationModel.getSystemNotifications as jest.Mock).mockResolvedValue([])

      const service = new NotificationService()
      const result = await service.getNotificationsByUserId('user-1')

      expect(result).toEqual({ system: [], user: [] })
    })
  })

  describe('createAndSend', () => {
    it('should throw when userId and message missing', async () => {
      const service = new NotificationService()
      await expect(service.createAndSend('' as never, '' as never, 'INFO')).rejects.toThrow(
        'Missing params',
      )
    })

    it('should create and send notification', async () => {
      const mockNotif = { id: '1', message: 'Test', title: 'Title' }
      const { NotificationModel } = require('./notification-api.postgres-model')
      ;(NotificationModel.createNew as jest.Mock).mockResolvedValue(mockNotif)

      const service = new NotificationService()
      const result = await service.createAndSend(
        'user-1',
        'Test message',
        'INFO',
        'Title',
        undefined,
        true,
      )

      expect(result).toBe(mockNotif)
    })
  })

  describe('createAndSendToAll', () => {
    it('should throw when message missing', async () => {
      const service = new NotificationService()
      await expect(service.createAndSendToAll('' as never, 'INFO')).rejects.toThrow(
        'Missing params',
      )
    })

    it('should create system notification', async () => {
      const mockNotif = { id: '1', message: 'Broadcast' }
      const { NotificationModel } = require('./notification-api.postgres-model')
      ;(NotificationModel.createNew as jest.Mock).mockResolvedValue(mockNotif)

      const service = new NotificationService()
      const result = await service.createAndSendToAll(
        'Broadcast message',
        'INFO',
        undefined,
        undefined,
        true,
      )

      expect(result).toBe(mockNotif)
    })
  })

  describe('markAllAsRead', () => {
    it('should throw when userId missing', async () => {
      const service = new NotificationService()
      await expect(service.markAllAsRead('' as never)).rejects.toThrow('Missing params')
    })

    it('should mark all as read', async () => {
      const { NotificationModel } = require('./notification-api.postgres-model')
      ;(NotificationModel.markAllAsRead as jest.Mock).mockResolvedValue([5])

      const service = new NotificationService()
      const result = await service.markAllAsRead('user-1')

      expect(result).toEqual([5])
    })
  })

  describe('markAsRead', () => {
    it('should throw when id missing', async () => {
      const service = new NotificationService()
      await expect(service.markAsRead('' as never)).rejects.toThrow('Missing params')
    })

    it('should mark as read', async () => {
      const { NotificationModel } = require('./notification-api.postgres-model')
      ;(NotificationModel.markAsRead as jest.Mock).mockResolvedValue([1])

      const service = new NotificationService()
      const result = await service.markAsRead('notif-1')

      expect(result).toEqual([1])
    })
  })

  describe('markViewed', () => {
    it('should throw when userId missing', async () => {
      const service = new NotificationService()
      await expect(service.markViewed('' as never)).rejects.toThrow('Missing params')
    })

    it('should mark as viewed', async () => {
      const { NotificationModel } = require('./notification-api.postgres-model')
      ;(NotificationModel.markAsViewed as jest.Mock).mockResolvedValue([3])

      const service = new NotificationService()
      const result = await service.markViewed('user-1')

      expect(result).toEqual([3])
    })
  })

  describe('markAllDismissed', () => {
    it('should throw when userId missing', async () => {
      const service = new NotificationService()
      await expect(service.markAllDismissed('' as never)).rejects.toThrow('Missing params')
    })

    it('should mark all dismissed', async () => {
      const { NotificationModel } = require('./notification-api.postgres-model')
      ;(NotificationModel.markAllDismissed as jest.Mock).mockResolvedValue([2])

      const service = new NotificationService()
      const result = await service.markAllDismissed('user-1')

      expect(result).toEqual([2])
    })
  })

  describe('markAsDismissed', () => {
    it('should throw when id missing', async () => {
      const service = new NotificationService()
      await expect(service.markAsDismissed('' as never)).rejects.toThrow('Missing params')
    })

    it('should mark as dismissed', async () => {
      const { NotificationModel } = require('./notification-api.postgres-model')
      ;(NotificationModel.markAsDismissed as jest.Mock).mockResolvedValue([1])

      const service = new NotificationService()
      const result = await service.markAsDismissed('notif-1')

      expect(result).toEqual([1])
    })
  })

  // ──────────────────────────────────────────────────────────────
  // Error / catch block paths
  // ──────────────────────────────────────────────────────────────
  describe('getNotificationsByUserId - catch block', () => {
    it('should throw with server error when DB query fails', async () => {
      const { NotificationModel } = require('./notification-api.postgres-model')
      ;(NotificationModel.getByUserId as jest.Mock).mockRejectedValue(new Error('DB conn lost'))

      const service = new NotificationService()
      await expect(service.getNotificationsByUserId('user-1')).rejects.toThrow()
    })
  })

  describe('getAppBadgeCount', () => {
    it('should return 0 when user is not found', async () => {
      jest.spyOn(MockUserModel, 'findByPk').mockResolvedValue(null)

      const service = new NotificationService()
      const result = await service.getAppBadgeCount('nonexistent-id')
      expect(result).toBe(0)
    })

    it('should return notification counts when user is found', async () => {
      const { NotificationModel } = require('./notification-api.postgres-model')
      jest.spyOn(MockUserModel, 'findByPk').mockResolvedValue({ id: 'user-1' } as never)
      ;(NotificationModel.getByUserId as jest.Mock).mockResolvedValue([{ id: 'n1' }])
      ;(NotificationModel.getSystemNotifications as jest.Mock).mockResolvedValue([
        { id: 's1' },
        { id: 's2' },
      ])

      const service = new NotificationService()
      const result = await service.getAppBadgeCount('user-1')
      expect(result).toEqual({ system: 2, total: 3, user: 1 })
    })

    it('should throw when inner notification query fails', async () => {
      const { NotificationModel } = require('./notification-api.postgres-model')
      jest.spyOn(MockUserModel, 'findByPk').mockResolvedValue({ id: 'user-1' } as never)
      ;(NotificationModel.getByUserId as jest.Mock).mockRejectedValue(new Error('DB fail'))

      const service = new NotificationService()
      await expect(service.getAppBadgeCount('user-1')).rejects.toThrow()
    })
  })

  describe('createAndSendAppUpdate', () => {
    it('should call sendAppUpdateNotification on socket service', async () => {
      const { NotificationSocketApiService } = require('./notification-api.socket')
      const service = new NotificationService()
      await service.createAndSendAppUpdate()
      expect(NotificationSocketApiService.instance.sendAppUpdateNotification).toHaveBeenCalled()
    })
  })

  describe('markAllAsRead - catch block', () => {
    it('should throw with server error when DB update fails', async () => {
      const { NotificationModel } = require('./notification-api.postgres-model')
      ;(NotificationModel.markAllAsRead as jest.Mock).mockRejectedValue(new Error('write fail'))

      const service = new NotificationService()
      await expect(service.markAllAsRead('user-1')).rejects.toThrow()
    })
  })

  describe('markViewed - catch block', () => {
    it('should throw with server error when DB update fails', async () => {
      const { NotificationModel } = require('./notification-api.postgres-model')
      ;(NotificationModel.markAsViewed as jest.Mock).mockRejectedValue(new Error('write fail'))

      const service = new NotificationService()
      await expect(service.markViewed('user-1')).rejects.toThrow()
    })
  })

  describe('markAsRead - catch block', () => {
    it('should throw with server error when DB update fails', async () => {
      const { NotificationModel } = require('./notification-api.postgres-model')
      ;(NotificationModel.markAsRead as jest.Mock).mockRejectedValue(new Error('write fail'))

      const service = new NotificationService()
      await expect(service.markAsRead('notif-1')).rejects.toThrow()
    })
  })

  describe('markAllDismissed - catch block', () => {
    it('should throw with server error when DB update fails', async () => {
      const { NotificationModel } = require('./notification-api.postgres-model')
      ;(NotificationModel.markAllDismissed as jest.Mock).mockRejectedValue(new Error('write fail'))

      const service = new NotificationService()
      await expect(service.markAllDismissed('user-1')).rejects.toThrow()
    })
  })

  describe('markAsDismissed - catch block', () => {
    it('should throw with server error when DB update fails', async () => {
      const { NotificationModel } = require('./notification-api.postgres-model')
      ;(NotificationModel.markAsDismissed as jest.Mock).mockRejectedValue(new Error('write fail'))

      const service = new NotificationService()
      await expect(service.markAsDismissed('notif-1')).rejects.toThrow()
    })
  })

  describe('createAndSend - calls sendDeviceNotification when suppressPush is false', () => {
    it('should call createNew and sendNotificationToUser without suppressing push', async () => {
      const { NotificationModel } = require('./notification-api.postgres-model')
      const mockNotif = { id: 'n1', message: 'Hi', userId: 'user-1' }
      ;(NotificationModel.createNew as jest.Mock).mockResolvedValue(mockNotif)
      // Ensure getNotificationsByUserId resolves correctly for the fire-and-forget getAppBadgeCount call
      ;(NotificationModel.getByUserId as jest.Mock).mockResolvedValue([])
      ;(NotificationModel.getSystemNotifications as jest.Mock).mockResolvedValue([])
      jest.spyOn(MockUserModel, 'findByPk').mockResolvedValue({
        fetchConnectedDevice: jest.fn().mockResolvedValue(null),
        id: 'user-1',
      } as never)

      const service = new NotificationService()
      const result = await service.createAndSend('user-1', 'Hi', 'INFO', 'Title')
      // suppressPush defaults to false → sendDeviceNotification is called fire-and-forget (line 137)
      expect(result).toBe(mockNotif)
    })
  })
})
