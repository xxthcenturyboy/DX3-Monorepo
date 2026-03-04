jest.mock('./user-admin-web-list.service', () => ({
  UserAdminWebListService: jest.fn().mockImplementation(() => ({
    getRows: jest.fn().mockReturnValue([]),
  })),
}))

jest.mock('../../store', () => ({
  store: { getState: jest.fn().mockReturnValue({ i18n: { translations: {} } }) },
}))

import { userAdminInitialState } from './user-admin-web.reducer'
import {
  selectUserFormatted,
  selectUsersFormatted,
  selectUsersListData,
} from './user-admin-web.selectors'
import type { UserAdminStateType } from './user-admin-web.types'

type MockRootState = {
  userAdmin: UserAdminStateType
}

const createMockState = (overrides: Partial<UserAdminStateType> = {}): MockRootState => ({
  userAdmin: { ...userAdminInitialState, ...overrides },
})

const mockUser = {
  createdAt: '2024-01-15T10:00:00Z',
  emails: [],
  id: 'u1',
  phones: [],
  username: 'johndoe',
} as never

describe('user-admin selectors', () => {
  describe('selectUserFormatted', () => {
    it('should return undefined when no user set', () => {
      const state = createMockState({ user: undefined })
      const result = selectUserFormatted(state as never)
      expect(result).toBeUndefined()
    })

    it('should return formatted user with formatted createdAt date', () => {
      const state = createMockState({ user: mockUser })
      const result = selectUserFormatted(state as never)
      expect(result).toBeDefined()
      expect(result?.createdAt).toBeDefined()
    })

    it('should return formatted user with phone uiFormatted', () => {
      const userWithPhone = {
        ...(mockUser as object),
        phones: [{ id: 'p1', phone: '+14155552671' }],
      }
      const state = createMockState({ user: userWithPhone as never })
      const result = selectUserFormatted(state as never)
      expect(result?.phones).toBeDefined()
    })
  })

  describe('selectUsersFormatted', () => {
    it('should return empty array when no users', () => {
      const state = createMockState({ users: [] })
      const result = selectUsersFormatted(state as never)
      expect(result).toEqual([])
    })

    it('should return formatted users', () => {
      const state = createMockState({ users: [mockUser] })
      const result = selectUsersFormatted(state as never)
      expect(result).toHaveLength(1)
    })
  })

  describe('selectUsersListData', () => {
    it('should return array of table row data', () => {
      const state = createMockState()
      const result = selectUsersListData(state as never)
      expect(Array.isArray(result)).toBe(true)
    })
  })
})
