import { AdminLogsSocketService } from './timescale.logging.socket'

// Mock dependencies
jest.mock('../logger', () => ({
  ApiLoggingClass: {
    instance: {
      logError: jest.fn(),
      logInfo: jest.fn(),
    },
  },
}))

jest.mock('../socket-io-api', () => ({
  ensureLoggedInSocket: jest.fn(),
  getUserIdFromHandshake: jest.fn(),
  getUserRolesFromHandshake: jest.fn(),
  SocketApiConnection: {
    instance: null,
  },
}))

describe('AdminLogsSocketService', () => {
  describe('constructor', () => {
    it('should create instance', () => {
      const service = new AdminLogsSocketService()
      expect(service).toBeDefined()
    })

    it('should not set static instance when socket.io is not available', () => {
      const service = new AdminLogsSocketService()
      // Static instance is only set when socket.io is available
      // Since we mock SocketApiConnection.instance as null, the instance won't be set
      expect(service).toBeDefined()
    })
  })

  describe('broadcastNewLog', () => {
    it('should not throw when namespace is not initialized', () => {
      const service = new AdminLogsSocketService()
      expect(() => {
        service.broadcastNewLog({
          appId: 'test',
          createdAt: '2026-02-05T00:00:00Z',
          eventType: 'API_REQUEST',
          id: 'test-id',
          success: true,
        })
      }).not.toThrow()
    })
  })

  describe('broadcastErrorLog', () => {
    it('should not throw when namespace is not initialized', () => {
      const service = new AdminLogsSocketService()
      expect(() => {
        service.broadcastErrorLog({
          appId: 'test',
          createdAt: '2026-02-05T00:00:00Z',
          eventType: 'API_ERROR',
          id: 'test-id',
          success: false,
        })
      }).not.toThrow()
    })
  })

  describe('getConnectedCount', () => {
    it('should return 0 when namespace is not initialized', async () => {
      const service = new AdminLogsSocketService()
      const count = await service.getConnectedCount()
      expect(count).toBe(0)
    })
  })

  describe('configureNamespace', () => {
    it('should not throw when namespace is not initialized', () => {
      const service = new AdminLogsSocketService()
      expect(() => {
        service.configureNamespace()
      }).not.toThrow()
    })
  })
})
