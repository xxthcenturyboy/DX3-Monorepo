import { SUPPORT_CATEGORY, SUPPORT_STATUS } from '@dx3/models-shared'

import { ApiLoggingClass } from '../logger'
import {
  ensureLoggedInSocket,
  getUserIdFromHandshake,
  getUserRolesFromHandshake,
} from '../socket-io-api'
import { SupportSocketApiService } from './support-api.socket'

const mockEmit = jest.fn()
const mockTo = jest.fn().mockReturnValue({ emit: mockEmit })
const mockUse = jest.fn().mockReturnThis()
const mockOn = jest.fn().mockReturnThis()
const mockOf = jest.fn().mockReturnValue({ emit: mockEmit, on: mockOn, to: mockTo, use: mockUse })

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
    mockUse.mockReturnThis()
    mockOn.mockReturnThis()
    mockOf.mockReturnValue({ emit: mockEmit, on: mockOn, to: mockTo, use: mockUse })
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

  it('should expose instance via static getter', () => {
    new SupportSocketApiService()
    expect(SupportSocketApiService.instance).toBeDefined()
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

    it('should log error when ns is null in sendRequestUpdatedNotification', () => {
      mockOf.mockReturnValueOnce(null)
      const service = new SupportSocketApiService()
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')
      service.sendRequestUpdatedNotification({ id: 'req-1' } as never)
      expect(logErrorSpy).toHaveBeenCalledWith(expect.stringContaining('namespace not initialized'))
    })

    it('should log error when sendRequestUpdatedNotification emit throws', () => {
      const service = new SupportSocketApiService()
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')
      mockTo.mockImplementationOnce(() => {
        throw new Error('emit failed')
      })
      service.sendRequestUpdatedNotification({ id: 'req-2' } as never)
      expect(logErrorSpy).toHaveBeenCalledWith(expect.stringContaining('emit failed'))
    })
  })

  describe('sendNewRequestNotification null ns', () => {
    it('should log error when ns is null in sendNewRequestNotification', () => {
      mockOf.mockReturnValueOnce(null)
      const service = new SupportSocketApiService()
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')
      service.sendNewRequestNotification({ id: 'req-3' } as never)
      expect(logErrorSpy).toHaveBeenCalledWith(expect.stringContaining('namespace not initialized'))
    })

    it('should log error when sendNewRequestNotification emit throws', () => {
      const service = new SupportSocketApiService()
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')
      mockTo.mockImplementationOnce(() => {
        throw new Error('new req emit failed')
      })
      service.sendNewRequestNotification({ id: 'req-4' } as never)
      expect(logErrorSpy).toHaveBeenCalledWith(expect.stringContaining('new req emit failed'))
    })
  })

  describe('constructor when socket.io is unavailable', () => {
    it('should log error and return early when socket.io instance is null', () => {
      const { SocketApiConnection } = require('../socket-io-api')
      const originalInstance = SocketApiConnection.instance
      Object.defineProperty(SocketApiConnection, 'instance', {
        configurable: true,
        get: () => ({ io: null }),
      })
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')
      new SupportSocketApiService()
      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Socket.IO instance not available'),
      )
      Object.defineProperty(SocketApiConnection, 'instance', {
        configurable: true,
        get: () => originalInstance,
      })
    })
  })

  describe('configureNamespace', () => {
    it('should log error and return when ns is null', () => {
      mockOf.mockReturnValueOnce(null)
      const service = new SupportSocketApiService()
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')
      service.configureNamespace()
      expect(logErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Namespace not initialized'))
    })

    it('should register middleware and connection handler', () => {
      const service = new SupportSocketApiService()
      service.configureNamespace()
      expect(mockUse).toHaveBeenCalledWith(expect.any(Function))
      expect(mockOn).toHaveBeenCalledWith('connection', expect.any(Function))
    })

    it('should call next(Error) when socket is not logged in via middleware', async () => {
      ;(ensureLoggedInSocket as jest.Mock).mockReturnValueOnce(false)
      const service = new SupportSocketApiService()
      let capturedMiddleware: (socket: unknown, next: (err?: Error) => void) => Promise<void> =
        async () => {}
      mockUse.mockImplementationOnce((fn: typeof capturedMiddleware) => {
        capturedMiddleware = fn
        return service.ns as never
      })
      mockOn.mockImplementationOnce(() => service.ns as never)
      service.configureNamespace()
      const nextFn = jest.fn()
      await capturedMiddleware({ handshake: {} }, nextFn)
      expect(nextFn).toHaveBeenCalledWith(expect.any(Error))
    })

    it('should call next(Error) when user is not admin via middleware', async () => {
      ;(ensureLoggedInSocket as jest.Mock).mockReturnValueOnce(true)
      ;(getUserRolesFromHandshake as jest.Mock).mockResolvedValueOnce(['USER'])
      const service = new SupportSocketApiService()
      let capturedMiddleware: (socket: unknown, next: (err?: Error) => void) => Promise<void> =
        async () => {}
      mockUse.mockImplementationOnce((fn: typeof capturedMiddleware) => {
        capturedMiddleware = fn
        return service.ns as never
      })
      mockOn.mockImplementationOnce(() => service.ns as never)
      service.configureNamespace()
      const nextFn = jest.fn()
      await capturedMiddleware({ handshake: {} }, nextFn)
      expect(nextFn).toHaveBeenCalledWith(expect.any(Error))
    })

    it('should call next() when user is admin via middleware', async () => {
      ;(ensureLoggedInSocket as jest.Mock).mockReturnValueOnce(true)
      ;(getUserRolesFromHandshake as jest.Mock).mockResolvedValueOnce(['ADMIN'])
      const service = new SupportSocketApiService()
      let capturedMiddleware: (socket: unknown, next: (err?: Error) => void) => Promise<void> =
        async () => {}
      mockUse.mockImplementationOnce((fn: typeof capturedMiddleware) => {
        capturedMiddleware = fn
        return service.ns as never
      })
      mockOn.mockImplementationOnce(() => service.ns as never)
      service.configureNamespace()
      const nextFn = jest.fn()
      await capturedMiddleware({ handshake: {} }, nextFn)
      expect(nextFn).toHaveBeenCalledWith()
    })

    it('should join admin room and invoke joinAdminRoom and disconnect handlers', async () => {
      ;(getUserIdFromHandshake as jest.Mock).mockReturnValueOnce('admin-user-id')
      ;(getUserRolesFromHandshake as jest.Mock).mockResolvedValueOnce(['ADMIN'])
      const service = new SupportSocketApiService()
      let capturedConnectionHandler: (socket: unknown) => Promise<void> = async () => {}
      mockUse.mockImplementationOnce(() => service.ns as never)
      mockOn.mockImplementationOnce((event: string, fn: typeof capturedConnectionHandler) => {
        if (event === 'connection') capturedConnectionHandler = fn
        return service.ns as never
      })
      service.configureNamespace()

      const joinFn = jest.fn()
      const registeredHandlers: Record<string, () => void> = {}
      const socketOnFn = jest.fn((event: string, handler: () => void) => {
        registeredHandlers[event] = handler
      })

      await capturedConnectionHandler({ handshake: {}, join: joinFn, on: socketOnFn })

      expect(joinFn).toHaveBeenCalledWith('support-admins')
      expect(socketOnFn).toHaveBeenCalledWith('joinAdminRoom', expect.any(Function))
      expect(socketOnFn).toHaveBeenCalledWith('disconnect', expect.any(Function))

      // Invoke inner handlers to cover lines 109-110 and 114
      registeredHandlers.joinAdminRoom?.()
      registeredHandlers.disconnect?.()
      expect(joinFn).toHaveBeenCalledTimes(2) // once from connection + once from joinAdminRoom
    })
  })
})
