const mockSocketEmit = jest.fn()
const mockSocketOn = jest.fn()
const mockSocketDisconnect = jest.fn()

const mockSocket = {
  connected: false,
  disconnect: mockSocketDisconnect,
  emit: mockSocketEmit,
  on: mockSocketOn,
}

jest.mock('../data/socket-io/socket-web.connection', () => ({
  SocketWebConnection: {
    createSocket: jest.fn().mockResolvedValue(mockSocket),
  },
}))

jest.mock('../store/store-web.redux', () => ({
  store: {
    getState: jest.fn().mockReturnValue({
      i18n: {
        translations: {
          ADMIN_LOGS_ALERT_AUTH_FAILURE_CRITICAL:
            'CRITICAL: {count} auth failures from {ipAddress}',
          ADMIN_LOGS_ALERT_AUTH_FAILURE_WARNING: 'Warning: {count} auth failures from {ipAddress}',
          ADMIN_LOGS_ALERT_RATE_LIMIT: 'Rate limit triggered from {ipAddress} on {endpoint}',
          ADMIN_LOGS_ALERT_SECURITY: 'Security Alert: {alertType}',
        },
      },
    }),
  },
}))

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    warning: jest.fn(),
  },
}))

import { AdminLogsWebSockets } from './admin-logs-web.sockets'

describe('AdminLogsWebSockets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(mockSocket.connected as boolean) = false
  })

  it('should be a class', () => {
    expect(AdminLogsWebSockets).toBeDefined()
  })

  it('should have a static connect() method', () => {
    expect(typeof AdminLogsWebSockets.connect).toBe('function')
  })

  it('should have a static cleanup() method', () => {
    expect(typeof AdminLogsWebSockets.cleanup).toBe('function')
  })

  it('should have a static instance getter', () => {
    expect('instance' in AdminLogsWebSockets).toBe(true)
  })

  describe('instance creation', () => {
    it('should create a new instance', () => {
      const instance = new AdminLogsWebSockets()
      expect(instance).toBeDefined()
    })

    it('should have an isConnected method', () => {
      const instance = new AdminLogsWebSockets()
      expect(typeof instance.isConnected).toBe('function')
    })

    it('should return false from isConnected initially', () => {
      const instance = new AdminLogsWebSockets()
      expect(instance.isConnected()).toBe(false)
    })

    it('should have a disconnect method', () => {
      const instance = new AdminLogsWebSockets()
      expect(typeof instance.disconnect).toBe('function')
    })
  })

  describe('disconnect', () => {
    it('should call disconnect on socket', async () => {
      const instance = new AdminLogsWebSockets()
      // Wait for setupSocket to complete
      await new Promise((resolve) => setTimeout(resolve, 50))
      instance.disconnect()
      expect(mockSocketDisconnect).toHaveBeenCalled()
    })
  })
})
