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

  describe('instance creation', () => {
    it('should create a new instance', () => {
      const instance = new SupportWebSockets()
      expect(instance).toBeDefined()
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
  })

  describe('disconnect', () => {
    it('should disconnect the socket and null the instance', async () => {
      const instance = new SupportWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(mockSocketDisconnect).toHaveBeenCalled()
      expect(instance.socket).toBeNull()
    })
  })
})
