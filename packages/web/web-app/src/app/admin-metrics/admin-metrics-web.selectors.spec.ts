import { adminMetricsInitialState } from './admin-metrics-web.reducer'
import {
  selectAdminMetricsState,
  selectMetricsDateRange,
  selectMetricsGrowth,
  selectMetricsIsAvailable,
} from './admin-metrics-web.selectors'
import type { AdminMetricsStateType } from './admin-metrics-web.types'

type MockRootState = {
  adminMetrics: AdminMetricsStateType
}

const createMockState = (overrides: Partial<AdminMetricsStateType> = {}): MockRootState => ({
  adminMetrics: { ...adminMetricsInitialState, ...overrides },
})

describe('admin-metrics selectors', () => {
  describe('selectAdminMetricsState', () => {
    it('should return the full adminMetrics state shape', () => {
      const state = createMockState()
      const result = selectAdminMetricsState(state as never)
      expect(result).toEqual({
        dateRange: '30d',
        growth: null,
        isAvailable: null,
        lastRoute: '',
      })
    })
  })

  describe('selectMetricsDateRange', () => {
    it('should return the current dateRange', () => {
      const state = createMockState({ dateRange: '7d' })
      const result = selectMetricsDateRange(state as never)
      expect(result).toBe('7d')
    })

    it('should return default 30d', () => {
      const state = createMockState()
      expect(selectMetricsDateRange(state as never)).toBe('30d')
    })
  })

  describe('selectMetricsGrowth', () => {
    it('should return null when not set', () => {
      const state = createMockState()
      expect(selectMetricsGrowth(state as never)).toBeNull()
    })

    it('should return growth data when set', () => {
      const growth = { totalSignups: 10 } as never
      const state = createMockState({ growth })
      expect(selectMetricsGrowth(state as never)).toBe(growth)
    })
  })

  describe('selectMetricsIsAvailable', () => {
    it('should return null initially', () => {
      const state = createMockState()
      expect(selectMetricsIsAvailable(state as never)).toBeNull()
    })

    it('should return true when available', () => {
      const state = createMockState({ isAvailable: true })
      expect(selectMetricsIsAvailable(state as never)).toBe(true)
    })

    it('should return false when not available', () => {
      const state = createMockState({ isAvailable: false })
      expect(selectMetricsIsAvailable(state as never)).toBe(false)
    })
  })
})
