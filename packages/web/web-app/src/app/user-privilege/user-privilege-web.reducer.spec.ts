import {
  privilegeSetActions,
  privilegeSetInitialState,
  privilegeSetReducer,
} from './user-privilege-web.reducer'

describe('privilegeSetReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = privilegeSetReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(privilegeSetInitialState)
  })

  it('should have correct initial state', () => {
    expect(privilegeSetInitialState).toEqual({ sets: [] })
  })

  describe('setPrivileges', () => {
    it('should set privilege sets', () => {
      const sets = [{ id: '1', name: 'ADMIN' }, { id: '2', name: 'USER' }] as never[]
      const state = privilegeSetReducer(
        privilegeSetInitialState,
        privilegeSetActions.setPrivileges(sets),
      )
      expect(state.sets).toHaveLength(2)
    })

    it('should replace existing sets', () => {
      const old = { ...privilegeSetInitialState, sets: [{ id: 'old' }] as never[] }
      const newSets = [{ id: 'new' }] as never[]
      const state = privilegeSetReducer(old, privilegeSetActions.setPrivileges(newSets))
      expect(state.sets).toHaveLength(1)
      expect(state.sets[0]).toEqual({ id: 'new' })
    })

    it('should set to empty array when given empty', () => {
      const withSets = { ...privilegeSetInitialState, sets: [{ id: '1' }] as never[] }
      const state = privilegeSetReducer(withSets, privilegeSetActions.setPrivileges([]))
      expect(state.sets).toHaveLength(0)
    })

    it('should handle non-array payload gracefully', () => {
      const state = privilegeSetReducer(
        privilegeSetInitialState,
        privilegeSetActions.setPrivileges(null as never),
      )
      expect(state.sets).toEqual([])
    })
  })
})
