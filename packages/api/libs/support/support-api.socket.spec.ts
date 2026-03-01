import { SUPPORT_CATEGORY, SUPPORT_STATUS } from '@dx3/models-shared'

import { ApiLoggingClass } from '../logger'
import { SupportSocketApiService } from './support-api.socket'

const mockEmit = jest.fn()
const mockTo = jest.fn().mockReturnValue({ emit: mockEmit })
const mockOf = jest.fn().mockReturnValue({ to: mockTo })

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('../socket-io-api', () => ({
  ensureLoggedInSocket: jest.fn().mockReturnValue(true),
  getUserIdFromHandshake: jest.fn().mockReturnValue('user-123'),
  getUserRolesFromHandshake: jest.fn().mockResolvedValue(['ADMIN']),
  SocketApiConnection: {
    get instance() {
      return {
        io: {
          of: mockOf,
        },
      }
    },
  },
}))

describe('SupportSocketApiService', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockOf.mockReturnValue({ to: mockTo })
  })

  it('should exist when imported', () => {
    expect(SupportSocketApiService).toBeDefined()
  })

  it('should create instance when constructed', () => {
    const service = new SupportSocketApiService()
    expect(service).toBeDefined()
    expect(service.ns).toBeDefined()
  })

  it('should have sendNewRequestNotification method', () => {
    const service = new SupportSocketApiService()
    expect(service.sendNewRequestNotification).toBeDefined()
    expect(typeof service.sendNewRequestNotification).toBe('function')
  })

  it('should have sendRequestUpdatedNotification method', () => {
    const service = new SupportSocketApiService()
    expect(service.sendRequestUpdatedNotification).toBeDefined()
    expect(typeof service.sendRequestUpdatedNotification).toBe('function')
  })

  describe('sendNewRequestNotification', () => {
    it('should emit newSupportRequest to admin room', () => {
      const service = new SupportSocketApiService()
      const request = {
        assignedTo: null,
        category: SUPPORT_CATEGORY.ISSUE,
        createdAt: new Date(),
        id: 'req-123',
        message: 'Help',
        resolvedAt: null,
        status: SUPPORT_STATUS.OPEN,
        subject: 'Test',
        updatedAt: new Date(),
        userId: 'user-123',
        userTimezone: 'UTC',
        viewedAt: null,
        viewedByAdmin: false,
      }

      service.sendNewRequestNotification(request)

      expect(mockTo).toHaveBeenCalledWith('support-admins')
      expect(mockEmit).toHaveBeenCalledWith('newSupportRequest', request)
    })
  })

  describe('sendRequestUpdatedNotification', () => {
    it('should emit supportRequestUpdated to admin room', () => {
      const service = new SupportSocketApiService()
      const request = {
        assignedTo: null,
        category: SUPPORT_CATEGORY.ISSUE,
        createdAt: new Date(),
        id: 'req-123',
        message: 'Help',
        resolvedAt: null,
        status: SUPPORT_STATUS.OPEN,
        subject: 'Test',
        updatedAt: new Date(),
        userId: 'user-123',
        userTimezone: 'UTC',
        viewedAt: null,
        viewedByAdmin: false,
      }

      service.sendRequestUpdatedNotification(request)

      expect(mockTo).toHaveBeenCalledWith('support-admins')
      expect(mockEmit).toHaveBeenCalledWith('supportRequestUpdated', request)
    })
  })
})
