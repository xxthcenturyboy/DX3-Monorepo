import { statsActions, statsInitialState, statsReducer } from './stats-web.reducer'

describe('statsReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = statsReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(statsInitialState)
  })

  it('should have correct initial state', () => {
    expect(statsInitialState).toEqual({ api: undefined })
  })

  describe('setApiStats', () => {
    it('should set api stats', () => {
      const stats = { status: 'ok', uptime: 3600 } as never
      const state = statsReducer(statsInitialState, statsActions.setApiStats(stats))
      expect(state.api).toEqual(stats)
    })

    it('should clear api stats to undefined', () => {
      const withStats = { ...statsInitialState, api: { uptime: 100 } as never }
      const state = statsReducer(withStats, statsActions.setApiStats(undefined))
      expect(state.api).toBeUndefined()
    })
  })
})
