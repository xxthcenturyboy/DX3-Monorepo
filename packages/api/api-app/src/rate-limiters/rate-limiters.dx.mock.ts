import type { NextFunction, Request, Response } from 'express'

/**
 * Mock for DxRateLimiters
 * Provides rate limiter mocks that allow all requests through in tests
 */

export const mockRateLimiters = () => {
  jest.mock('./rate-limiters.dx', () => ({
    DxRateLimiters: {
      accountCreation: jest.fn(() => (_req: Request, _res: Response, next: NextFunction) => next()),
      authLookup: jest.fn(() => (_req: Request, _res: Response, next: NextFunction) => next()),
      login: jest.fn(() => (_req: Request, _res: Response, next: NextFunction) => next()),
      standard: jest.fn(() => (_req: Request, _res: Response, next: NextFunction) => next()),
      strict: jest.fn(() => (_req: Request, _res: Response, next: NextFunction) => next()),
      veryStrict: jest.fn(() => (_req: Request, _res: Response, next: NextFunction) => next()),
    },
  }))
}

/**
 * Export mock instance for use in test assertions
 *
 * @example
 * import { rateLimitersMock } from '../testing/mocks';
 * expect(rateLimitersMock.standard).toHaveBeenCalled();
 */
export const rateLimitersMock = {
  accountCreation: jest.fn(),
  authLookup: jest.fn(),
  login: jest.fn(),
  standard: jest.fn(),
  strict: jest.fn(),
  veryStrict: jest.fn(),
}
