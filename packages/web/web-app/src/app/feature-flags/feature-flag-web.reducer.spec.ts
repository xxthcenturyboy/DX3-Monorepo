import {
  featureFlagsActions,
  featureFlagsInitialState,
  featureFlagsReducer,
} from './feature-flag-web.reducer'

describe('featureFlagsReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = featureFlagsReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(featureFlagsInitialState)
  })

  it('should have correct initial state', () => {
    expect(featureFlagsInitialState).toEqual({
      flags: {},
      isLoading: false,
      lastFetched: null,
    })
  })

  describe('featureFlagsLoading', () => {
    it('should set isLoading to true', () => {
      const state = featureFlagsReducer(
        featureFlagsInitialState,
        featureFlagsActions.featureFlagsLoading(),
      )
      expect(state.isLoading).toBe(true)
    })
  })

  describe('featureFlagsFetched', () => {
    it('should build a flags record from the array', () => {
      const mockFlags = [
        { enabled: true, name: 'feature_a' },
        { enabled: false, name: 'feature_b' },
      ] as never[]

      const state = featureFlagsReducer(
        featureFlagsInitialState,
        featureFlagsActions.featureFlagsFetched(mockFlags),
      )

      expect(state.flags).toEqual({
        feature_a: true,
        feature_b: false,
      })
    })

    it('should set isLoading to false after fetch', () => {
      const loading = { ...featureFlagsInitialState, isLoading: true }
      const state = featureFlagsReducer(loading, featureFlagsActions.featureFlagsFetched([]))
      expect(state.isLoading).toBe(false)
    })

    it('should set lastFetched to a number', () => {
      const before = Date.now()
      const state = featureFlagsReducer(
        featureFlagsInitialState,
        featureFlagsActions.featureFlagsFetched([]),
      )
      expect(state.lastFetched).toBeGreaterThanOrEqual(before)
    })

    it('should handle empty flags array', () => {
      const state = featureFlagsReducer(
        featureFlagsInitialState,
        featureFlagsActions.featureFlagsFetched([]),
      )
      expect(state.flags).toEqual({})
    })
  })

  describe('featureFlagsInvalidated', () => {
    it('should clear flags', () => {
      const withFlags = { ...featureFlagsInitialState, flags: { feature_a: true } }
      const state = featureFlagsReducer(withFlags, featureFlagsActions.featureFlagsInvalidated())
      expect(state.flags).toEqual({})
    })

    it('should set lastFetched to null', () => {
      const withFetch = { ...featureFlagsInitialState, lastFetched: Date.now() }
      const state = featureFlagsReducer(withFetch, featureFlagsActions.featureFlagsInvalidated())
      expect(state.lastFetched).toBeNull()
    })

    it('should set isLoading to false', () => {
      const loading = { ...featureFlagsInitialState, isLoading: true }
      const state = featureFlagsReducer(loading, featureFlagsActions.featureFlagsInvalidated())
      expect(state.isLoading).toBe(false)
    })
  })
})
