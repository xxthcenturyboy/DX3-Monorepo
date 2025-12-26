/**
 * API Error Utils Tests
 *
 * Unit tests for API error creation utilities.
 */

import { ERROR_CODES } from '@dx3/models-shared'

import { createApiError, createApiErrorMessage } from './api-error.utils'

describe('api-error.utils', () => {
  describe('createApiError', () => {
    it('should create an Error object with formatted message', () => {
      // arrange
      const code = ERROR_CODES.AUTH_FAILED
      const message = 'Authentication failed.'

      // act
      const error = createApiError(code, message)

      // assert
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('100 Authentication failed.')
    })

    it('should create throwable error', () => {
      // arrange
      const code = ERROR_CODES.USER_NOT_FOUND
      const message = 'User not found.'

      // act & assert
      expect(() => {
        throw createApiError(code, message)
      }).toThrow('302 User not found.')
    })

    it('should work with media error codes', () => {
      // arrange
      const code = ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED
      const message = 'File too large. Maximum size is 50 MB.'

      // act
      const error = createApiError(code, message)

      // assert
      expect(error.message).toBe('201 File too large. Maximum size is 50 MB.')
    })

    it('should work with email error codes', () => {
      // arrange
      const code = ERROR_CODES.EMAIL_ALREADY_EXISTS
      const message = 'test@example.com already exists.'

      // act
      const error = createApiError(code, message)

      // assert
      expect(error.message).toBe('400 test@example.com already exists.')
    })

    it('should work with phone error codes', () => {
      // arrange
      const code = ERROR_CODES.PHONE_INVALID
      const message = 'This phone cannot be used.'

      // act
      const error = createApiError(code, message)

      // assert
      expect(error.message).toBe('502 This phone cannot be used.')
    })

    it('should work with generic error codes', () => {
      // arrange
      const code = ERROR_CODES.GENERIC_SERVER_ERROR
      const message = 'Internal server error.'

      // act
      const error = createApiError(code, message)

      // assert
      expect(error.message).toBe('903 Internal server error.')
    })

    it('should preserve error stack trace', () => {
      // arrange
      const code = ERROR_CODES.AUTH_FAILED
      const message = 'Test error'

      // act
      const error = createApiError(code, message)

      // assert
      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('api-error.utils')
    })
  })

  describe('createApiErrorMessage', () => {
    it('should create formatted message string', () => {
      // arrange
      const code = ERROR_CODES.AUTH_INVALID_CREDENTIALS
      const message = 'Invalid username or password.'

      // act
      const result = createApiErrorMessage(code, message)

      // assert
      expect(result).toBe('101 Invalid username or password.')
    })

    it('should return string type', () => {
      // arrange
      const code = ERROR_CODES.AUTH_FAILED
      const message = 'Test'

      // act
      const result = createApiErrorMessage(code, message)

      // assert
      expect(typeof result).toBe('string')
    })

    it('should work with notification error codes', () => {
      // arrange
      const code = ERROR_CODES.NOTIFICATION_CREATE_FAILED
      const message = 'Failed to create notification.'

      // act
      const result = createApiErrorMessage(code, message)

      // assert
      expect(result).toBe('600 Failed to create notification.')
    })

    it('should handle empty message', () => {
      // arrange
      const code = ERROR_CODES.GENERIC_BAD_REQUEST
      const message = ''

      // act
      const result = createApiErrorMessage(code, message)

      // assert
      expect(result).toBe('900 ')
    })

    it('should handle message with interpolation placeholders', () => {
      // arrange
      const code = ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED
      const message = 'File too large. Maximum size is {max} MB.'

      // act
      const result = createApiErrorMessage(code, message)

      // assert
      expect(result).toBe('201 File too large. Maximum size is {max} MB.')
    })
  })

  describe('ERROR_CODES re-export', () => {
    it('should export ERROR_CODES', () => {
      // assert
      expect(ERROR_CODES).toBeDefined()
      expect(ERROR_CODES.AUTH_FAILED).toBe('100')
      expect(ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED).toBe('201')
      expect(ERROR_CODES.USER_NOT_FOUND).toBe('302')
    })
  })
})
