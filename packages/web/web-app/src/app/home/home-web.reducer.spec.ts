import { homeActions, homeInitialState, homeReducer } from './home-web.reducer'

describe('homeReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = homeReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(homeInitialState)
  })

  it('should have correct initial state', () => {
    expect(homeInitialState).toEqual({ a: null })
  })

  it('should have actions defined', () => {
    expect(homeActions).toBeDefined()
  })
})
