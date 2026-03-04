import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'

import { setupStore } from '../store/testing/testing.store'
import { featureFlagsActions } from './feature-flag-web.reducer'
import { useFeatureFlag, useFeatureFlags } from './feature-flag-web.hooks'

function createWrapper(initialState = {}) {
  const store = setupStore(initialState)
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return { store, Wrapper }
}

describe('useFeatureFlag', () => {
  it('should return false for an unknown flag', () => {
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useFeatureFlag('my_flag' as never), { wrapper: Wrapper })
    expect(result.current).toBe(false)
  })

  it('should return true for an enabled flag', () => {
    const { Wrapper, store } = createWrapper()
    store.dispatch(
      featureFlagsActions.featureFlagsFetched([{ enabled: true, name: 'my_flag' }] as never),
    )
    const { result } = renderHook(() => useFeatureFlag('my_flag' as never), { wrapper: Wrapper })
    expect(result.current).toBe(true)
  })

  it('should return false for a disabled flag', () => {
    const { Wrapper, store } = createWrapper()
    store.dispatch(
      featureFlagsActions.featureFlagsFetched([{ enabled: false, name: 'my_flag' }] as never),
    )
    const { result } = renderHook(() => useFeatureFlag('my_flag' as never), { wrapper: Wrapper })
    expect(result.current).toBe(false)
  })
})

describe('useFeatureFlags', () => {
  it('should return an isEnabled function and isLoading state', () => {
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useFeatureFlags(), { wrapper: Wrapper })
    expect(typeof result.current.isEnabled).toBe('function')
    expect(typeof result.current.isLoading).toBe('boolean')
  })

  it('should return isLoading = false initially', () => {
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useFeatureFlags(), { wrapper: Wrapper })
    expect(result.current.isLoading).toBe(false)
  })

  it('isEnabled should return false for unknown flags', () => {
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useFeatureFlags(), { wrapper: Wrapper })
    expect(result.current.isEnabled('unknown_flag' as never)).toBe(false)
  })

  it('isEnabled should return true for enabled flags', () => {
    const { Wrapper, store } = createWrapper()
    store.dispatch(
      featureFlagsActions.featureFlagsFetched([{ enabled: true, name: 'test_flag' }] as never),
    )
    const { result } = renderHook(() => useFeatureFlags(), { wrapper: Wrapper })
    expect(result.current.isEnabled('test_flag' as never)).toBe(true)
  })
})
