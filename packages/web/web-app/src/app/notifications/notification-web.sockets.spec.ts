const mockSocketOn = jest.fn()
const mockSocketDisconnect = jest.fn()
const mockSocket = {
  connected: false,
  disconnect: mockSocketDisconnect,
  emit: jest.fn(),
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
    dispatch: jest.fn(),
    getState: jest.fn().mockReturnValue({ auth: { token: null } }),
  },
}))

jest.mock('react-toastify', () => ({
  toast: { info: jest.fn() },
}))

import { NotificationWebSockets } from './notification-web.sockets'

describe('NotificationWebSockets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset singleton state between tests by disconnecting any live instance
    NotificationWebSockets.instance?.disconnect()
  })

  it('should be a class', () => {
    expect(NotificationWebSockets).toBeDefined()
  })

  it('should have a static instance getter', () => {
    expect('instance' in NotificationWebSockets).toBe(true)
  })

  it('should have a static isInitializing getter', () => {
    expect('isInitializing' in NotificationWebSockets).toBe(true)
  })

  describe('instance creation', () => {
    it('should create a new instance', () => {
      const instance = new NotificationWebSockets()
      expect(instance).toBeDefined()
    })

    it('should set isInitializing to true synchronously in the constructor', () => {
      // Pause createSocket so the await never resolves during this assertion
      mockCreateSocket.mockReturnValueOnce(new Promise(() => undefined))
      new NotificationWebSockets()
      expect(NotificationWebSockets.isInitializing).toBe(true)
    })

    it('should clear isInitializing and set instance after setupSocket resolves', async () => {
      const instance = new NotificationWebSockets()
      await instance.setupSocket()
      expect(NotificationWebSockets.isInitializing).toBe(false)
      expect(NotificationWebSockets.instance).toBe(instance)
    })

    it('should have a setupSocket method', () => {
      const instance = new NotificationWebSockets()
      expect(typeof instance.setupSocket).toBe('function')
    })

    it('should have a disconnect method', () => {
      const instance = new NotificationWebSockets()
      expect(typeof instance.disconnect).toBe('function')
    })
  })

  describe('setupSocket', () => {
    it('should register socket event handlers', async () => {
      const instance = new NotificationWebSockets()
      await instance.setupSocket()
      expect(mockSocketOn).toHaveBeenCalledWith('sendAppUpdateNotification', expect.any(Function))
      expect(mockSocketOn).toHaveBeenCalledWith('sendNotification', expect.any(Function))
      expect(mockSocketOn).toHaveBeenCalledWith('sendSystemNotification', expect.any(Function))
    })
  })

  describe('disconnect', () => {
    it('should call disconnect on the underlying socket', async () => {
      const instance = new NotificationWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(mockSocketDisconnect).toHaveBeenCalled()
    })

    it('should null socket after disconnect', async () => {
      const instance = new NotificationWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(instance.socket).toBeNull()
    })

    it('should null the static instance after disconnect', async () => {
      const instance = new NotificationWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(NotificationWebSockets.instance).toBeNull()
    })

    it('should reset isInitializing to false after disconnect', async () => {
      const instance = new NotificationWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(NotificationWebSockets.isInitializing).toBe(false)
    })

    it('should not throw when socket is already null', () => {
      const instance = new NotificationWebSockets()
      expect(() => instance.disconnect()).not.toThrow()
    })
  })

  describe('duplicate connection guard', () => {
    it('should not create a second socket when isInitializing is true', () => {
      // First construction sets isInitializing=true before the await resolves
      mockCreateSocket.mockReturnValueOnce(new Promise(() => undefined))
      new NotificationWebSockets()
      expect(NotificationWebSockets.isInitializing).toBe(true)

      // Simulating the guard check in connectToSockets
      const wouldCreateDuplicate =
        !NotificationWebSockets.instance && !NotificationWebSockets.isInitializing
      expect(wouldCreateDuplicate).toBe(false)
    })
  })
})
