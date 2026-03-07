const mockSocketEmit = jest.fn()
const mockSocketOn = jest.fn()
const mockSocketDisconnect = jest.fn()

const mockSocket = {
  connected: false,
  disconnect: mockSocketDisconnect,
  emit: mockSocketEmit,
  on: mockSocketOn,
}

const mockCreateSocket = jest.fn().mockResolvedValue(mockSocket)

jest.mock('../data/socket-io/socket-web.connection', () => ({
  SocketWebConnection: {
    createSocket: mockCreateSocket,
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
    AdminLogsWebSockets.instance?.disconnect()
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

  it('should have a static isInitializing getter', () => {
    expect('isInitializing' in AdminLogsWebSockets).toBe(true)
  })

  describe('instance creation', () => {
    it('should create a new instance', () => {
      const instance = new AdminLogsWebSockets()
      expect(instance).toBeDefined()
    })

    it('should set isInitializing to true synchronously in the constructor', () => {
      mockCreateSocket.mockReturnValueOnce(new Promise(() => undefined))
      new AdminLogsWebSockets()
      expect(AdminLogsWebSockets.isInitializing).toBe(true)
    })

    it('should clear isInitializing and set instance after setupSocket resolves', async () => {
      const instance = new AdminLogsWebSockets()
      await instance.setupSocket()
      expect(AdminLogsWebSockets.isInitializing).toBe(false)
      expect(AdminLogsWebSockets.instance).toBe(instance)
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
      await new Promise((resolve) => setTimeout(resolve, 50))
      instance.disconnect()
      expect(mockSocketDisconnect).toHaveBeenCalled()
    })

    it('should null socket after disconnect', async () => {
      const instance = new AdminLogsWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(instance.socket).toBeNull()
    })

    it('should null the static instance after disconnect', async () => {
      const instance = new AdminLogsWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(AdminLogsWebSockets.instance).toBeNull()
    })

    it('should reset isInitializing to false after disconnect', async () => {
      const instance = new AdminLogsWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(AdminLogsWebSockets.isInitializing).toBe(false)
    })

    it('should not throw when socket is already null', () => {
      const instance = new AdminLogsWebSockets()
      expect(() => instance.disconnect()).not.toThrow()
    })
  })

  describe('static connect()', () => {
    it('should not create a new instance when isInitializing is true', () => {
      mockCreateSocket.mockReturnValueOnce(new Promise(() => undefined))
      new AdminLogsWebSockets()
      expect(AdminLogsWebSockets.isInitializing).toBe(true)

      AdminLogsWebSockets.connect()
      // createSocket was only called once (from the first new AdminLogsWebSockets())
      expect(mockCreateSocket).toHaveBeenCalledTimes(1)
    })
  })

  describe('static cleanup()', () => {
    it('should disconnect the instance when one exists', async () => {
      const instance = new AdminLogsWebSockets()
      await instance.setupSocket()
      AdminLogsWebSockets.cleanup()
      expect(mockSocketDisconnect).toHaveBeenCalled()
      expect(AdminLogsWebSockets.instance).toBeNull()
    })

    it('should not throw when no instance exists', () => {
      expect(() => AdminLogsWebSockets.cleanup()).not.toThrow()
    })
  })

  describe('duplicate connection guard', () => {
    it('should not create a second socket when isInitializing is true', () => {
      mockCreateSocket.mockReturnValueOnce(new Promise(() => undefined))
      new AdminLogsWebSockets()
      expect(AdminLogsWebSockets.isInitializing).toBe(true)

      const wouldCreateDuplicate =
        !AdminLogsWebSockets.instance && !AdminLogsWebSockets.isInitializing
      expect(wouldCreateDuplicate).toBe(false)
    })
  })
})
