import {
  adminMetricsActions,
  adminMetricsInitialState,
  adminMetricsReducer,
} from './admin-metrics-web.reducer'

describe('adminMetricsReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = adminMetricsReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(adminMetricsInitialState)
  })

  it('should have correct initial state', () => {
    expect(adminMetricsInitialState).toEqual({
      dateRange: '30d',
      growth: null,
      isAvailable: null,
      lastRoute: '',
    })
  })

  describe('dateRangeSet', () => {
    it('should set dateRange', () => {
      const state = adminMetricsReducer(
        adminMetricsInitialState,
        adminMetricsActions.dateRangeSet('7d'),
      )
      expect(state.dateRange).toBe('7d')
    })

    it('should update dateRange from 30d to 90d', () => {
      const state = adminMetricsReducer(
        adminMetricsInitialState,
        adminMetricsActions.dateRangeSet('90d'),
      )
      expect(state.dateRange).toBe('90d')
    })
  })

  describe('growthSet', () => {
    it('should set growth data', () => {
      const growthData = { dau: [], mau: [], signups30d: 0, signups7d: 0, totalSignups: 0, wau: [] } as never
      const state = adminMetricsReducer(
        adminMetricsInitialState,
        adminMetricsActions.growthSet(growthData),
      )
      expect(state.growth).toBe(growthData)
    })

    it('should set growth to null', () => {
      const state = adminMetricsReducer(
        adminMetricsInitialState,
        adminMetricsActions.growthSet(null),
      )
      expect(state.growth).toBeNull()
    })
  })

  describe('isAvailableSet', () => {
    it('should set isAvailable to true', () => {
      const state = adminMetricsReducer(
        adminMetricsInitialState,
        adminMetricsActions.isAvailableSet(true),
      )
      expect(state.isAvailable).toBe(true)
    })

    it('should set isAvailable to false', () => {
      const state = adminMetricsReducer(
        adminMetricsInitialState,
        adminMetricsActions.isAvailableSet(false),
      )
      expect(state.isAvailable).toBe(false)
    })

    it('should set isAvailable to null', () => {
      const state = adminMetricsReducer(
        adminMetricsInitialState,
        adminMetricsActions.isAvailableSet(null),
      )
      expect(state.isAvailable).toBeNull()
    })
  })

  describe('lastRouteSet', () => {
    it('should set lastRoute', () => {
      const state = adminMetricsReducer(
        adminMetricsInitialState,
        adminMetricsActions.lastRouteSet('/admin-metrics'),
      )
      expect(state.lastRoute).toBe('/admin-metrics')
    })
  })
})
