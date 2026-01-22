import { TEST_EXISTING_USER_ID } from '@dx3/test-data'

/**
 * Mock for TokenService
 * Provides token generation and validation mocks for authentication tests
 */

export const mockTokenService = () => {
  jest.mock('./token.service', () => ({
    TokenService: {
      audience: 'dx3-api',
      generateTokens: jest.fn((_userId: string) => ({
        accessToken: 'mock-access-token',
        accessTokenExp: Date.now() + 3600000,
        refreshToken: 'mock-refresh-token',
        refreshTokenExp: Date.now() + 86400000,
      })),
      getUserIdFromRefreshToken: jest.fn((token: string) => {
        if (token) {
          return TEST_EXISTING_USER_ID
        }
        return ''
      }),
      getUserIdFromToken: jest.fn((token: string) => {
        if (token) {
          return TEST_EXISTING_USER_ID
        }
        return ''
      }),
      isRefreshValid: jest.fn(() => true),
      issuer: 'accounts.test.com',
    },
  }))
}
