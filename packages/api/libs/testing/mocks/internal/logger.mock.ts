/**
 * Mock for ApiLoggingClass from @dx3/api-libs/logger
 * Provides a stub logger for unit tests that suppresses output
 */

export class ApiLoggingClass {
  appName: string
  static #instance: ApiLoggingClass

  constructor({ appName }: { appName: string }) {
    this.appName = appName
    ApiLoggingClass.#instance = this
  }

  public static get instance() {
    return ApiLoggingClass.#instance
  }

  public logInfo() {
    return true
  }

  public logWarn() {
    return true
  }

  public logError() {
    return true
  }

  public logDebug() {
    return true
  }
}

export type ApiLoggingClassType = typeof ApiLoggingClass.prototype

/**
 * Mock for logTable utility
 */
export const logTable = jest.fn()

/**
 * Mock for sanitizeForLogging utility
 * In tests, we just return the object as-is for simplicity
 */
export const sanitizeForLogging = <T>(obj: T): T => obj

/**
 * Mock for safeStringify utility
 * In tests, we use regular JSON.stringify
 */
export const safeStringify = (obj: unknown, space?: number): string => {
  if (obj === null || obj === undefined) {
    return String(obj)
  }
  if (typeof obj !== 'object') {
    return String(obj)
  }
  try {
    return JSON.stringify(obj, null, space)
  } catch {
    return '[Unable to stringify object]'
  }
}

/**
 * Setup function for ApiLoggingClass mocking
 * Call this in test setup to initialize the mock
 */
export const mockApiLoggingClass = () => {
  // Initialize a default instance
  new ApiLoggingClass({ appName: 'TestApp' })
}
