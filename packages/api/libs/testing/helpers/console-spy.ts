/// <reference types="jest" />

/**
 * Console Spy Utility
 * Provides utilities to spy on and mock console methods during tests
 */

export interface ConsoleSpy {
  log: jest.SpyInstance
  error: jest.SpyInstance
  warn: jest.SpyInstance
  info: jest.SpyInstance
  debug: jest.SpyInstance
}

/**
 * Creates spies for all console methods
 * Automatically suppresses output by default
 *
 * @param suppressOutput - Whether to suppress console output (default: true)
 * @returns Object containing all console spies
 *
 * @example
 * describe('MyTest', () => {
 *   const consoleSpy = setupConsoleSpy();
 *
 *   afterEach(() => {
 *     consoleSpy.log.mockClear();
 *     consoleSpy.error.mockClear();
 *   });
 *
 *   afterAll(() => {
 *     restoreConsoleSpy(consoleSpy);
 *   });
 *
 *   test('should log', () => {
 *     console.log('test');
 *     expect(consoleSpy.log).toHaveBeenCalledWith('test');
 *   });
 * });
 */
export const setupConsoleSpy = (suppressOutput: boolean = true): ConsoleSpy => {
  const implementation = suppressOutput ? () => {} : undefined

  return {
    debug: jest.spyOn(console, 'debug').mockImplementation(implementation),
    error: jest.spyOn(console, 'error').mockImplementation(implementation),
    info: jest.spyOn(console, 'info').mockImplementation(implementation),
    log: jest.spyOn(console, 'log').mockImplementation(implementation),
    warn: jest.spyOn(console, 'warn').mockImplementation(implementation),
  }
}

/**
 * Restores console methods to their original implementations
 *
 * @param spy - The console spy object to restore
 *
 * @example
 * afterAll(() => {
 *   restoreConsoleSpy(consoleSpy);
 * });
 */
export const restoreConsoleSpy = (spy: ConsoleSpy): void => {
  spy.log.mockRestore()
  spy.error.mockRestore()
  spy.warn.mockRestore()
  spy.info.mockRestore()
  spy.debug.mockRestore()
}

/**
 * Clears all mock call history for console spies
 *
 * @param spy - The console spy object to clear
 *
 * @example
 * afterEach(() => {
 *   clearConsoleSpy(consoleSpy);
 * });
 */
export const clearConsoleSpy = (spy: ConsoleSpy): void => {
  spy.log.mockClear()
  spy.error.mockClear()
  spy.warn.mockClear()
  spy.info.mockClear()
  spy.debug.mockClear()
}

/**
 * Hook-based console spy setup
 * Use this in beforeAll/afterAll for automatic setup and cleanup
 *
 * @returns Object with setup and cleanup functions
 *
 * @example
 * describe('MyTest', () => {
 *   const { spy, setup, cleanup } = useConsoleSpy();
 *
 *   beforeAll(setup);
 *   afterAll(cleanup);
 *
 *   test('should not log to console', () => {
 *     console.log('hidden');
 *     expect(spy.log).toHaveBeenCalled();
 *   });
 * });
 */
export const useConsoleSpy = (suppressOutput: boolean = true) => {
  let spy: ConsoleSpy | null = null

  return {
    cleanup: () => {
      if (spy) {
        restoreConsoleSpy(spy)
        spy = null
      }
    },
    clear: () => {
      if (spy) {
        clearConsoleSpy(spy)
      }
    },
    setup: () => {
      spy = setupConsoleSpy(suppressOutput)
      return spy
    },
    get spy() {
      if (!spy) {
        throw new Error('Console spy not initialized. Call setup() first.')
      }
      return spy
    },
  }
}

/**
 * Suppress console output for a specific test or block
 * Automatically restores after the test
 *
 * @example
 * test('noisy test', suppressConsole(() => {
 *   console.log('this will not appear');
 *   // test code
 * }));
 */
export const suppressConsole = (fn: () => void | Promise<void>) => {
  return async () => {
    const spy = setupConsoleSpy(true)
    try {
      await fn()
    } finally {
      restoreConsoleSpy(spy)
    }
  }
}
