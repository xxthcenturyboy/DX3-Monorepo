import { ApiLoggingClass } from '../logger'
import { AuthFailureTracker } from './auth-failure-tracker'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('AuthFailureTracker', () => {
  let tracker: AuthFailureTracker

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    tracker = new AuthFailureTracker()
  })

  afterEach(() => {
    tracker.stop()
  })

  it('should exist when imported', () => {
    expect(AuthFailureTracker).toBeDefined()
  })

  it('should create instance when constructed', () => {
    expect(tracker).toBeDefined()
    expect(tracker.trackFailure).toBeDefined()
    expect(tracker.getFailureCount).toBeDefined()
    expect(tracker.setAlertCallback).toBeDefined()
    expect(tracker.clear).toBeDefined()
    expect(tracker.stop).toBeDefined()
  })

  it('should have static instance getter', () => {
    expect(AuthFailureTracker.instance).toBe(tracker)
  })

  describe('trackFailure', () => {
    it('should increment count for same IP', () => {
      tracker.trackFailure('192.168.1.1')
      expect(tracker.getFailureCount('192.168.1.1')).toBe(1)

      tracker.trackFailure('192.168.1.1')
      expect(tracker.getFailureCount('192.168.1.1')).toBe(2)

      tracker.trackFailure('192.168.1.1')
      expect(tracker.getFailureCount('192.168.1.1')).toBe(3)
    })

    it('should track separately by IP', () => {
      tracker.trackFailure('192.168.1.1')
      tracker.trackFailure('192.168.1.1')
      tracker.trackFailure('10.0.0.1')

      expect(tracker.getFailureCount('192.168.1.1')).toBe(2)
      expect(tracker.getFailureCount('10.0.0.1')).toBe(1)
    })

    it('should track separately by fingerprint when provided', () => {
      tracker.trackFailure('192.168.1.1', 'fp-a')
      tracker.trackFailure('192.168.1.1', 'fp-a')
      tracker.trackFailure('192.168.1.1', 'fp-b')

      expect(tracker.getFailureCount('192.168.1.1', 'fp-a')).toBe(2)
      expect(tracker.getFailureCount('192.168.1.1', 'fp-b')).toBe(1)
    })
  })

  describe('setAlertCallback', () => {
    it('should invoke callback with warning when threshold reached', () => {
      const callback = jest.fn()
      tracker.setAlertCallback(callback)

      tracker.trackFailure('192.168.1.1')
      tracker.trackFailure('192.168.1.1')
      tracker.trackFailure('192.168.1.1')

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(
        'warning',
        expect.objectContaining({
          count: 3,
          ipAddress: '192.168.1.1',
        }),
      )
    })

    it('should invoke callback with critical when critical threshold reached', () => {
      const callback = jest.fn()
      tracker.setAlertCallback(callback)

      for (let i = 0; i < 10; i++) {
        tracker.trackFailure('192.168.1.1')
      }

      expect(callback).toHaveBeenCalledWith(
        'critical',
        expect.objectContaining({
          count: 10,
          ipAddress: '192.168.1.1',
        }),
      )
    })

    it('should not invoke callback when not set', () => {
      for (let i = 0; i < 5; i++) {
        tracker.trackFailure('192.168.1.1')
      }
      expect(tracker.getFailureCount('192.168.1.1')).toBe(5)
    })
  })

  describe('getFailureCount', () => {
    it('should return 0 for unknown IP', () => {
      expect(tracker.getFailureCount('unknown.ip')).toBe(0)
    })

    it('should return count for tracked IP', () => {
      tracker.trackFailure('192.168.1.1')
      tracker.trackFailure('192.168.1.1')
      expect(tracker.getFailureCount('192.168.1.1')).toBe(2)
    })
  })

  describe('clear', () => {
    it('should reset all counts', () => {
      tracker.trackFailure('192.168.1.1')
      tracker.trackFailure('192.168.1.1')
      expect(tracker.getFailureCount('192.168.1.1')).toBe(2)

      tracker.clear()
      expect(tracker.getFailureCount('192.168.1.1')).toBe(0)
    })
  })

  describe('stop', () => {
    it('should not throw when called', () => {
      expect(() => tracker.stop()).not.toThrow()
    })

    it('should allow stop to be called multiple times', () => {
      tracker.stop()
      expect(() => tracker.stop()).not.toThrow()
    })
  })

  describe('expired window handling', () => {
    it('should reset count when window has expired during trackFailure', () => {
      const dateSpy = jest.spyOn(Date, 'now')
      const baseTime = 1000000

      dateSpy.mockReturnValue(baseTime)
      tracker.trackFailure('192.168.1.1')
      expect(tracker.getFailureCount('192.168.1.1')).toBe(1)

      // Advance time beyond the 5-minute window (300001ms)
      dateSpy.mockReturnValue(baseTime + 300001)
      tracker.trackFailure('192.168.1.1')
      // Count should be reset to 1 (not 2) because window expired
      expect(tracker.getFailureCount('192.168.1.1')).toBe(1)

      dateSpy.mockRestore()
    })

    it('should return 0 from getFailureCount when window has expired', () => {
      const dateSpy = jest.spyOn(Date, 'now')
      const baseTime = 2000000

      dateSpy.mockReturnValue(baseTime)
      tracker.trackFailure('10.0.0.1')
      expect(tracker.getFailureCount('10.0.0.1')).toBe(1)

      // Advance time beyond the window
      dateSpy.mockReturnValue(baseTime + 300001)
      expect(tracker.getFailureCount('10.0.0.1')).toBe(0)

      dateSpy.mockRestore()
    })

    it('should clean up stale entries via cleanup interval', () => {
      jest.useFakeTimers()
      const localTracker = new AuthFailureTracker()
      const dateSpy = jest.spyOn(Date, 'now')
      const baseTime = 3000000

      dateSpy.mockReturnValue(baseTime)
      localTracker.trackFailure('172.16.0.1')
      expect(localTracker.getFailureCount('172.16.0.1')).toBe(1)

      // Advance time so the entry becomes stale
      dateSpy.mockReturnValue(baseTime + 300001)
      // Trigger the cleanup interval (every 60 seconds)
      jest.advanceTimersByTime(60001)

      // After cleanup, getFailureCount should reflect the expired window
      expect(localTracker.getFailureCount('172.16.0.1')).toBe(0)

      localTracker.stop()
      dateSpy.mockRestore()
      jest.useRealTimers()
    })
  })
})
