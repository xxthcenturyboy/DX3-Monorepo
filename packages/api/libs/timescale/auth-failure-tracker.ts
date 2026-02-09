import type { AuthFailureAlertPayload } from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'

/**
 * Threshold levels for auth failure alerts
 */
const ALERT_THRESHOLDS = {
  CRITICAL: 10,
  WARNING: 3,
} as const

/**
 * Sliding window duration in milliseconds (5 minutes)
 */
const WINDOW_DURATION_MS = 5 * 60 * 1000

/**
 * Cleanup interval for stale entries (1 minute)
 */
const CLEANUP_INTERVAL_MS = 60 * 1000

type FailureEntry = {
  count: number
  firstSeen: number
  lastAlertLevel: 'critical' | 'none' | 'warning'
}

type AlertCallback = (level: 'critical' | 'warning', payload: AuthFailureAlertPayload) => void

/**
 * AuthFailureTracker
 *
 * Tracks authentication failures using an in-memory Map with a sliding window.
 * Emits alerts when thresholds are reached.
 *
 * Limitations:
 * - Counts are not shared across API instances
 * - Counts reset on server restart
 * - Acceptable trade-off for simplicity
 */
export class AuthFailureTracker {
  static #instance: AuthFailureTrackerType | null = null

  private failures: Map<string, FailureEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null
  private alertCallback: AlertCallback | null = null
  private logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
    this.startCleanupJob()
    AuthFailureTracker.#instance = this
  }

  public static get instance(): AuthFailureTrackerType | null {
    return AuthFailureTracker.#instance
  }

  /**
   * Set callback for when alerts should be emitted
   */
  public setAlertCallback(callback: AlertCallback): void {
    this.alertCallback = callback
  }

  /**
   * Generate tracking key from IP and fingerprint
   */
  private getKey(ipAddress: string, fingerprint?: string): string {
    return `${ipAddress}:${fingerprint || 'unknown'}`
  }

  /**
   * Track an auth failure and check thresholds
   */
  public trackFailure(ipAddress: string, fingerprint?: string): void {
    const key = this.getKey(ipAddress, fingerprint)
    const now = Date.now()

    let entry = this.failures.get(key)

    if (!entry) {
      // New entry
      entry = {
        count: 1,
        firstSeen: now,
        lastAlertLevel: 'none',
      }
      this.failures.set(key, entry)
      return
    }

    // Check if window has expired
    if (now - entry.firstSeen > WINDOW_DURATION_MS) {
      // Reset the window
      entry.count = 1
      entry.firstSeen = now
      entry.lastAlertLevel = 'none'
      return
    }

    // Increment count within window
    entry.count++

    // Check thresholds and emit alerts
    this.checkThresholds(key, entry, ipAddress, fingerprint)
  }

  /**
   * Check thresholds and emit alerts if needed
   */
  private checkThresholds(
    key: string,
    entry: FailureEntry,
    ipAddress: string,
    fingerprint?: string,
  ): void {
    const payload: AuthFailureAlertPayload = {
      count: entry.count,
      fingerprint,
      ipAddress,
      timestamp: new Date().toISOString(),
    }

    // Critical threshold (10+)
    if (entry.count >= ALERT_THRESHOLDS.CRITICAL && entry.lastAlertLevel !== 'critical') {
      entry.lastAlertLevel = 'critical'
      this.logger.logWarn(`Auth failure CRITICAL: ${entry.count} failures from ${key} in 5 minutes`)
      if (this.alertCallback) {
        this.alertCallback('critical', payload)
      }
      return
    }

    // Warning threshold (3-9)
    if (
      entry.count >= ALERT_THRESHOLDS.WARNING &&
      entry.count < ALERT_THRESHOLDS.CRITICAL &&
      entry.lastAlertLevel === 'none'
    ) {
      entry.lastAlertLevel = 'warning'
      this.logger.logInfo(`Auth failure warning: ${entry.count} failures from ${key} in 5 minutes`)
      if (this.alertCallback) {
        this.alertCallback('warning', payload)
      }
    }
  }

  /**
   * Start periodic cleanup of stale entries
   */
  private startCleanupJob(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, CLEANUP_INTERVAL_MS)
  }

  /**
   * Remove entries older than the window duration
   */
  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.failures) {
      if (now - entry.firstSeen > WINDOW_DURATION_MS) {
        this.failures.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      this.logger.logInfo(`AuthFailureTracker: Cleaned up ${cleaned} stale entries`)
    }
  }

  /**
   * Get current failure count for an IP/fingerprint (for testing/debugging)
   */
  public getFailureCount(ipAddress: string, fingerprint?: string): number {
    const key = this.getKey(ipAddress, fingerprint)
    const entry = this.failures.get(key)

    if (!entry) {
      return 0
    }

    // Check if window has expired
    if (Date.now() - entry.firstSeen > WINDOW_DURATION_MS) {
      return 0
    }

    return entry.count
  }

  /**
   * Clear all tracked failures (for testing)
   */
  public clear(): void {
    this.failures.clear()
  }

  /**
   * Stop the cleanup job (for graceful shutdown)
   */
  public stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

export type AuthFailureTrackerType = typeof AuthFailureTracker.prototype
