import { SUPPORT_CATEGORY, SUPPORT_STATUS, SUPPORT_VALIDATION } from '@dx3/models-shared'

import { ApiLoggingClass } from '../logger'
import { SupportRequestModel } from './support-api.postgres-model'
import { SupportService } from './support-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('./support-api.postgres-model')

describe('SupportService', () => {
  let service: SupportService

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    service = new SupportService()
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('should exist when imported', () => {
      expect(SupportService).toBeDefined()
    })

    it('should exist when instantiated', () => {
      expect(service).toBeDefined()
    })

    it('should have the correct methods', () => {
      expect(service.createRequest).toBeDefined()
      expect(service.getList).toBeDefined()
      expect(service.getById).toBeDefined()
      expect(service.getByUserId).toBeDefined()
      expect(service.getUnviewedCount).toBeDefined()
      expect(service.updateStatus).toBeDefined()
      expect(service.markAsViewed).toBeDefined()
      expect(service.markAllAsViewed).toBeDefined()
      expect(service.bulkUpdateStatus).toBeDefined()
    })
  })

  describe('createRequest', () => {
    const mockUserId = 'test-user-id'
    const validPayload = {
      category: SUPPORT_CATEGORY.ISSUE,
      message: 'Test message',
      subject: 'Test subject',
    }

    it('should create a request successfully', async () => {
      const mockRequest = {
        ...validPayload,
        assignedTo: null,
        createdAt: new Date(),
        id: 'test-id',
        resolvedAt: null,
        status: SUPPORT_STATUS.OPEN,
        updatedAt: new Date(),
        userId: mockUserId,
        viewedAt: null,
        viewedByAdmin: false,
      }

      ;(SupportRequestModel.getOpenRequestCountForUser as jest.Mock).mockResolvedValue(0)
      ;(SupportRequestModel.createNew as jest.Mock).mockResolvedValue(mockRequest)

      const result = await service.createRequest(mockUserId, validPayload)

      expect(result).toBeDefined()
      expect(result.id).toBe('test-id')
      expect(result.status).toBe(SUPPORT_STATUS.OPEN)
    })

    it('should throw error if user has too many open requests', async () => {
      ;(SupportRequestModel.getOpenRequestCountForUser as jest.Mock).mockResolvedValue(
        SUPPORT_VALIDATION.MAX_OPEN_REQUESTS_PER_DAY,
      )

      await expect(service.createRequest(mockUserId, validPayload)).rejects.toThrow(
        `You have reached the maximum of ${SUPPORT_VALIDATION.MAX_OPEN_REQUESTS_PER_DAY} open requests per day`,
      )
    })
  })

  describe('getList', () => {
    it('should return paginated list', async () => {
      const mockResult = {
        count: 1,
        rows: [
          {
            category: SUPPORT_CATEGORY.ISSUE,
            createdAt: new Date(),
            id: 'test-id',
            status: SUPPORT_STATUS.OPEN,
            subject: 'Test',
            userDisplayName: 'testuser',
            userEmail: null,
            userFullName: null,
            userId: 'user-id',
            username: 'testuser',
          },
        ],
      }

      ;(SupportRequestModel.getList as jest.Mock).mockResolvedValue(mockResult)

      const result = await service.getList({ limit: 10, offset: 0 })

      expect(result.count).toBe(1)
      expect(result.rows).toHaveLength(1)
    })

    it('should throw server error when getList fails', async () => {
      ;(SupportRequestModel.getList as jest.Mock).mockRejectedValue(new Error('DB error'))
      await expect(service.getList({ limit: 10, offset: 0 })).rejects.toThrow('DB error')
    })
  })

  describe('getById', () => {
    const mockRequest = {
      assignedTo: null,
      category: SUPPORT_CATEGORY.ISSUE,
      createdAt: new Date(),
      id: 'test-id',
      message: 'Test message',
      resolvedAt: null,
      status: SUPPORT_STATUS.OPEN,
      subject: 'Test subject',
      updatedAt: new Date(),
      userId: 'user-id',
      viewedAt: null,
      viewedByAdmin: false,
    }

    it('should return request by id', async () => {
      ;(SupportRequestModel.getById as jest.Mock).mockResolvedValue(mockRequest)

      const result = await service.getById('test-id')

      expect(result).toBeDefined()
      expect(result.id).toBe('test-id')
    })

    it('should map user display fields when user has first and last name', async () => {
      ;(SupportRequestModel.getById as jest.Mock).mockResolvedValue({
        ...mockRequest,
        user: { firstName: 'John', lastName: 'Doe', username: 'jdoe' },
      })
      const result = await service.getById('test-id')
      expect(result.userFullName).toBe('John Doe')
      expect(result.userDisplayName).toBe('jdoe')
    })

    it('should map user display fields when user has only firstName', async () => {
      ;(SupportRequestModel.getById as jest.Mock).mockResolvedValue({
        ...mockRequest,
        user: { firstName: 'Jane' },
      })
      const result = await service.getById('test-id')
      expect(result.userFullName).toBe('Jane')
    })

    it('should map user display fields as Unknown when no user info', async () => {
      ;(SupportRequestModel.getById as jest.Mock).mockResolvedValue({
        ...mockRequest,
        user: {},
      })
      const result = await service.getById('test-id')
      expect(result.userDisplayName).toBe('Unknown')
    })

    it('should throw error if request not found', async () => {
      ;(SupportRequestModel.getById as jest.Mock).mockResolvedValue(null)

      await expect(service.getById('non-existent-id')).rejects.toThrow('Support request not found')
    })
  })

  describe('getByUserId', () => {
    it('should return requests for user', async () => {
      const mockRequest = {
        assignedTo: null,
        category: SUPPORT_CATEGORY.ISSUE,
        createdAt: new Date(),
        id: 'req-1',
        message: 'Help me',
        resolvedAt: null,
        status: SUPPORT_STATUS.OPEN,
        subject: 'Issue',
        updatedAt: new Date(),
        userId: 'user-id',
        viewedAt: null,
        viewedByAdmin: false,
      }
      ;(SupportRequestModel.getByUserId as jest.Mock).mockResolvedValue([mockRequest])
      const result = await service.getByUserId('user-id')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('req-1')
    })

    it('should throw server error when getByUserId fails', async () => {
      ;(SupportRequestModel.getByUserId as jest.Mock).mockRejectedValue(new Error('Query failed'))
      await expect(service.getByUserId('user-id')).rejects.toThrow('Query failed')
    })
  })

  describe('updateStatus', () => {
    it('should update status successfully', async () => {
      const mockRequest = {
        assignedTo: 'admin-id',
        category: SUPPORT_CATEGORY.ISSUE,
        createdAt: new Date(),
        id: 'test-id',
        message: 'Test message',
        resolvedAt: null,
        status: SUPPORT_STATUS.OPEN,
        subject: 'Test subject',
        updatedAt: new Date(),
        userId: 'user-id',
        viewedAt: null,
        viewedByAdmin: true,
      }

      ;(SupportRequestModel.updateStatus as jest.Mock).mockResolvedValue([1])
      ;(SupportRequestModel.getById as jest.Mock).mockResolvedValue(mockRequest)

      const result = await service.updateStatus('test-id', { status: SUPPORT_STATUS.OPEN })

      expect(result.status).toBe(SUPPORT_STATUS.OPEN)
    })

    it('should throw error if setting in_progress without assignment', async () => {
      await expect(
        service.updateStatus('test-id', { status: SUPPORT_STATUS.IN_PROGRESS }),
      ).rejects.toThrow('Assignment is required before changing status to in_progress')
    })

    it('should throw not found when updateStatus returns 0 updated rows', async () => {
      ;(SupportRequestModel.updateStatus as jest.Mock).mockResolvedValue([0])
      await expect(
        service.updateStatus('missing-id', { status: SUPPORT_STATUS.OPEN }),
      ).rejects.toThrow('Support request not found')
    })

    it('should allow in_progress with assignment', async () => {
      const mockRequest = {
        assignedTo: 'admin-id',
        category: SUPPORT_CATEGORY.ISSUE,
        createdAt: new Date(),
        id: 'test-id',
        message: 'Test message',
        resolvedAt: null,
        status: SUPPORT_STATUS.IN_PROGRESS,
        subject: 'Test subject',
        updatedAt: new Date(),
        userId: 'user-id',
        viewedAt: null,
        viewedByAdmin: true,
      }

      ;(SupportRequestModel.updateStatus as jest.Mock).mockResolvedValue([1])
      ;(SupportRequestModel.getById as jest.Mock).mockResolvedValue(mockRequest)

      const result = await service.updateStatus('test-id', {
        assignedTo: 'admin-id',
        status: SUPPORT_STATUS.IN_PROGRESS,
      })

      expect(result.status).toBe(SUPPORT_STATUS.IN_PROGRESS)
      expect(result.assignedTo).toBe('admin-id')
    })
  })

  describe('getUnviewedCount', () => {
    it('should return unviewed count', async () => {
      ;(SupportRequestModel.getUnviewedCount as jest.Mock).mockResolvedValue(5)

      const result = await service.getUnviewedCount()

      expect(result.count).toBe(5)
    })

    it('should throw server error when getUnviewedCount fails', async () => {
      ;(SupportRequestModel.getUnviewedCount as jest.Mock).mockRejectedValue(
        new Error('Count query failed'),
      )
      await expect(service.getUnviewedCount()).rejects.toThrow('Count query failed')
    })
  })

  describe('markAsViewed', () => {
    it('should mark request as viewed', async () => {
      ;(SupportRequestModel.markAsViewed as jest.Mock).mockResolvedValue([1])

      const result = await service.markAsViewed('test-id')

      expect(result.success).toBe(true)
    })

    it('should throw server error when markAsViewed fails', async () => {
      ;(SupportRequestModel.markAsViewed as jest.Mock).mockRejectedValue(
        new Error('Mark viewed failed'),
      )
      await expect(service.markAsViewed('test-id')).rejects.toThrow('Mark viewed failed')
    })
  })

  describe('markAllAsViewed', () => {
    it('should mark all requests as viewed', async () => {
      ;(SupportRequestModel.markAllAsViewed as jest.Mock).mockResolvedValue([5])

      const result = await service.markAllAsViewed()

      expect(result.success).toBe(true)
    })

    it('should throw server error when markAllAsViewed fails', async () => {
      ;(SupportRequestModel.markAllAsViewed as jest.Mock).mockRejectedValue(
        new Error('Mark all viewed failed'),
      )
      await expect(service.markAllAsViewed()).rejects.toThrow('Mark all viewed failed')
    })
  })

  describe('bulkUpdateStatus', () => {
    it('should bulk update status', async () => {
      ;(SupportRequestModel.updateStatus as jest.Mock).mockResolvedValue([1])

      const result = await service.bulkUpdateStatus(['id-1', 'id-2', 'id-3'], SUPPORT_STATUS.CLOSED)

      expect(result.success).toBe(true)
      expect(result.updated).toBe(3)
    })

    it('should throw server error when bulkUpdateStatus fails', async () => {
      ;(SupportRequestModel.updateStatus as jest.Mock).mockRejectedValue(
        new Error('Bulk update failed'),
      )
      await expect(service.bulkUpdateStatus(['id-1'], SUPPORT_STATUS.CLOSED)).rejects.toThrow(
        'Bulk update failed',
      )
    })
  })
})
