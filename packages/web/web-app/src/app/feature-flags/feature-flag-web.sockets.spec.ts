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
  })

  it('should be a class', () => {
    expect(FeatureFlagWebSockets).toBeDefined()
  })

  it('should have a static instance getter', () => {
    expect('instance' in FeatureFlagWebSockets).toBe(true)
  })

  describe('instance creation', () => {
    it('should create a new instance', () => {
      const instance = new FeatureFlagWebSockets()
      expect(instance).toBeDefined()
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
  })

  describe('disconnect', () => {
    it('should emit unsubscribeFromFeatureFlags and disconnect socket', async () => {
      const instance = new FeatureFlagWebSockets()
      await instance.setupSocket()
      instance.disconnect()
      expect(mockSocketEmit).toHaveBeenCalledWith('unsubscribeFromFeatureFlags')
      expect(mockSocketDisconnect).toHaveBeenCalled()
    })
  })
})
