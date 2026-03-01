import { DEFAULT_TIMEZONE } from '@dx3/models-shared'

import { ApiLoggingClass } from '../logger'
import { getUserProfileState } from './user-profile-api'

jest.unmock('./user-profile-api')
jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('../media/media-api.postgres-model', () => ({
  MediaModel: {
    findPrimaryProfile: jest.fn().mockResolvedValue(null),
  },
}))

function createMockUser(overrides?: Partial<{
  emails: Array<{ default: boolean; verifiedAt: Date | null }>
  fetchConnectedDevice: () => Promise<{ hasBiometricSetup: boolean; id: string } | null>
  getEmailData: () => Promise<unknown[]>
  getPhoneData: () => Promise<unknown[]>
  hasSecuredAccount: () => Promise<boolean>
  phones: Array<{ default: boolean; verifiedAt: Date | null }>
}>) {
  return {
    fetchConnectedDevice: jest.fn().mockResolvedValue(null),
    firstName: 'Test',
    fullName: 'Test User',
    getEmailData: jest.fn().mockResolvedValue([]),
    getPhoneData: jest.fn().mockResolvedValue([]),
    hasSecuredAccount: jest.fn().mockResolvedValue(false),
    id: 'user-123',
    isAdmin: false,
    isSuperAdmin: false,
    lastName: 'User',
    optInBeta: false,
    restrictions: [],
    roles: ['USER'],
    timezone: DEFAULT_TIMEZONE,
    username: 'testuser',
    emails: [{ default: true, verifiedAt: new Date() }],
    phones: [{ default: true, verifiedAt: new Date() }],
    ...overrides,
  }
}

describe('getUserProfileState', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should exist when imported', () => {
    expect(getUserProfileState).toBeDefined()
    expect(typeof getUserProfileState).toBe('function')
  })

  it('should return profile state for user', async () => {
    const mockUser = createMockUser({
      getEmailData: jest.fn().mockResolvedValue([{ email: 'test@example.com', default: true }]),
      getPhoneData: jest.fn().mockResolvedValue([]),
      hasSecuredAccount: jest.fn().mockResolvedValue(true),
    })

    const result = await getUserProfileState(mockUser as never, true)

    expect(result).toBeDefined()
    expect(result.id).toBe('user-123')
    expect(result.username).toBe('testuser')
    expect(result.firstName).toBe('Test')
    expect(result.lastName).toBe('User')
    expect(result.fullName).toBe('Test User')
    expect(result.hasSecuredAccount).toBe(true)
    expect(result.a).toBe(false)
    expect(result.sa).toBe(false)
    expect(result.timezone).toBe(DEFAULT_TIMEZONE)
    expect(result.profileImage).toBeNull()
    expect(result.device).toEqual({ hasBiometricSetup: false, id: '' })
  })

  it('should call user methods', async () => {
    const mockUser = createMockUser()

    await getUserProfileState(mockUser as never, false)

    expect(mockUser.fetchConnectedDevice).toHaveBeenCalled()
    expect(mockUser.getEmailData).toHaveBeenCalled()
    expect(mockUser.getPhoneData).toHaveBeenCalled()
    expect(mockUser.hasSecuredAccount).toHaveBeenCalled()
  })

  it('should set hasVerifiedEmail from default email verifiedAt', async () => {
    const mockUser = createMockUser({
      emails: [{ default: true, verifiedAt: new Date() }],
    })

    const result = await getUserProfileState(mockUser as never, true)

    expect(result.hasVerifiedEmail).toBe(true)
  })

  it('should set hasVerifiedPhone from default phone verifiedAt', async () => {
    const mockUser = createMockUser({
      phones: [{ default: true, verifiedAt: new Date() }],
    })

    const result = await getUserProfileState(mockUser as never, true)

    expect(result.hasVerifiedPhone).toBe(true)
  })

  it('should throw on error', async () => {
    const mockUser = createMockUser({
      getEmailData: jest.fn().mockRejectedValue(new Error('DB error')),
    })

    await expect(getUserProfileState(mockUser as never, true)).rejects.toThrow(
      /Error resolving user profile/,
    )
  })
})
