import {
  isSsrKeyTrackingActive,
  startSsrKeyTracking,
  stopSsrKeyTracking,
  trackSsrKeyAccess,
} from './i18n-ssr-tracker'

describe('i18n-ssr-tracker', () => {
  afterEach(() => {
    // Ensure tracking is stopped after each test
    stopSsrKeyTracking()
  })

  describe('startSsrKeyTracking', () => {
    it('should start tracking when called', () => {
      startSsrKeyTracking()
      expect(isSsrKeyTrackingActive()).toBe(true)
    })
  })

  describe('stopSsrKeyTracking', () => {
    it('should return empty array when tracking was not started', () => {
      const keys = stopSsrKeyTracking()
      expect(keys).toEqual([])
    })

    it('should return tracked keys and stop tracking', () => {
      startSsrKeyTracking()
      trackSsrKeyAccess('LOGIN' as never)
      trackSsrKeyAccess('LOGOUT' as never)
      const keys = stopSsrKeyTracking()
      expect(keys).toContain('LOGIN')
      expect(keys).toContain('LOGOUT')
      expect(isSsrKeyTrackingActive()).toBe(false)
    })

    it('should return empty array after stopping tracking', () => {
      startSsrKeyTracking()
      stopSsrKeyTracking()
      const keys = stopSsrKeyTracking()
      expect(keys).toEqual([])
    })
  })

  describe('trackSsrKeyAccess', () => {
    it('should not throw when tracking is not active', () => {
      expect(() => trackSsrKeyAccess('LOGIN' as never)).not.toThrow()
    })

    it('should track a key when active', () => {
      startSsrKeyTracking()
      trackSsrKeyAccess('DASHBOARD' as never)
      const keys = stopSsrKeyTracking()
      expect(keys).toContain('DASHBOARD')
    })

    it('should deduplicate keys', () => {
      startSsrKeyTracking()
      trackSsrKeyAccess('PROFILE' as never)
      trackSsrKeyAccess('PROFILE' as never)
      trackSsrKeyAccess('PROFILE' as never)
      const keys = stopSsrKeyTracking()
      expect(keys.filter((k) => k === 'PROFILE').length).toBe(1)
    })
  })

  describe('isSsrKeyTrackingActive', () => {
    it('should return false when not tracking', () => {
      expect(isSsrKeyTrackingActive()).toBe(false)
    })

    it('should return true when tracking is started', () => {
      startSsrKeyTracking()
      expect(isSsrKeyTrackingActive()).toBe(true)
    })
  })
})
