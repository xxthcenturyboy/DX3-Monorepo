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

function createMockUser(
  overrides?: Partial<{
    emails: Array<{ default: boolean; verifiedAt: Date | null }>
    fetchConnectedDevice: () => Promise<{ hasBiometricSetup: boolean; id: string } | null>
    getEmailData: () => Promise<unknown[]>
    getPhoneData: () => Promise<unknown[]>
    hasSecuredAccount: () => Promise<boolean>
    phones: Array<{ default: boolean; verifiedAt: Date | null }>
  }>,
) {
  return {
    emails: [{ default: true, verifiedAt: new Date() }],
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
    phones: [{ default: true, verifiedAt: new Date() }],
    restrictions: [],
    roles: ['USER'],
    timezone: DEFAULT_TIMEZONE,
    username: 'testuser',
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
      getEmailData: jest.fn().mockResolvedValue([{ default: true, email: 'test@example.com' }]),
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

  it('should set hasVerifiedEmail to false when no default email exists', async () => {
    const mockUser = createMockUser({
      emails: [{ default: false, verifiedAt: new Date() }],
    })

    const result = await getUserProfileState(mockUser as never, true)

    expect(result.hasVerifiedEmail).toBe(false)
  })

  it('should set hasVerifiedPhone to false when no default phone exists', async () => {
    const mockUser = createMockUser({
      phones: [{ default: false, verifiedAt: new Date() }],
    })

    const result = await getUserProfileState(mockUser as never, true)

    expect(result.hasVerifiedPhone).toBe(false)
  })

  it('should populate device info when connectedDevice is present', async () => {
    const mockUser = createMockUser({
      fetchConnectedDevice: jest.fn().mockResolvedValue({ hasBiometricSetup: true, id: 'dev-1' }),
    })

    const result = await getUserProfileState(mockUser as never, true)

    expect(result.device).toEqual({ hasBiometricSetup: true, id: 'dev-1' })
  })

  it('should populate profileImage when media record is found', async () => {
    const { MediaModel } = require('../media/media-api.postgres-model')
    ;(MediaModel.findPrimaryProfile as jest.Mock).mockResolvedValueOnce({ id: 'img-1' })

    const mockUser = createMockUser()
    const result = await getUserProfileState(mockUser as never, true)

    expect(result.profileImage).toBe('img-1')
  })

  it('should use DEFAULT_TIMEZONE when user timezone is falsy', async () => {
    const mockUser = createMockUser({ timezone: null } as never)

    const result = await getUserProfileState(mockUser as never, true)

    expect(result.timezone).toBe(DEFAULT_TIMEZONE)
  })

  it('should use empty array when user restrictions is null', async () => {
    const mockUser = createMockUser({ restrictions: null } as never)

    const result = await getUserProfileState(mockUser as never, true)

    expect(result.restrictions).toEqual([])
  })
})
