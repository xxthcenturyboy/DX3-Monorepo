const mockDispatch = jest.fn().mockReturnValue(Promise.resolve({ data: undefined }))
const mockGetState = jest.fn().mockReturnValue({
  i18n: { translations: {} },
})

jest.mock('../../store/store-web.redux', () => ({
  store: {
    dispatch: mockDispatch,
    getState: mockGetState,
  },
}))

jest.mock('../../feature-flags/feature-flag-web.api', () => ({
  fetchFeatureFlags: { initiate: jest.fn().mockReturnValue({ type: 'featureFlags/initiate' }) },
}))

jest.mock('../../notifications/notification-web.api', () => ({
  fetchNotifications: { initiate: jest.fn().mockReturnValue({ type: 'notifications/initiate' }) },
}))

jest.mock('../../support/support-web.api', () => ({
  fetchSupportUnviewedCount: {
    initiate: jest.fn().mockReturnValue({ type: 'support/initiate' }),
  },
}))

jest.mock('../../ui/menus/menu-config.service', () => ({
  MenuConfigService: jest.fn().mockImplementation(() => ({
    getMenus: jest.fn().mockReturnValue([]),
  })),
}))

// Mock all four socket modules so dynamic imports in connectToSockets never reach
// the real SocketWebConnection.createSocket (which requires a live Redux store and network).
const mockNotificationConstructor = jest.fn()
const mockNotificationSocketConnect = jest.fn()
let mockNotificationInstance: { socket: { connected: boolean; connect: jest.Mock } } | null = null
let mockNotificationIsInitializing = false

jest.mock('../../notifications/notification-web.sockets', () => ({
  NotificationWebSockets: new Proxy(mockNotificationConstructor, {
    get(target, prop) {
      if (prop === 'instance') return mockNotificationInstance
      if (prop === 'isInitializing') return mockNotificationIsInitializing
      return Reflect.get(target, prop)
    },
    construct(target, args) {
      const result = Reflect.construct(target, args)
      mockNotificationInstance = { socket: { connect: mockNotificationSocketConnect, connected: true } }
      return result
    },
  }),
}))

const mockFeatureFlagConstructor = jest.fn()
let mockFeatureFlagInstance: { socket: { connected: boolean; connect: jest.Mock } } | null = null
let mockFeatureFlagIsInitializing = false

jest.mock('../../feature-flags/feature-flag-web.sockets', () => ({
  FeatureFlagWebSockets: new Proxy(mockFeatureFlagConstructor, {
    get(target, prop) {
      if (prop === 'instance') return mockFeatureFlagInstance
      if (prop === 'isInitializing') return mockFeatureFlagIsInitializing
      return Reflect.get(target, prop)
    },
    construct(target, args) {
      const result = Reflect.construct(target, args)
      mockFeatureFlagInstance = { socket: { connect: jest.fn(), connected: true } }
      return result
    },
  }),
}))

const mockSupportConnectFn = jest.fn()
let mockSupportInstance: { socket: { connected: boolean; connect: jest.Mock } } | null = null
let mockSupportIsInitializing = false

jest.mock('../../support/support-web.sockets', () => ({
  SupportWebSockets: {
    connect: mockSupportConnectFn,
    get instance() { return mockSupportInstance },
    get isInitializing() { return mockSupportIsInitializing },
  },
}))

const mockAdminLogsConnectFn = jest.fn()
let mockAdminLogsInstance: { socket: { connected: boolean; connect: jest.Mock } } | null = null
let mockAdminLogsIsInitializing = false

jest.mock('../../admin-logs/admin-logs-web.sockets', () => ({
  AdminLogsWebSockets: {
    connect: mockAdminLogsConnectFn,
    get instance() { return mockAdminLogsInstance },
    get isInitializing() { return mockAdminLogsIsInitializing },
  },
}))

import { USER_ROLE } from '@dx3/models-shared'

import { loginBootstrap } from './login-bootstrap'

const baseUserProfile = {
  a: false,
  b: false,
  device: { hasBiometricSetup: false, id: '' },
  emails: [],
  firstName: 'John',
  fullName: 'John Doe',
  hasSecuredAccount: false,
  hasVerifiedEmail: true,
  hasVerifiedPhone: false,
  id: 'u1',
  lastName: 'Doe',
  phones: [],
  profileImage: null,
  restrictions: [],
  role: [USER_ROLE.USER],
  sa: false,
  timezone: 'UTC',
  username: 'johndoe',
} as never

describe('loginBootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue(Promise.resolve({ data: undefined }))
    mockNotificationInstance = null
    mockNotificationIsInitializing = false
    mockFeatureFlagInstance = null
    mockFeatureFlagIsInitializing = false
    mockSupportInstance = null
    mockSupportIsInitializing = false
    mockAdminLogsInstance = null
    mockAdminLogsIsInitializing = false
  })

  it('should be a function', () => {
    expect(typeof loginBootstrap).toBe('function')
  })

  it('should dispatch menusSet action', () => {
    loginBootstrap(baseUserProfile, false)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: expect.stringContaining('menus') }),
    )
  })

  it('should dispatch toggleMenuSet when not mobile', () => {
    loginBootstrap(baseUserProfile, false)
    const toggleCall = mockDispatch.mock.calls.find(
      ([action]) => typeof action === 'object' && action?.type?.includes('menu'),
    )
    expect(toggleCall).toBeDefined()
  })

  it('should not throw for regular USER role', () => {
    expect(() => loginBootstrap(baseUserProfile, false)).not.toThrow()
  })

  it('should not throw for mobile layout', () => {
    expect(() => loginBootstrap(baseUserProfile, true)).not.toThrow()
  })

  it('should handle admin user profile without throwing', () => {
    const adminProfile = {
      ...(baseUserProfile as object),
      a: true,
      role: [USER_ROLE.ADMIN],
    } as never
    expect(() => loginBootstrap(adminProfile, false)).not.toThrow()
  })

  describe('connectToSockets — duplicate connection guard', () => {
    it('should create NotificationWebSockets when instance is null and not initializing', async () => {
      mockNotificationInstance = null
      mockNotificationIsInitializing = false

      loginBootstrap(baseUserProfile, false)
      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(mockNotificationConstructor).toHaveBeenCalledTimes(1)
    })

    it('should NOT create NotificationWebSockets when isInitializing is true', async () => {
      mockNotificationInstance = null
      mockNotificationIsInitializing = true

      loginBootstrap(baseUserProfile, false)
      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(mockNotificationConstructor).not.toHaveBeenCalled()
    })

    it('should NOT create NotificationWebSockets when instance already exists', async () => {
      mockNotificationInstance = { socket: { connect: jest.fn(), connected: true } }
      mockNotificationIsInitializing = false

      loginBootstrap(baseUserProfile, false)
      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(mockNotificationConstructor).not.toHaveBeenCalled()
    })

    it('should reconnect NotificationWebSockets when instance exists but socket is disconnected', async () => {
      const mockConnect = jest.fn()
      mockNotificationInstance = { socket: { connect: mockConnect, connected: false } }
      mockNotificationIsInitializing = false

      loginBootstrap(baseUserProfile, false)
      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(mockNotificationConstructor).not.toHaveBeenCalled()
      expect(mockConnect).toHaveBeenCalled()
    })

    it('should create FeatureFlagWebSockets when instance is null and not initializing', async () => {
      mockFeatureFlagInstance = null
      mockFeatureFlagIsInitializing = false

      loginBootstrap(baseUserProfile, false)
      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(mockFeatureFlagConstructor).toHaveBeenCalledTimes(1)
    })

    it('should NOT create FeatureFlagWebSockets when isInitializing is true', async () => {
      mockFeatureFlagInstance = null
      mockFeatureFlagIsInitializing = true

      loginBootstrap(baseUserProfile, false)
      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(mockFeatureFlagConstructor).not.toHaveBeenCalled()
    })

    it('should call SupportWebSockets.connect() for admin users when no instance exists', async () => {
      const adminProfile = {
        ...(baseUserProfile as object),
        a: true,
        role: [USER_ROLE.ADMIN],
      } as never
      mockSupportInstance = null
      mockSupportIsInitializing = false

      loginBootstrap(adminProfile, false)
      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(mockSupportConnectFn).toHaveBeenCalled()
    })

    it('should NOT call SupportWebSockets.connect() when isInitializing is true', async () => {
      const adminProfile = {
        ...(baseUserProfile as object),
        a: true,
        role: [USER_ROLE.ADMIN],
      } as never
      mockSupportInstance = null
      mockSupportIsInitializing = true

      loginBootstrap(adminProfile, false)
      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(mockSupportConnectFn).not.toHaveBeenCalled()
    })
  })
})
