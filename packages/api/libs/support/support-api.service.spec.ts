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
        status: SUPPORT_STATUS.NEW,
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
      expect(result.status).toBe(SUPPORT_STATUS.NEW)
    })

    it('should throw error if subject is empty', async () => {
      const invalidPayload = { ...validPayload, subject: '' }

      await expect(service.createRequest(mockUserId, invalidPayload)).rejects.toThrow(
        'Subject is required',
      )
    })

    it('should throw error if subject exceeds max length', async () => {
      const invalidPayload = {
        ...validPayload,
        subject: 'a'.repeat(SUPPORT_VALIDATION.SUBJECT_MAX_LENGTH + 1),
      }

      await expect(service.createRequest(mockUserId, invalidPayload)).rejects.toThrow(
        `Subject must be ${SUPPORT_VALIDATION.SUBJECT_MAX_LENGTH} characters or less`,
      )
    })

    it('should throw error if message is empty', async () => {
      const invalidPayload = { ...validPayload, message: '' }

      await expect(service.createRequest(mockUserId, invalidPayload)).rejects.toThrow(
        'Message is required',
      )
    })

    it('should throw error if message exceeds max length', async () => {
      const invalidPayload = {
        ...validPayload,
        message: 'a'.repeat(SUPPORT_VALIDATION.MESSAGE_MAX_LENGTH + 1),
      }

      await expect(service.createRequest(mockUserId, invalidPayload)).rejects.toThrow(
        `Message must be ${SUPPORT_VALIDATION.MESSAGE_MAX_LENGTH} characters or less`,
      )
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
            status: SUPPORT_STATUS.NEW,
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
  })

  describe('getById', () => {
    it('should return request by id', async () => {
      const mockRequest = {
        assignedTo: null,
        category: SUPPORT_CATEGORY.ISSUE,
        createdAt: new Date(),
        id: 'test-id',
        message: 'Test message',
        resolvedAt: null,
        status: SUPPORT_STATUS.NEW,
        subject: 'Test subject',
        updatedAt: new Date(),
        userId: 'user-id',
        viewedAt: null,
        viewedByAdmin: false,
      }

      ;(SupportRequestModel.getById as jest.Mock).mockResolvedValue(mockRequest)

      const result = await service.getById('test-id')

      expect(result).toBeDefined()
      expect(result.id).toBe('test-id')
    })

    it('should throw error if request not found', async () => {
      ;(SupportRequestModel.getById as jest.Mock).mockResolvedValue(null)

      await expect(service.getById('non-existent-id')).rejects.toThrow(
        'Support request not found',
      )
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
  })

  describe('markAsViewed', () => {
    it('should mark request as viewed', async () => {
      ;(SupportRequestModel.markAsViewed as jest.Mock).mockResolvedValue([1])

      const result = await service.markAsViewed('test-id')

      expect(result.success).toBe(true)
    })
  })

  describe('markAllAsViewed', () => {
    it('should mark all requests as viewed', async () => {
      ;(SupportRequestModel.markAllAsViewed as jest.Mock).mockResolvedValue([5])

      const result = await service.markAllAsViewed()

      expect(result.success).toBe(true)
    })
  })

  describe('bulkUpdateStatus', () => {
    it('should bulk update status', async () => {
      ;(SupportRequestModel.updateStatus as jest.Mock).mockResolvedValue([1])

      const result = await service.bulkUpdateStatus(
        ['id-1', 'id-2', 'id-3'],
        SUPPORT_STATUS.CLOSED,
      )

      expect(result.success).toBe(true)
      expect(result.updated).toBe(3)
    })
  })
})
