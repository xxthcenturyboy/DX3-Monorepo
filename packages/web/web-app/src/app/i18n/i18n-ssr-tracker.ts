/**
 * SSR i18n Key Tracking
 *
 * Tracks which i18n keys are accessed during SSR rendering
 * so we can serialize only the keys that were actually used.
 */

import type { StringKeyName } from './i18n.types'

/**
 * Global tracker for i18n keys accessed during SSR.
 * Only active during SSR rendering, null otherwise.
 */
let ssrKeyTracker: Set<StringKeyName> | null = null

/**
 * Start tracking i18n key access during SSR.
 * Call this before rendering.
 */
export function startSsrKeyTracking(): void {
  ssrKeyTracker = new Set<StringKeyName>()
}

/**
 * Stop tracking and return the keys that were accessed.
 * Call this after rendering completes.
 *
 * @returns Array of i18n keys that were accessed during render
 */
export function stopSsrKeyTracking(): StringKeyName[] {
  if (!ssrKeyTracker) {
    return []
  }

  const keys = Array.from(ssrKeyTracker)
  ssrKeyTracker = null
  return keys
}

/**
 * Track that a specific i18n key was accessed.
 * Only tracks if SSR tracking is active.
 *
 * @param key - The i18n key that was accessed
 */
export function trackSsrKeyAccess(key: StringKeyName): void {
  if (ssrKeyTracker) {
    ssrKeyTracker.add(key)
  }
}

/**
 * Check if SSR key tracking is currently active.
 */
export function isSsrKeyTrackingActive(): boolean {
  return ssrKeyTracker !== null
}
