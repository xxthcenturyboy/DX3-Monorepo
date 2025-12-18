jest.mock('../../logger', () => require('../../testing/mocks/internal/logger.mock'))

// Unmock TokenService so we test the real implementation
jest.unmock('./token.service')

import { TEST_UUID } from '@dx3/test-data'

import { ApiLoggingClass } from '../../logger'
import { TokenService } from './token.service'

describe('TokenService', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist', () => {
    expect(TokenService).toBeDefined()
  })

  it('should have correct issuer', () => {
    // arrange & act & assert
    expect(TokenService.issuer).toBeDefined()
    expect(TokenService.issuer).toContain('accounts.')
  })

  describe('generateTokens', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(TokenService.generateTokens).toBeDefined()
    })

    it('should generate tokens when called', () => {
      // arrange
      // act
      const tokens = TokenService.generateTokens(TEST_UUID)
      // assert
      expect(tokens).toBeDefined()
      expect(tokens.accessToken).toBeDefined()
      expect(tokens.accessTokenExp).toBeDefined()
      expect(tokens.refreshToken).toBeDefined()
      expect(tokens.refreshTokenExp).toBeDefined()
    })

    it('should set default expiration times correctly', () => {
      // arrange
      const now = Date.now()
      // act
      const tokens = TokenService.generateTokens(TEST_UUID)
      // assert
      // Access token should expire in ~30 minutes (with small buffer for test execution)
      const accessExpDiff = tokens.accessTokenExp * 1000 - now
      expect(accessExpDiff).toBeGreaterThan(29 * 60 * 1000) // At least 29 minutes
      expect(accessExpDiff).toBeLessThan(31 * 60 * 1000) // Less than 31 minutes

      // Refresh token should expire in ~2 days
      const refreshExpDiff = tokens.refreshTokenExp * 1000 - now
      expect(refreshExpDiff).toBeGreaterThan(47 * 60 * 60 * 1000) // At least 47 hours
      expect(refreshExpDiff).toBeLessThan(49 * 60 * 60 * 1000) // Less than 49 hours
    })

    it('should accept custom expiration parameters', () => {
      // arrange
      const now = Date.now()
      const customParams = {
        accessToken: {
          addSub: 'ADD' as const,
          time: 1,
          unit: 'hours' as const,
        },
        refreshToken: {
          addSub: 'ADD' as const,
          time: 7,
          unit: 'days' as const,
        },
      }
      // act
      const tokens = TokenService.generateTokens(TEST_UUID, customParams)
      // assert
      // Access token should expire in ~1 hour
      const accessExpDiff = tokens.accessTokenExp * 1000 - now
      expect(accessExpDiff).toBeGreaterThan(59 * 60 * 1000) // At least 59 minutes
      expect(accessExpDiff).toBeLessThan(61 * 60 * 1000) // Less than 61 minutes

      // Refresh token should expire in ~7 days
      const refreshExpDiff = tokens.refreshTokenExp * 1000 - now
      expect(refreshExpDiff).toBeGreaterThan(6.9 * 24 * 60 * 60 * 1000) // At least 6.9 days
      expect(refreshExpDiff).toBeLessThan(7.1 * 24 * 60 * 60 * 1000) // Less than 7.1 days
    })

    it('should generate tokens with different expiration times', () => {
      // arrange
      const shortParams = {
        accessToken: {
          addSub: 'ADD' as const,
          time: 10,
          unit: 'seconds' as const,
        },
        refreshToken: {
          addSub: 'ADD' as const,
          time: 1,
          unit: 'minutes' as const,
        },
      }
      // act
      const tokens = TokenService.generateTokens(TEST_UUID, shortParams)
      const now = Date.now() / 1000 // Convert to seconds for comparison
      // assert
      expect(tokens.accessTokenExp).toBeGreaterThan(now)
      expect(tokens.refreshTokenExp).toBeGreaterThan(tokens.accessTokenExp)
    })

    it('should ensure refresh token expires after access token', () => {
      // arrange
      // act
      const tokens = TokenService.generateTokens(TEST_UUID)
      // assert
      expect(tokens.refreshTokenExp).toBeGreaterThan(tokens.accessTokenExp)
    })
  })

  describe('getUserIdFromToken', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(TokenService.getUserIdFromToken).toBeDefined()
    })

    it('should get a userID from an accessToken when called', () => {
      // arrange
      // act
      const tokens = TokenService.generateTokens(TEST_UUID)
      const userId = TokenService.getUserIdFromToken(tokens.accessToken)
      // assert
      expect(userId).toBeDefined()
      expect(userId).toEqual(TEST_UUID)
    })

    it('should get a userID from a refreshToken when called', () => {
      // arrange
      // act
      const tokens = TokenService.generateTokens(TEST_UUID)
      const userId = TokenService.getUserIdFromToken(tokens.refreshToken)
      // assert
      expect(userId).toBeDefined()
      expect(userId).toEqual(TEST_UUID)
    })

    it('should return empty string for invalid token', () => {
      // arrange
      const invalidToken = 'invalid-token-string'
      // act
      const userId = TokenService.getUserIdFromToken(invalidToken)
      // assert
      expect(userId).toBe('')
    })

    it('should return empty string for empty token', () => {
      // arrange
      const emptyToken = ''
      // act
      const userId = TokenService.getUserIdFromToken(emptyToken)
      // assert
      expect(userId).toBe('')
    })
  })

  describe('isRefreshValid', () => {
    it('should exist', () => {
      // arrange
      // act
      // assert
      expect(TokenService.isRefreshValid).toBeDefined()
    })

    test('should return false when refresh token is invalid', async () => {
      // arrange
      // act
      const tokens = TokenService.generateTokens(TEST_UUID)
      const userId = await TokenService.isRefreshValid(tokens.refreshToken)
      // assert
      expect(userId).toBeDefined()
      expect(userId).toBe(false)
    })
  })
})
