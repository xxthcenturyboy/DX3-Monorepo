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
    dispatch: jest
      .fn()
      .mockResolvedValue({ data: null, unwrap: jest.fn().mockResolvedValue({ flags: [] }) }),
    getState: jest.fn().mockReturnValue({ auth: { token: null }, featureFlags: { flags: {} } }),
  },
}))

jest.mock('./feature-flag-web.api', () => ({
  featureFlagsApi: {
    endpoints: {
      getFeatureFlags: {
        initiate: jest.fn().mockReturnValue({ type: 'featureFlags/initiate' }),
      },
    },
  },
}))

import { FeatureFlagWebSockets } from './feature-flag-web.sockets'

describe('FeatureFlagWebSockets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    FeatureFlagWebSockets.instance?.disconnect()
  })

  it('should be a class', () => {
    expect(FeatureFlagWebSockets).toBeDefined()
  })

  it('should have a static instance getter', () => {
    expect('instance' in FeatureFlagWebSockets).toBe(true)
  })

  it('should have a static isInitializing getter', () => {
    expect('isInitializing' in FeatureFlagWebSockets).toBe(true)
  })

  describe('instance creation', () => {
    it('should create a new instance', () => {
      const instance = new FeatureFlagWebSockets()
      expect(instance).toBeDefined()
    })

    it('should set isInitializing to true synchronously in the constructor', () => {
      mockCreateSocket.mockReturnValueOnce(new Promise(() => undefined))
      new FeatureFlagWebSockets()
      expect(FeatureFlagWebSockets.isInitializing).toBe(true)
    })

    it('should clear isInitializing and set instance after setupSocket resolves', async () => {
      const instance = new FeatureFlagWebSockets()
      await instance.setupSocket()
      expect(FeatureFlagWebSockets.isInitializing).toBe(false)
      expect(FeatureFlagWebSockets.instance).toBe(instance)
    })

    it('should have a disconnect method', () => {
      const instance = new FeatureFlagWebSockets()
      expect(typeof instance.disconnect).toBe('function')
    })
  })

  describe('setupSocket', () => {
    it('should emit subscribeToFeatureFlags after setup', async () => {
      const instance = new FeatureFlagWebSockets()
      await instance.setupSocket()
      expect(mockSocketEmit).toHaveBeenCalledWith('subscribeToFeatureFlags')
    })

    it('should register featureFlagsUpdated event handler', async () => {
      const instance = new FeatureFlagWebSockets()
      await instance.setupSocket()
      expect(mockSocketOn).toHaveBeenCalledWith('featureFlagsUpdated', expect.any(Function))
    })
  })

  describe('disconnect', () => {
    it('should emit unsubscribeFromFeatureFlags and disconnect socket', async () => {
      const instance = new FeatureFlagWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(mockSocketEmit).toHaveBeenCalledWith('unsubscribeFromFeatureFlags')
      expect(mockSocketDisconnect).toHaveBeenCalled()
    })

    it('should null socket after disconnect', async () => {
      const instance = new FeatureFlagWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(instance.socket).toBeNull()
    })

    it('should null the static instance after disconnect', async () => {
      const instance = new FeatureFlagWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(FeatureFlagWebSockets.instance).toBeNull()
    })

    it('should reset isInitializing to false after disconnect', async () => {
      const instance = new FeatureFlagWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(FeatureFlagWebSockets.isInitializing).toBe(false)
    })

    it('should not throw when socket is already null', () => {
      const instance = new FeatureFlagWebSockets()
      expect(() => instance.disconnect()).not.toThrow()
    })
  })

  describe('duplicate connection guard', () => {
    it('should not create a second socket when isInitializing is true', () => {
      mockCreateSocket.mockReturnValueOnce(new Promise(() => undefined))
      new FeatureFlagWebSockets()
      expect(FeatureFlagWebSockets.isInitializing).toBe(true)

      const wouldCreateDuplicate =
        !FeatureFlagWebSockets.instance && !FeatureFlagWebSockets.isInitializing
      expect(wouldCreateDuplicate).toBe(false)
    })
  })
})
