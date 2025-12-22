import { TEST_EXISTING_USER_ID } from '@dx3/test-data'

/**
 * Mock for TokenService
 * Provides token generation and validation mocks for authentication tests
 */

export const mockTokenService = () => {
  jest.mock('./token.service', () => ({
    TokenService: {
      audience: 'dx3-api',
      issuer: 'accounts.test.com',
      generateTokens: jest.fn((_userId: string) => ({
        accessToken: 'mock-access-token',
        accessTokenExp: Date.now() + 3600000,
        refreshToken: 'mock-refresh-token',
        refreshTokenExp: Date.now() + 86400000,
      })),
      getUserIdFromToken: jest.fn((token: string) => {
        if (token) {
          return TEST_EXISTING_USER_ID
        }
        return ''
      }),
      getUserIdFromRefreshToken: jest.fn((token: string) => {
        if (token) {
          return TEST_EXISTING_USER_ID
        }
        return ''
      }),
      isRefreshValid: jest.fn(() => true),
    },
  }))
}
