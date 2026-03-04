import { dashbaordInitialState, dashboardActions, dashboardReducer } from './dashboard-web.reducer'

describe('dashboardReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = dashboardReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(dashbaordInitialState)
  })

  it('should have correct initial state', () => {
    expect(dashbaordInitialState).toEqual({ a: null })
  })

  it('should have actions defined', () => {
    expect(dashboardActions).toBeDefined()
  })
})
