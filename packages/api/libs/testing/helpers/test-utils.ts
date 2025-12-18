/// <reference types="jest" />

import type { NextFunction, Request, Response } from 'express'

import { regexUuid } from '@dx3/utils-shared'

/**
 * Test utility functions
 * Provides common helpers for API tests
 */

/**
 * Create a mock Express request object
 *
 * @example
 * const req = createMockRequest({ user: { id: 'test-user' } });
 */
export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => {
  return {
    body: {},
    headers: {},
    params: {},
    query: {},
    ...overrides,
  }
}

/**
 * Create a mock Express response object
 *
 * @example
 * const res = createMockResponse();
 * expect(res.status).toHaveBeenCalledWith(200);
 */
export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    clearCookie: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  }
  return res
}

/**
 * Create a mock Express next function
 *
 * @example
 * const next = createMockNext();
 * expect(next).toHaveBeenCalled();
 */
export const createMockNext = (): NextFunction => {
  return jest.fn()
}

/**
 * Wait for all promises to resolve
 * Useful for testing async operations
 *
 * @example
 * await flushPromises();
 * expect(mockFn).toHaveBeenCalled();
 */
export const flushPromises = (): Promise<void> => {
  return new Promise((resolve) => setImmediate(resolve))
}

/**
 * Generate a mock UUID for testing
 */
export const mockUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Mock a date for consistent testing
 * Uses jest.spyOn to mock Date.now()
 *
 * @example
 * const mockDate = mockSystemDate(new Date('2025-01-01'));
 * // ... run tests
 * mockDate.restore();
 */
export const mockSystemDate = (date: Date) => {
  const mockTimestamp = date.getTime()

  // Mock Date.now() to return fixed timestamp
  const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp)

  // Mock Date constructor for new Date() calls
  const RealDate = Date
  const originalDate = global.Date

  // Create a constructor function that handles both cases
  // biome-ignore lint/suspicious/noExplicitAny: any is fine here
  const MockDateConstructor: any = function (this: any, ...args: any[]) {
    // If called without arguments, return fixed date
    if (args.length === 0) {
      return new RealDate(mockTimestamp)
    }
    // Otherwise, pass through to real Date with arguments
    if (args.length === 1) return new RealDate(args[0])
    if (args.length === 2) return new RealDate(args[0], args[1])
    if (args.length === 3) return new RealDate(args[0], args[1], args[2])
    if (args.length === 4) return new RealDate(args[0], args[1], args[2], args[3])
    if (args.length === 5) return new RealDate(args[0], args[1], args[2], args[3], args[4])
    if (args.length === 6) return new RealDate(args[0], args[1], args[2], args[3], args[4], args[5])
    if (args.length === 7)
      return new RealDate(args[0], args[1], args[2], args[3], args[4], args[5], args[6])
    return new RealDate()
  }

  // Copy static properties from RealDate
  MockDateConstructor.now = () => mockTimestamp
  MockDateConstructor.parse = RealDate.parse
  MockDateConstructor.UTC = RealDate.UTC
  MockDateConstructor.prototype = RealDate.prototype

  global.Date = MockDateConstructor

  return {
    restore: () => {
      global.Date = originalDate
      nowSpy.mockRestore()
    },
  }
}

/**
 * Custom Jest matchers
 * Add these to your test-setup.ts with expect.extend()
 */
export const customMatchers = {
  /**
   * Check if a value is a valid ISO date string
   */
  toBeValidISODate(received: string) {
    const date = new Date(received)
    const pass = !Number.isNaN(date.getTime()) && received === date.toISOString()

    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid ISO date`
          : `expected ${received} to be a valid ISO date`,
      pass,
    }
  },
  /**
   * Check if a string is a valid UUID
   */
  toBeValidUUID(received: string) {
    const pass = regexUuid.test(received)

    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid UUID`
          : `expected ${received} to be a valid UUID`,
      pass,
    }
  },
}

/**
 * Type declaration for custom matchers
 * Add this to a .d.ts file or at the top of test-setup.ts
 */
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R
      toBeValidISODate(): R
    }
  }
}
