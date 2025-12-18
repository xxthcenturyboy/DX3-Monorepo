/**
 * Centralized mock exports for all API tests
 *
 * This module consolidates all mocks into a single location, eliminating
 * the need for scattered __mocks__ folders and preventing jest-haste-map
 * duplicate mock warnings.
 */

// Domain-specific mocks (scattered .mock.ts files in libs)
export * from '../../mail/mail-api-sendgrid.mock'
export * from '../../user/user-api.postgres-model.mock'
// External service mocks (third-party packages)
export * from './external/aws-sdk.mock'
export * from './external/formidable.mock'
export * from './external/sharp.mock'
// Internal module mocks (libs modules that were previously in __mocks__ folders)
export * from './internal'

// Import all mock setup functions
import { mockOtpCodeCache } from '../../auth/otp/otp-code.redis-cache.mock'
import { mockTokenService } from '../../auth/tokens/token.service.mock'
import { mockCookieService } from '../../cookies/cookie.service.mock'
import { mockEmailModel } from '../../email/email-api.postgres-model.mock'
import { mockHeaderService } from '../../headers/header.service.mock'
import { mockHttpResponses } from '../../http-response/http-response.mock'
import { mockPhoneModel } from '../../phone/phone-api.postgres-model.mock'
import { mockUserModel } from '../../user/user-api.postgres-model.mock'
import { mockUserProfileApi } from '../../user/user-profile-api.mock'
import { mockAwsSdk } from './external/aws-sdk.mock'
import { mockFormidable } from './external/formidable.mock'
import { mockSendgrid } from './external/sendgrid.mock'
import { mockSharp } from './external/sharp.mock'
import {
  mockApiLoggingClass,
  mockPostgresDbConnection,
  mockRedisService,
  mockS3Service,
} from './internal'

/**
 * Initialize all mocks for unit testing
 * Call this in setupFilesAfterEnv to ensure all mocks are available
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
}

/**
 * Initialize only specific mocks
 * Useful for tests that need fine-grained control over mock state
 *
 * @param mocks - Array of mock names to initialize
 * @example
 * setupSelectiveMocks(['s3', 'redis', 'logger'])
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
