/**
 * Error Shared Utils Tests
 *
 * Unit tests for API error building and parsing utilities.
 */

import type { ErrorCodeType } from './error-shared.types'
import { buildApiError, isValidErrorCode, parseApiError } from './error-shared.utils'

describe('error-shared.utils', () => {
  describe('buildApiError', () => {
    it('should build error message with code prefix', () => {
      // arrange
      const code: ErrorCodeType = '200'
      const message = 'File upload count exceeded.'

      // act
      const result = buildApiError(code, message)

      // assert
      expect(result).toBe('200 File upload count exceeded.')
    })

    it('should handle authentication error codes', () => {
      // arrange
      const code: ErrorCodeType = '100'
      const message = 'Authentication failed.'

      // act
      const result = buildApiError(code, message)

      // assert
      expect(result).toBe('100 Authentication failed.')
    })

    it('should handle user management error codes', () => {
      // arrange
      const code: ErrorCodeType = '302'
      const message = 'User not found.'

      // act
      const result = buildApiError(code, message)

      // assert
      expect(result).toBe('302 User not found.')
    })

    it('should handle generic error codes', () => {
      // arrange
      const code: ErrorCodeType = '903'
      const message = 'Server error occurred.'

      // act
      const result = buildApiError(code, message)

      // assert
      expect(result).toBe('903 Server error occurred.')
    })

    it('should handle empty message', () => {
      // arrange
      const code: ErrorCodeType = '100'
      const message = ''

      // act
      const result = buildApiError(code, message)

      // assert
      expect(result).toBe('100 ')
    })

    it('should handle message with special characters', () => {
      // arrange
      const code: ErrorCodeType = '201'
      const message = 'File size: 50MB exceeded (max: {max})'

      // act
      const result = buildApiError(code, message)

      // assert
      expect(result).toBe('201 File size: 50MB exceeded (max: {max})')
    })
  })

  describe('parseApiError', () => {
    it('should parse error message with code prefix', () => {
      // arrange
      const errorMessage = '200 File upload count exceeded.'

      // act
      const result = parseApiError(errorMessage)

      // assert
      expect(result.code).toBe('200')
      expect(result.message).toBe('File upload count exceeded.')
    })

    it('should parse authentication error', () => {
      // arrange
      const errorMessage = '101 Invalid username or password.'

      // act
      const result = parseApiError(errorMessage)

      // assert
      expect(result.code).toBe('101')
      expect(result.message).toBe('Invalid username or password.')
    })

    it('should return null code for message without code prefix', () => {
      // arrange
      const errorMessage = 'Something went wrong'

      // act
      const result = parseApiError(errorMessage)

      // assert
      expect(result.code).toBeNull()
      expect(result.message).toBe('Something went wrong')
    })

    it('should return empty values for empty string', () => {
      // arrange
      const errorMessage = ''

      // act
      const result = parseApiError(errorMessage)

      // assert
      expect(result.code).toBeNull()
      expect(result.message).toBe('')
    })

    it('should handle message with numbers that are not codes', () => {
      // arrange
      const errorMessage = 'Error in file 123.txt'

      // act
      const result = parseApiError(errorMessage)

      // assert
      expect(result.code).toBeNull()
      expect(result.message).toBe('Error in file 123.txt')
    })

    it('should handle four-digit numbers as non-codes', () => {
      // arrange
      const errorMessage = '1234 Some message'

      // act
      const result = parseApiError(errorMessage)

      // assert
      expect(result.code).toBeNull()
      expect(result.message).toBe('1234 Some message')
    })

    it('should handle two-digit numbers as non-codes', () => {
      // arrange
      const errorMessage = '12 Some message'

      // act
      const result = parseApiError(errorMessage)

      // assert
      expect(result.code).toBeNull()
      expect(result.message).toBe('12 Some message')
    })

    it('should parse message with multiple spaces after code', () => {
      // arrange
      // The regex uses \s+ which only matches a single space between code and message
      const errorMessage = '100  Double space message'

      // act
      const result = parseApiError(errorMessage)

      // assert
      // The regex captures everything after the first space, trimming the leading space
      expect(result.code).toBe('100')
      expect(result.message).toBe('Double space message')
    })

    it('should handle message with only code', () => {
      // arrange
      const errorMessage = '100 '

      // act
      const result = parseApiError(errorMessage)

      // assert
      expect(result.code).toBe('100')
      expect(result.message).toBe('')
    })
  })

  describe('isValidErrorCode', () => {
    it('should return true for valid three-digit code', () => {
      // act & assert
      expect(isValidErrorCode('100')).toBe(true)
      expect(isValidErrorCode('200')).toBe(true)
      expect(isValidErrorCode('903')).toBe(true)
    })

    it('should return false for null', () => {
      // act & assert
      expect(isValidErrorCode(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      // act & assert
      expect(isValidErrorCode(undefined)).toBe(false)
    })

    it('should return false for empty string', () => {
      // act & assert
      expect(isValidErrorCode('')).toBe(false)
    })

    it('should return false for two-digit code', () => {
      // act & assert
      expect(isValidErrorCode('10')).toBe(false)
    })

    it('should return false for four-digit code', () => {
      // act & assert
      expect(isValidErrorCode('1000')).toBe(false)
    })

    it('should return false for non-numeric string', () => {
      // act & assert
      expect(isValidErrorCode('abc')).toBe(false)
      expect(isValidErrorCode('1a2')).toBe(false)
    })

    it('should return false for code with spaces', () => {
      // act & assert
      expect(isValidErrorCode('10 0')).toBe(false)
      expect(isValidErrorCode(' 100')).toBe(false)
    })
  })

  describe('integration: buildApiError + parseApiError', () => {
    it('should parse what was built', () => {
      // arrange
      const code: ErrorCodeType = '201'
      const message = 'File too large. Maximum size is 50 MB.'
      const built = buildApiError(code, message)

      // act
      const parsed = parseApiError(built)

      // assert
      expect(parsed.code).toBe(code)
      expect(parsed.message).toBe(message)
    })

    it('should roundtrip all error code ranges', () => {
      // arrange
      const testCases: Array<{ code: ErrorCodeType; message: string }> = [
        { code: '100', message: 'Auth error' },
        { code: '200', message: 'Media error' },
        { code: '300', message: 'User error' },
        { code: '400', message: 'Email error' },
        { code: '500', message: 'Phone error' },
        { code: '600', message: 'Notification error' },
        { code: '900', message: 'Generic error' },
      ]

      // act & assert
      for (const { code, message } of testCases) {
        const built = buildApiError(code, message)
        const parsed = parseApiError(built)
        expect(parsed.code).toBe(code)
        expect(parsed.message).toBe(message)
      }
    })
  })
})
