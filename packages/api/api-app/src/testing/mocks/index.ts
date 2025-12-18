/**
 * Centralized mock exports for api-app tests
 *
 * Re-exports all mocks from libs/testing/mocks plus app-specific mocks
 */

// Re-export everything from libs testing mocks
export * from '@dx3/api-libs/testing/mocks'

import { mockOtpCodeCache } from '@dx3/api-libs/auth/otp/otp-code.redis-cache.mock'
import { mockTokenService } from '@dx3/api-libs/auth/tokens/token.service.mock'
import { mockCookieService } from '@dx3/api-libs/cookies/cookie.service.mock'
import { mockEmailModel } from '@dx3/api-libs/email/email-api.postgres-model.mock'
import { mockHeaderService } from '@dx3/api-libs/headers/header.service.mock'
import { mockHttpResponses } from '@dx3/api-libs/http-response/http-response.mock'
import { mockPhoneModel } from '@dx3/api-libs/phone/phone-api.postgres-model.mock'
import { mockAwsSdk } from '@dx3/api-libs/testing/mocks/external/aws-sdk.mock'
import { mockFormidable } from '@dx3/api-libs/testing/mocks/external/formidable.mock'
import { mockSendgrid } from '@dx3/api-libs/testing/mocks/external/sendgrid.mock'
import { mockSharp } from '@dx3/api-libs/testing/mocks/external/sharp.mock'
// Import all mock setup functions from libs
import {
  mockApiLoggingClass,
  mockPostgresDbConnection,
  mockRedisService,
  mockS3Service,
} from '@dx3/api-libs/testing/mocks/internal'
import { mockUserModel } from '@dx3/api-libs/user/user-api.postgres-model.mock'
import { mockUserProfileApi } from '@dx3/api-libs/user/user-profile-api.mock'

// App-specific mocks
import { mockRateLimiters } from '../../rate-limiters/rate-limiters.dx.mock'

/**
 * Initialize all mocks for api-app unit testing
 * Includes all libs mocks plus app-specific mocks
 */
export const setupAllMocks = () => {
  // External service mocks
  mockAwsSdk()
  mockFormidable()
  mockSendgrid()
  mockSharp()

  // Internal module mocks (previously in __mocks__ folders)
  mockApiLoggingClass()
  mockPostgresDbConnection()
  mockRedisService()
  mockS3Service()

  // Domain-specific mocks
  mockCookieService()
  mockEmailModel()
  mockHeaderService()
  mockHttpResponses()
  mockOtpCodeCache()
  mockPhoneModel()
  mockTokenService()
  mockUserModel()
  mockUserProfileApi()

  // App-specific mocks
  mockRateLimiters()
}

/**
 * Initialize only specific mocks
 * Useful for tests that need fine-grained control over mock state
 *
 * @param mocks - Array of mock names to initialize
 * @example
 * setupSelectiveMocks(['s3', 'redis', 'rateLimiters'])
 */
export const setupSelectiveMocks = (mocks: string[]) => {
  const mockMap: Record<string, () => void> = {
    // Note: 'config' is intentionally omitted - config service should not be mocked
    auth: mockTokenService,
    awsSdk: mockAwsSdk,
    database: mockUserModel,
    formidable: mockFormidable,
    logger: mockApiLoggingClass,
    otpCodeCache: mockOtpCodeCache,
    pg: mockPostgresDbConnection,
    rateLimiters: mockRateLimiters,
    redis: mockRedisService,
    s3: mockS3Service,
    sendgrid: mockSendgrid,
    sharp: mockSharp,
    userProfileApi: mockUserProfileApi,
  }

  mocks.forEach((mockName) => {
    const mockFn = mockMap[mockName]
    if (mockFn) {
      mockFn()
    } else {
      console.warn(`Mock "${mockName}" not found in mock registry`)
    }
  })
}
