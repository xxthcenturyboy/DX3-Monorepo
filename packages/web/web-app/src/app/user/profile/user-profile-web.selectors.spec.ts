jest.mock('../../config/config-web.service', () => ({
  WebConfigService: {
    getWebUrls: jest.fn().mockReturnValue({ API_URL: 'http://api.example.com' }),
  },
}))

import type { UserProfileStateType } from '@dx3/models-shared'

import { userProfileInitialState } from './user-profile-web.reducer'
import {
  selectHasAdminRole,
  selectHasSuperAdminRole,
  selectIsUserProfileValid,
  selectProfileFormatted,
  selectUserEmails,
  selectUserPhones,
} from './user-profile-web.selectors'

type MockRootState = {
  userProfile: UserProfileStateType
}

const createMockState = (overrides: Partial<UserProfileStateType> = {}): MockRootState => ({
  userProfile: { ...userProfileInitialState, ...overrides },
})

describe('user-profile selectors', () => {
  describe('selectIsUserProfileValid', () => {
    it('should return false when id is empty', () => {
      const state = createMockState({ id: '' })
      expect(selectIsUserProfileValid(state as never)).toBe(false)
    })

    it('should return true when id is set', () => {
      const state = createMockState({ id: 'user-123' })
      expect(selectIsUserProfileValid(state as never)).toBe(true)
    })
  })

  describe('selectHasAdminRole', () => {
    it('should return false when not admin', () => {
      const state = createMockState({ a: false })
      expect(selectHasAdminRole(state as never)).toBe(false)
    })

    it('should return true when admin', () => {
      const state = createMockState({ a: true })
      expect(selectHasAdminRole(state as never)).toBe(true)
    })
  })

  describe('selectHasSuperAdminRole', () => {
    it('should return false when not super admin', () => {
      const state = createMockState({ sa: false })
      expect(selectHasSuperAdminRole(state as never)).toBe(false)
    })

    it('should return true when super admin', () => {
      const state = createMockState({ sa: true })
      expect(selectHasSuperAdminRole(state as never)).toBe(true)
    })
  })

  describe('selectUserEmails', () => {
    it('should return empty array initially', () => {
      const state = createMockState()
      expect(selectUserEmails(state as never)).toEqual([])
    })

    it('should return emails array', () => {
      const emails = [{ email: 'a@b.com', id: 'e1' }] as never[]
      const state = createMockState({ emails })
      expect(selectUserEmails(state as never)).toHaveLength(1)
    })
  })

  describe('selectUserPhones', () => {
    it('should return empty array initially', () => {
      const state = createMockState()
      expect(selectUserPhones(state as never)).toEqual([])
    })

    it('should return phones array', () => {
      const phones = [{ id: 'p1', phone: '+1234567890' }] as never[]
      const state = createMockState({ phones })
      expect(selectUserPhones(state as never)).toHaveLength(1)
    })
  })

  describe('selectProfileFormatted', () => {
    it('should return a formatted profile object', () => {
      const state = createMockState({ id: 'u1' })
      const result = selectProfileFormatted(state as never)
      expect(result).toBeDefined()
    })

    it('should include formatted phones', () => {
      const phones = [{ id: 'p1', phone: '+14155552671' }] as never[]
      const state = createMockState({ phones })
      const result = selectProfileFormatted(state as never)
      expect(result.phones).toHaveLength(1)
    })

    it('should build profileImageUrl when profileImage is set', () => {
      const state = createMockState({ profileImage: 'media-abc' as never })
      const result = selectProfileFormatted(state as never)
      expect(result.profileImageUrl).toBeDefined()
    })

    it('should have null or undefined profileImageUrl when profileImage is null', () => {
      const state = createMockState({ profileImage: null })
      const result = selectProfileFormatted(state as never)
      expect(result.profileImageUrl).toBeFalsy()
    })
  })
})
