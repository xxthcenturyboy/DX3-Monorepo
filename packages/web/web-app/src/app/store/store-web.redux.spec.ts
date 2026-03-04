import { store } from './store-web.redux'

jest.mock('../data/rtk-query')

describe('store', () => {
  it('should exist', () => {
    expect(store).toBeDefined()
  })

  it('should have a dispatch function', () => {
    expect(typeof store.dispatch).toBe('function')
  })

  it('should have a getState function', () => {
    expect(typeof store.getState).toBe('function')
  })

  it('should have expected top-level state slices', () => {
    const state = store.getState()
    expect(state).toHaveProperty('auth')
    expect(state).toHaveProperty('ui')
    expect(state).toHaveProperty('userProfile')
    expect(state).toHaveProperty('i18n')
    expect(state).toHaveProperty('adminLogs')
    expect(state).toHaveProperty('featureFlags')
    expect(state).toHaveProperty('notification')
  })

  it('should return the same state reference when no action dispatched', () => {
    const state1 = store.getState()
    const state2 = store.getState()
    expect(state1).toBe(state2)
  })
})
