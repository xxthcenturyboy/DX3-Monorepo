const mockSocketOn = jest.fn()
const mockSocket = {
  connected: false,
  disconnect: jest.fn(),
  emit: jest.fn(),
  on: mockSocketOn,
}

jest.mock('../data/socket-io/socket-web.connection', () => ({
  SocketWebConnection: {
    createSocket: jest.fn().mockResolvedValue(mockSocket),
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
  })

  it('should be a class', () => {
    expect(NotificationWebSockets).toBeDefined()
  })

  it('should have a static instance getter', () => {
    expect('instance' in NotificationWebSockets).toBe(true)
  })

  describe('instance creation', () => {
    it('should create a new instance', () => {
      const instance = new NotificationWebSockets()
      expect(instance).toBeDefined()
    })

    it('should have a setupSocket method', () => {
      const instance = new NotificationWebSockets()
      expect(typeof instance.setupSocket).toBe('function')
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
})
