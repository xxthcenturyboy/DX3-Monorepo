import { supportActions, supportInitialState, supportReducer } from './support-web.reducer'

describe('supportReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = supportReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(supportInitialState)
  })

  it('should have correct initial state', () => {
    expect(supportInitialState).toEqual({
      lastToast: null,
      newRequestIds: [],
      unviewedCount: 0,
    })
  })

  describe('addNewRequest', () => {
    it('should add request id to newRequestIds', () => {
      const request = { id: 'req-1' } as never
      const state = supportReducer(supportInitialState, supportActions.addNewRequest(request))
      expect(state.newRequestIds).toContain('req-1')
    })

    it('should increment unviewedCount', () => {
      const request = { id: 'req-1' } as never
      const state = supportReducer(supportInitialState, supportActions.addNewRequest(request))
      expect(state.unviewedCount).toBe(1)
    })

    it('should set lastToast to the new request', () => {
      const request = { id: 'req-1', message: 'New request' } as never
      const state = supportReducer(supportInitialState, supportActions.addNewRequest(request))
      expect(state.lastToast).toEqual(request)
    })
  })

  describe('clearLastToast', () => {
    it('should set lastToast to null', () => {
      const withToast = { ...supportInitialState, lastToast: { id: 'req-1' } as never }
      const state = supportReducer(withToast, supportActions.clearLastToast())
      expect(state.lastToast).toBeNull()
    })
  })

  describe('markRequestViewed', () => {
    it('should remove id from newRequestIds', () => {
      const withRequests = {
        ...supportInitialState,
        newRequestIds: ['req-1', 'req-2'],
        unviewedCount: 2,
      }
      const state = supportReducer(withRequests, supportActions.markRequestViewed('req-1'))
      expect(state.newRequestIds).not.toContain('req-1')
      expect(state.newRequestIds).toContain('req-2')
    })

    it('should decrement unviewedCount', () => {
      const withCount = { ...supportInitialState, newRequestIds: ['req-1'], unviewedCount: 1 }
      const state = supportReducer(withCount, supportActions.markRequestViewed('req-1'))
      expect(state.unviewedCount).toBe(0)
    })

    it('should not go below 0 for unviewedCount', () => {
      const withZero = { ...supportInitialState, unviewedCount: 0 }
      const state = supportReducer(withZero, supportActions.markRequestViewed('nonexistent'))
      expect(state.unviewedCount).toBe(0)
    })
  })

  describe('resetSupportState', () => {
    it('should reset to initial state', () => {
      const modified = {
        lastToast: { id: 'req-1' } as never,
        newRequestIds: ['req-1'],
        unviewedCount: 5,
      }
      const state = supportReducer(modified, supportActions.resetSupportState())
      expect(state).toEqual(supportInitialState)
    })
  })

  describe('setUnviewedCount', () => {
    it('should set unviewedCount to given value', () => {
      const state = supportReducer(supportInitialState, supportActions.setUnviewedCount(42))
      expect(state.unviewedCount).toBe(42)
    })

    it('should set unviewedCount to 0', () => {
      const withCount = { ...supportInitialState, unviewedCount: 10 }
      const state = supportReducer(withCount, supportActions.setUnviewedCount(0))
      expect(state.unviewedCount).toBe(0)
    })
  })
})
