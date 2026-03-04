import { userAdminActions, userAdminInitialState, userAdminReducer } from './user-admin-web.reducer'

describe('userAdminReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = userAdminReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(userAdminInitialState)
  })

  it('should have correct initial state shape', () => {
    expect(userAdminInitialState.filterValue).toBeUndefined()
    expect(userAdminInitialState.lastRoute).toBe('')
    expect(userAdminInitialState.users).toEqual([])
    expect(userAdminInitialState.user).toBeUndefined()
  })

  describe('filterValueSet', () => {
    it('should set filterValue', () => {
      const state = userAdminReducer(userAdminInitialState, userAdminActions.filterValueSet('john'))
      expect(state.filterValue).toBe('john')
    })

    it('should clear filterValue to undefined', () => {
      const state = userAdminReducer(
        userAdminInitialState,
        userAdminActions.filterValueSet(undefined),
      )
      expect(state.filterValue).toBeUndefined()
    })
  })

  describe('lastRouteSet', () => {
    it('should set lastRoute', () => {
      const state = userAdminReducer(
        userAdminInitialState,
        userAdminActions.lastRouteSet('/admin/user'),
      )
      expect(state.lastRoute).toBe('/admin/user')
    })
  })

  describe('limitSet', () => {
    it('should set limit', () => {
      const state = userAdminReducer(userAdminInitialState, userAdminActions.limitSet(100))
      expect(state.limit).toBe(100)
    })
  })

  describe('listSet', () => {
    it('should set users list', () => {
      const users = [{ id: 'u1' }, { id: 'u2' }] as never[]
      const state = userAdminReducer(userAdminInitialState, userAdminActions.listSet(users))
      expect(state.users).toHaveLength(2)
    })
  })

  describe('offsetSet', () => {
    it('should set offset', () => {
      const state = userAdminReducer(userAdminInitialState, userAdminActions.offsetSet(50))
      expect(state.offset).toBe(50)
    })
  })

  describe('orderBySet', () => {
    it('should set orderBy', () => {
      const state = userAdminReducer(
        userAdminInitialState,
        userAdminActions.orderBySet('fullName'),
      )
      expect(state.orderBy).toBe('fullName')
    })
  })

  describe('sortDirSet', () => {
    it('should set sortDir to DESC', () => {
      const state = userAdminReducer(userAdminInitialState, userAdminActions.sortDirSet('DESC'))
      expect(state.sortDir).toBe('DESC')
    })
  })

  describe('userCountSet', () => {
    it('should set usersCount', () => {
      const state = userAdminReducer(userAdminInitialState, userAdminActions.userCountSet(42))
      expect(state.usersCount).toBe(42)
    })
  })

  describe('userSet', () => {
    it('should set user', () => {
      const user = { id: 'u1', username: 'johndoe' } as never
      const state = userAdminReducer(userAdminInitialState, userAdminActions.userSet(user))
      expect(state.user).toEqual(user)
    })

    it('should clear user to undefined', () => {
      const state = userAdminReducer(userAdminInitialState, userAdminActions.userSet(undefined))
      expect(state.user).toBeUndefined()
    })
  })
})
