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
    dispatch: jest.fn(),
    getState: jest.fn().mockReturnValue({
      auth: { token: null },
      i18n: {
        translations: {
          SUPPORT_NEW_REQUEST_TOAST: 'New {category} request: {subject}',
        },
      },
    }),
  },
}))

jest.mock('react-toastify', () => ({
  toast: { info: jest.fn() },
}))

import { SupportWebSockets } from './support-web.sockets'

describe('SupportWebSockets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    SupportWebSockets.instance?.disconnect()
  })

  it('should be a class', () => {
    expect(SupportWebSockets).toBeDefined()
  })

  it('should have a static connect() method', () => {
    expect(typeof SupportWebSockets.connect).toBe('function')
  })

  it('should have a static instance getter', () => {
    expect('instance' in SupportWebSockets).toBe(true)
  })

  it('should have a static isInitializing getter', () => {
    expect('isInitializing' in SupportWebSockets).toBe(true)
  })

  describe('instance creation', () => {
    it('should create a new instance', () => {
      const instance = new SupportWebSockets()
      expect(instance).toBeDefined()
    })

    it('should set isInitializing to true synchronously in the constructor', () => {
      mockCreateSocket.mockReturnValueOnce(new Promise(() => undefined))
      new SupportWebSockets()
      expect(SupportWebSockets.isInitializing).toBe(true)
    })

    it('should clear isInitializing and set instance after setupSocket resolves', async () => {
      const instance = new SupportWebSockets()
      await instance.setupSocket()
      expect(SupportWebSockets.isInitializing).toBe(false)
      expect(SupportWebSockets.instance).toBe(instance)
    })

    it('should have a disconnect method', () => {
      const instance = new SupportWebSockets()
      expect(typeof instance.disconnect).toBe('function')
    })
  })

  describe('setupSocket', () => {
    it('should emit joinAdminRoom after setup', async () => {
      const instance = new SupportWebSockets()
      await instance.setupSocket()
      expect(mockSocketEmit).toHaveBeenCalledWith('joinAdminRoom')
    })

    it('should register newSupportRequest event handler', async () => {
      const instance = new SupportWebSockets()
      await instance.setupSocket()
      expect(mockSocketOn).toHaveBeenCalledWith('newSupportRequest', expect.any(Function))
    })

    it('should register supportRequestUpdated event handler', async () => {
      const instance = new SupportWebSockets()
      await instance.setupSocket()
      expect(mockSocketOn).toHaveBeenCalledWith('supportRequestUpdated', expect.any(Function))
    })
  })

  describe('disconnect', () => {
    it('should disconnect the socket and null the socket reference', async () => {
      const instance = new SupportWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(mockSocketDisconnect).toHaveBeenCalled()
      expect(instance.socket).toBeNull()
    })

    it('should null the static instance after disconnect', async () => {
      const instance = new SupportWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(SupportWebSockets.instance).toBeNull()
    })

    it('should reset isInitializing to false after disconnect', async () => {
      const instance = new SupportWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(SupportWebSockets.isInitializing).toBe(false)
    })

    it('should not throw when socket is already null', () => {
      const instance = new SupportWebSockets()
      expect(() => instance.disconnect()).not.toThrow()
    })
  })

  describe('static connect()', () => {
    it('should not create a new instance when isInitializing is true', () => {
      mockCreateSocket.mockReturnValueOnce(new Promise(() => undefined))
      new SupportWebSockets()
      expect(SupportWebSockets.isInitializing).toBe(true)

      // connect() should respect the guard and not create another instance
      SupportWebSockets.connect()
      // createSocket was only called once (from the first new SupportWebSockets())
      expect(mockCreateSocket).toHaveBeenCalledTimes(1)
    })
  })

  describe('duplicate connection guard', () => {
    it('should not create a second socket when isInitializing is true', () => {
      mockCreateSocket.mockReturnValueOnce(new Promise(() => undefined))
      new SupportWebSockets()
      expect(SupportWebSockets.isInitializing).toBe(true)

      const wouldCreateDuplicate =
        !SupportWebSockets.instance && !SupportWebSockets.isInitializing
      expect(wouldCreateDuplicate).toBe(false)
    })
  })
})
