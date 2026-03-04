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

jest.mock('../../notifications/notification-web.sockets', () => ({
  NotificationWebSockets: { instance: null },
}))

jest.mock('../../feature-flags/feature-flag-web.sockets', () => ({
  FeatureFlagWebSockets: { instance: null },
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
    const adminProfile = { ...(baseUserProfile as object), a: true, role: [USER_ROLE.ADMIN] } as never
    expect(() => loginBootstrap(adminProfile, false)).not.toThrow()
  })
})
