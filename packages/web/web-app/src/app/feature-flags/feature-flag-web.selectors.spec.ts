import { featureFlagsInitialState } from './feature-flag-web.reducer'
import {
  selectFeatureFlag,
  selectFeatureFlags,
  selectFeatureFlagsLastFetched,
  selectFeatureFlagsLoading,
  selectFeatureFlagsStale,
} from './feature-flag-web.selectors'
import type { FeatureFlagsStateType } from './feature-flag-web.types'

type MockRootState = {
  featureFlags: FeatureFlagsStateType
}

const createMockState = (overrides: Partial<FeatureFlagsStateType> = {}): MockRootState => ({
  featureFlags: { ...featureFlagsInitialState, ...overrides },
})

describe('feature-flag selectors', () => {
  describe('selectFeatureFlags', () => {
    it('should return empty object initially', () => {
      const state = createMockState()
      expect(selectFeatureFlags(state as never)).toEqual({})
    })

    it('should return flags record', () => {
      const state = createMockState({ flags: { my_feature: true } })
      expect(selectFeatureFlags(state as never)).toEqual({ my_feature: true })
    })
  })

  describe('selectFeatureFlagsLoading', () => {
    it('should return false initially', () => {
      const state = createMockState()
      expect(selectFeatureFlagsLoading(state as never)).toBe(false)
    })

    it('should return true when loading', () => {
      const state = createMockState({ isLoading: true })
      expect(selectFeatureFlagsLoading(state as never)).toBe(true)
    })
  })

  describe('selectFeatureFlagsLastFetched', () => {
    it('should return null initially', () => {
      const state = createMockState()
      expect(selectFeatureFlagsLastFetched(state as never)).toBeNull()
    })

    it('should return a timestamp when set', () => {
      const now = Date.now()
      const state = createMockState({ lastFetched: now })
      expect(selectFeatureFlagsLastFetched(state as never)).toBe(now)
    })
  })

  describe('selectFeatureFlag', () => {
    it('should return false for unknown flag', () => {
      const state = createMockState()
      expect(selectFeatureFlag(state as never, 'unknown_flag' as never)).toBe(false)
    })

    it('should return true for an enabled flag', () => {
      const state = createMockState({ flags: { my_flag: true } })
      expect(selectFeatureFlag(state as never, 'my_flag' as never)).toBe(true)
    })

    it('should return false for a disabled flag', () => {
      const state = createMockState({ flags: { my_flag: false } })
      expect(selectFeatureFlag(state as never, 'my_flag' as never)).toBe(false)
    })
  })

  describe('selectFeatureFlagsStale', () => {
    it('should return true when lastFetched is null', () => {
      const state = createMockState({ lastFetched: null })
      expect(selectFeatureFlagsStale(state as never)).toBe(true)
    })

    it('should return false when recently fetched', () => {
      const state = createMockState({ lastFetched: Date.now() })
      expect(selectFeatureFlagsStale(state as never)).toBe(false)
    })

    it('should return true when fetched a long time ago', () => {
      // Set lastFetched to more than 5 minutes ago
      const staleTime = Date.now() - 400000
      const state = createMockState({ lastFetched: staleTime })
      expect(selectFeatureFlagsStale(state as never)).toBe(true)
    })
  })
})
