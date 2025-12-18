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
 * Setup function for ApiLoggingClass mocking
 * Call this in test setup to initialize the mock
 */
export const mockApiLoggingClass = () => {
  // Initialize a default instance
  new ApiLoggingClass({ appName: 'TestApp' })
}
