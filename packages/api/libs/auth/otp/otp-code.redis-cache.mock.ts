/**
 * Mock for OtpCodeCache
 * Provides mocks for OTP code validation and storage
 */

// Mock OTP cache instance
const mockOtpCacheInstance = {
  setEmailOtp: jest.fn().mockResolvedValue('123456'),
  setPhoneOtp: jest.fn().mockResolvedValue('123456'),
  validateEmailOtp: jest.fn().mockResolvedValue(true),
  validatePhoneOtp: jest.fn().mockResolvedValue(true),
}

// Mock OTP cache
jest.mock('./otp-code.redis-cache', () => ({
  OtpCodeCache: jest.fn().mockImplementation(() => mockOtpCacheInstance),
}))

export const mockOtpCodeCache = () => {
  // OTP cache is already mocked at the top level
  // This function exists for consistency with other mock setup functions
}
