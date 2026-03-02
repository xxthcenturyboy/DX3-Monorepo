import { LOG_EVENT_TYPE } from '@dx3/models-shared'

import { AdminLogsSocketService } from './timescale.logging.socket'

const mockEmit = jest.fn()
const mockLeave = jest.fn()
const mockTo = jest.fn().mockReturnValue({ emit: mockEmit })
const mockUse = jest.fn().mockReturnThis()
const mockOn = jest.fn().mockReturnThis()
const mockFetchSockets = jest.fn().mockResolvedValue([])
const mockIn = jest.fn().mockReturnValue({ fetchSockets: mockFetchSockets })

const mockNs = {
  emit: mockEmit,
  in: mockIn,
  on: mockOn,
  to: mockTo,
  use: mockUse,
}

const mockOf = jest.fn().mockReturnValue(mockNs)

// Mock dependencies
jest.mock('../logger', () => ({
  ApiLoggingClass: {
    instance: {
      logError: jest.fn(),
      logInfo: jest.fn(),
      logWarn: jest.fn(),
    },
  },
}))

// Default mock with active socket.io
jest.mock('../socket-io-api', () => ({
  ensureLoggedInSocket: jest.fn().mockReturnValue(true),
  getUserIdFromHandshake: jest.fn().mockReturnValue('user-123'),
  getUserRolesFromHandshake: jest.fn().mockResolvedValue(['LOGGING_ADMIN']),
  SocketApiConnection: {
    get instance() {
      return { io: { of: mockOf } }
    },
  },
}))

describe('AdminLogsSocketService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUse.mockReturnThis()
    mockOn.mockReturnThis()
    mockTo.mockReturnValue({ emit: mockEmit })
    mockIn.mockReturnValue({ fetchSockets: mockFetchSockets })
    mockFetchSockets.mockResolvedValue([])
    mockOf.mockReturnValue(mockNs)
  })

  describe('constructor', () => {
    it('should create instance with namespace when socket.io is available', () => {
      const service = new AdminLogsSocketService()
      expect(service).toBeDefined()
      expect(service.ns).toBeDefined()
    })

    it('should set static instance when socket.io is available', () => {
      new AdminLogsSocketService()
      expect(AdminLogsSocketService.instance).toBeDefined()
    })

    it('should log error and return early when socket.io is not available', () => {
      const { SocketApiConnection } = require('../socket-io-api')
      const { ApiLoggingClass } = require('../logger')
      const originalDescriptor = Object.getOwnPropertyDescriptor(SocketApiConnection, 'instance')
      Object.defineProperty(SocketApiConnection, 'instance', {
        configurable: true,
        get: () => null,
      })
      new AdminLogsSocketService()
      expect(ApiLoggingClass.instance.logError).toHaveBeenCalledWith(
        expect.stringContaining('Socket.IO instance not available'),
      )
      if (originalDescriptor) {
        Object.defineProperty(SocketApiConnection, 'instance', originalDescriptor)
      }
    })
  })

  describe('configureNamespace', () => {
    it('should log error and return early when ns is null', () => {
      mockOf.mockReturnValueOnce(null)
      const service = new AdminLogsSocketService()
      const { ApiLoggingClass } = require('../logger')
      service.configureNamespace()
      expect(ApiLoggingClass.instance.logError).toHaveBeenCalledWith(
        expect.stringContaining('Namespace not initialized'),
      )
    })

    it('should register middleware and connection handler when ns exists', () => {
      const service = new AdminLogsSocketService()
      service.configureNamespace()
      expect(mockUse).toHaveBeenCalledWith(expect.any(Function))
      expect(mockOn).toHaveBeenCalledWith('connection', expect.any(Function))
    })

    it('middleware should call next(Error) when socket is not logged in', async () => {
      const { ensureLoggedInSocket } = require('../socket-io-api')
      ;(ensureLoggedInSocket as jest.Mock).mockReturnValueOnce(false)
      const service = new AdminLogsSocketService()
      let capturedMiddleware: (socket: unknown, next: (err?: Error) => void) => Promise<void> =
        async () => {}
      mockUse.mockImplementationOnce((fn: typeof capturedMiddleware) => {
        capturedMiddleware = fn
        return mockNs as never
      })
      mockOn.mockImplementationOnce(() => mockNs as never)
      service.configureNamespace()
      const nextFn = jest.fn()
      await capturedMiddleware({ handshake: {} }, nextFn)
      expect(nextFn).toHaveBeenCalledWith(expect.any(Error))
    })

    it('middleware should call next(Error) when user lacks LOGGING_ADMIN role', async () => {
      const { ensureLoggedInSocket, getUserRolesFromHandshake } = require('../socket-io-api')
      ;(ensureLoggedInSocket as jest.Mock).mockReturnValueOnce(true)
      ;(getUserRolesFromHandshake as jest.Mock).mockResolvedValueOnce(['USER'])
      const service = new AdminLogsSocketService()
      let capturedMiddleware: (socket: unknown, next: (err?: Error) => void) => Promise<void> =
        async () => {}
      mockUse.mockImplementationOnce((fn: typeof capturedMiddleware) => {
        capturedMiddleware = fn
        return mockNs as never
      })
      mockOn.mockImplementationOnce(() => mockNs as never)
      service.configureNamespace()
      const nextFn = jest.fn()
      await capturedMiddleware({ handshake: {} }, nextFn)
      expect(nextFn).toHaveBeenCalledWith(expect.any(Error))
    })

    it('middleware should call next() when user has LOGGING_ADMIN role', async () => {
      const { ensureLoggedInSocket, getUserRolesFromHandshake } = require('../socket-io-api')
      ;(ensureLoggedInSocket as jest.Mock).mockReturnValueOnce(true)
      ;(getUserRolesFromHandshake as jest.Mock).mockResolvedValueOnce(['LOGGING_ADMIN'])
      const service = new AdminLogsSocketService()
      let capturedMiddleware: (socket: unknown, next: (err?: Error) => void) => Promise<void> =
        async () => {}
      mockUse.mockImplementationOnce((fn: typeof capturedMiddleware) => {
        capturedMiddleware = fn
        return mockNs as never
      })
      mockOn.mockImplementationOnce(() => mockNs as never)
      service.configureNamespace()
      const nextFn = jest.fn()
      await capturedMiddleware({ handshake: {} }, nextFn)
      expect(nextFn).toHaveBeenCalledWith()
    })

    it('connection handler should join all-logs room and register socket events', async () => {
      const { getUserIdFromHandshake, getUserRolesFromHandshake } = require('../socket-io-api')
      ;(getUserIdFromHandshake as jest.Mock).mockReturnValueOnce('admin-id')
      ;(getUserRolesFromHandshake as jest.Mock).mockResolvedValueOnce(['LOGGING_ADMIN'])
      const service = new AdminLogsSocketService()
      let capturedConnectionHandler: (socket: unknown) => Promise<void> = async () => {}
      mockUse.mockImplementationOnce(() => mockNs as never)
      mockOn.mockImplementationOnce((event: string, fn: typeof capturedConnectionHandler) => {
        if (event === 'connection') capturedConnectionHandler = fn
        return mockNs as never
      })
      service.configureNamespace()

      const joinFn = jest.fn()
      const registeredHandlers: Record<string, () => void> = {}
      const socketOnFn = jest.fn((event: string, handler: () => void) => {
        registeredHandlers[event] = handler
      })

      await capturedConnectionHandler({
        handshake: {},
        join: joinFn,
        leave: mockLeave,
        on: socketOnFn,
      })

      expect(joinFn).toHaveBeenCalledWith('all-logs')
      expect(socketOnFn).toHaveBeenCalledWith('subscribe-errors', expect.any(Function))
      expect(socketOnFn).toHaveBeenCalledWith('unsubscribe-errors', expect.any(Function))
      expect(socketOnFn).toHaveBeenCalledWith('disconnect', expect.any(Function))

      // Invoke inner handlers to cover lines 116-128
      registeredHandlers['subscribe-errors']?.()
      expect(joinFn).toHaveBeenCalledWith('error-logs')
      registeredHandlers['unsubscribe-errors']?.()
      expect(mockLeave).toHaveBeenCalledWith('error-logs')
      registeredHandlers.disconnect?.()
    })
  })

  describe('broadcastNewLog', () => {
    it('should emit to all-logs and error-logs when log is an error (success=false)', () => {
      const service = new AdminLogsSocketService()
      const errLog = {
        appId: 'test',
        createdAt: '2026-02-05T00:00:00Z',
        eventType: LOG_EVENT_TYPE.API_ERROR,
        id: 'err-1',
        success: false,
      }
      service.broadcastNewLog(errLog)
      expect(mockTo).toHaveBeenCalledWith('all-logs')
      expect(mockEmit).toHaveBeenCalledWith('new-log', errLog)
      expect(mockTo).toHaveBeenCalledWith('error-logs')
      expect(mockEmit).toHaveBeenCalledWith('error-log', errLog)
    })

    it('should only emit to all-logs when log is successful (success=true)', () => {
      const service = new AdminLogsSocketService()
      const successLog = {
        appId: 'test',
        createdAt: '2026-02-05T00:00:00Z',
        eventType: LOG_EVENT_TYPE.API_REQUEST,
        id: 'req-1',
        success: true,
      }
      service.broadcastNewLog(successLog)
      expect(mockTo).toHaveBeenCalledWith('all-logs')
      expect(mockTo).not.toHaveBeenCalledWith('error-logs')
    })

    it('should silently return when ns is null', () => {
      mockOf.mockReturnValueOnce(null)
      const service = new AdminLogsSocketService()
      expect(() => service.broadcastNewLog({ id: 'x', success: true } as never)).not.toThrow()
    })

    it('should log error when emit throws', () => {
      const service = new AdminLogsSocketService()
      const { ApiLoggingClass } = require('../logger')
      mockTo.mockImplementationOnce(() => {
        throw new Error('socket emit failed')
      })
      service.broadcastNewLog({ id: 'x', success: false } as never)
      expect(ApiLoggingClass.instance.logError).toHaveBeenCalledWith(
        expect.stringContaining('socket emit failed'),
      )
    })
  })

  describe('broadcastErrorLog', () => {
    it('should emit error-log to error-logs room', () => {
      const service = new AdminLogsSocketService()
      const errLog = { id: 'err-2', success: false } as never
      service.broadcastErrorLog(errLog)
      expect(mockTo).toHaveBeenCalledWith('error-logs')
      expect(mockEmit).toHaveBeenCalledWith('error-log', errLog)
    })

    it('should silently return when ns is null', () => {
      mockOf.mockReturnValueOnce(null)
      const service = new AdminLogsSocketService()
      expect(() => service.broadcastErrorLog({ id: 'x' } as never)).not.toThrow()
    })

    it('should log error when emit throws in broadcastErrorLog', () => {
      const service = new AdminLogsSocketService()
      const { ApiLoggingClass } = require('../logger')
      mockTo.mockImplementationOnce(() => {
        throw new Error('error log emit failed')
      })
      service.broadcastErrorLog({ id: 'x', success: false } as never)
      expect(ApiLoggingClass.instance.logError).toHaveBeenCalledWith(
        expect.stringContaining('error log emit failed'),
      )
    })
  })

  describe('getConnectedCount', () => {
    it('should return 0 when namespace is null', async () => {
      mockOf.mockReturnValueOnce(null)
      const service = new AdminLogsSocketService()
      const count = await service.getConnectedCount()
      expect(count).toBe(0)
    })

    it('should return the number of connected sockets', async () => {
      const service = new AdminLogsSocketService()
      mockFetchSockets.mockResolvedValueOnce([{}, {}, {}])
      const count = await service.getConnectedCount()
      expect(count).toBe(3)
    })
  })

  describe('alert emission methods', () => {
    const authPayload = {
      count: 5,
      fingerprint: 'fp-1',
      ipAddress: '1.2.3.4',
      timestamp: new Date().toISOString(),
      timeWindowMinutes: 5,
    }
    const rateLimitPayload = {
      count: 100,
      endpoint: '/api/test',
      ipAddress: '1.2.3.4',
      timestamp: new Date().toISOString(),
    }
    const securityPayload = {
      alertType: 'SUSPICIOUS_ACTIVITY',
      details: {},
      ipAddress: '1.2.3.4',
      timestamp: new Date().toISOString(),
    }

    it('should emit auth_failure_warning', () => {
      const service = new AdminLogsSocketService()
      service.emitAuthFailureWarning(authPayload)
      expect(mockTo).toHaveBeenCalledWith('all-logs')
      expect(mockEmit).toHaveBeenCalledWith('auth_failure_warning', authPayload)
    })

    it('should return early when ns is null in emitAuthFailureWarning', () => {
      mockOf.mockReturnValueOnce(null)
      const service = new AdminLogsSocketService()
      expect(() => service.emitAuthFailureWarning(authPayload)).not.toThrow()
    })

    it('should log error when emitAuthFailureWarning emit throws', () => {
      const service = new AdminLogsSocketService()
      const { ApiLoggingClass } = require('../logger')
      mockTo.mockImplementationOnce(() => {
        throw new Error('warning emit failed')
      })
      service.emitAuthFailureWarning(authPayload)
      expect(ApiLoggingClass.instance.logError).toHaveBeenCalledWith(
        expect.stringContaining('warning emit failed'),
      )
    })

    it('should emit auth_failure_critical', () => {
      const service = new AdminLogsSocketService()
      service.emitAuthFailureCritical(authPayload)
      expect(mockTo).toHaveBeenCalledWith('all-logs')
      expect(mockEmit).toHaveBeenCalledWith('auth_failure_critical', authPayload)
    })

    it('should return early when ns is null in emitAuthFailureCritical', () => {
      mockOf.mockReturnValueOnce(null)
      const service = new AdminLogsSocketService()
      expect(() => service.emitAuthFailureCritical(authPayload)).not.toThrow()
    })

    it('should log error when emitAuthFailureCritical emit throws', () => {
      const service = new AdminLogsSocketService()
      const { ApiLoggingClass } = require('../logger')
      mockTo.mockImplementationOnce(() => {
        throw new Error('critical emit failed')
      })
      service.emitAuthFailureCritical(authPayload)
      expect(ApiLoggingClass.instance.logError).toHaveBeenCalledWith(
        expect.stringContaining('critical emit failed'),
      )
    })

    it('should emit rate_limit_alert', () => {
      const service = new AdminLogsSocketService()
      service.emitRateLimitAlert(rateLimitPayload)
      expect(mockEmit).toHaveBeenCalledWith('rate_limit_alert', rateLimitPayload)
    })

    it('should return early when ns is null in emitRateLimitAlert', () => {
      mockOf.mockReturnValueOnce(null)
      const service = new AdminLogsSocketService()
      expect(() => service.emitRateLimitAlert(rateLimitPayload)).not.toThrow()
    })

    it('should log error when emitRateLimitAlert emit throws', () => {
      const service = new AdminLogsSocketService()
      const { ApiLoggingClass } = require('../logger')
      mockTo.mockImplementationOnce(() => {
        throw new Error('rate limit emit failed')
      })
      service.emitRateLimitAlert(rateLimitPayload)
      expect(ApiLoggingClass.instance.logError).toHaveBeenCalledWith(
        expect.stringContaining('rate limit emit failed'),
      )
    })

    it('should emit security_alert', () => {
      const service = new AdminLogsSocketService()
      service.emitSecurityAlert(securityPayload)
      expect(mockEmit).toHaveBeenCalledWith('security_alert', securityPayload)
    })

    it('should return early when ns is null in emitSecurityAlert', () => {
      mockOf.mockReturnValueOnce(null)
      const service = new AdminLogsSocketService()
      expect(() => service.emitSecurityAlert(securityPayload)).not.toThrow()
    })

    it('should log error when emitSecurityAlert emit throws', () => {
      const service = new AdminLogsSocketService()
      const { ApiLoggingClass } = require('../logger')
      mockTo.mockImplementationOnce(() => {
        throw new Error('security alert emit failed')
      })
      service.emitSecurityAlert(securityPayload)
      expect(ApiLoggingClass.instance.logError).toHaveBeenCalledWith(
        expect.stringContaining('security alert emit failed'),
      )
    })
  })
})
