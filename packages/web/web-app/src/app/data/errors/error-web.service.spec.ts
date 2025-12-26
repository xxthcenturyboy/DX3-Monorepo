/**
 * Error Web Service Tests
 *
 * Unit tests for the frontend error resolution service.
 */

import { ERROR_CODES } from '@dx3/models-shared'

import { DEFAULT_STRINGS } from '../../i18n'
import { ErrorWebService } from './error-web.service'

describe('ErrorWebService', () => {
  describe('getI18nKey', () => {
    it('should return i18n key for valid error code', () => {
      // act
      const result = ErrorWebService.getI18nKey(ERROR_CODES.AUTH_FAILED)

      // assert
      expect(result).toBe('AUTH_FAILED')
    })

    it('should return i18n key for media error code', () => {
      // act
      const result = ErrorWebService.getI18nKey(ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED)

      // assert
      expect(result).toBe('MEDIA_FILE_SIZE_EXCEEDED')
    })

    it('should return i18n key for user error code', () => {
      // act
      const result = ErrorWebService.getI18nKey(ERROR_CODES.USER_NOT_FOUND)

      // assert
      expect(result).toBe('USER_NOT_FOUND')
    })

    it('should return null for null code', () => {
      // act
      const result = ErrorWebService.getI18nKey(null)

      // assert
      expect(result).toBeNull()
    })

    it('should return null for empty string', () => {
      // act
      const result = ErrorWebService.getI18nKey('')

      // assert
      expect(result).toBeNull()
    })

    it('should return null for invalid code format', () => {
      // act
      const result = ErrorWebService.getI18nKey('invalid')

      // assert
      expect(result).toBeNull()
    })

    it('should return null for two-digit code', () => {
      // act
      const result = ErrorWebService.getI18nKey('10')

      // assert
      expect(result).toBeNull()
    })
  })

  describe('getLocalizedMessage', () => {
    it('should return localized message for valid code from DEFAULT_STRINGS', () => {
      // act
      const result = ErrorWebService.getLocalizedMessage(ERROR_CODES.AUTH_FAILED)

      // assert
      expect(result).toBe(DEFAULT_STRINGS.AUTH_FAILED)
    })

    it('should return localized message for user error from DEFAULT_STRINGS', () => {
      // act
      const result = ErrorWebService.getLocalizedMessage(ERROR_CODES.USER_NOT_FOUND)

      // assert
      expect(result).toBe(DEFAULT_STRINGS.USER_NOT_FOUND)
    })

    it('should return fallback message for null code', () => {
      // act
      const result = ErrorWebService.getLocalizedMessage(null, 'Custom fallback')

      // assert
      expect(result).toBe('Custom fallback')
    })

    it('should return default error message when no fallback provided for null code', () => {
      // act
      const result = ErrorWebService.getLocalizedMessage(null)

      // assert
      expect(result).toBe('An error occurred. Please try again.')
    })

    it('should return fallback for invalid code', () => {
      // act
      const result = ErrorWebService.getLocalizedMessage('invalid', 'Fallback message')

      // assert
      expect(result).toBe('Fallback message')
    })

    it('should apply interpolation parameters', () => {
      // act
      const result = ErrorWebService.getLocalizedMessage(
        ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED,
        undefined,
        { max: 50 },
      )

      // assert
      expect(result).toBe('File too large. Maximum size is 50 MB.')
    })

    it('should preserve placeholder if param not provided', () => {
      // act
      const result = ErrorWebService.getLocalizedMessage(
        ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED,
        undefined,
        {},
      )

      // assert
      expect(result).toBe('File too large. Maximum size is {max} MB.')
    })

    it('should handle string interpolation values', () => {
      // act
      const result = ErrorWebService.getLocalizedMessage(
        ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED,
        undefined,
        { max: '100' },
      )

      // assert
      expect(result).toBe('File too large. Maximum size is 100 MB.')
    })
  })

  describe('resolveApiError', () => {
    it('should parse and resolve error with code prefix', () => {
      // arrange
      const errorMessage = '100 Auth failed'

      // act
      const result = ErrorWebService.resolveApiError(errorMessage)

      // assert
      expect(result.code).toBe('100')
      expect(result.originalMessage).toBe('Auth failed')
      expect(result.localizedMessage).toBe(DEFAULT_STRINGS.AUTH_FAILED)
    })

    it('should handle error without code prefix', () => {
      // arrange
      const errorMessage = 'Something went wrong'

      // act
      const result = ErrorWebService.resolveApiError(errorMessage)

      // assert
      expect(result.code).toBeNull()
      expect(result.originalMessage).toBe('Something went wrong')
      expect(result.localizedMessage).toBe('Something went wrong')
    })

    it('should apply interpolation params', () => {
      // arrange
      const errorMessage = '201 File exceeded limit'

      // act
      const result = ErrorWebService.resolveApiError(errorMessage, { max: 25 })

      // assert
      expect(result.code).toBe('201')
      expect(result.localizedMessage).toBe('File too large. Maximum size is 25 MB.')
    })

    it('should return original message as fallback when code not mapped', () => {
      // arrange
      const errorMessage = '999 Unknown error type'

      // act
      const result = ErrorWebService.resolveApiError(errorMessage)

      // assert
      expect(result.code).toBe('999')
      expect(result.originalMessage).toBe('Unknown error type')
      expect(result.localizedMessage).toBe('Unknown error type')
    })

    it('should handle empty error message', () => {
      // arrange
      const errorMessage = ''

      // act
      const result = ErrorWebService.resolveApiError(errorMessage)

      // assert
      // Empty message falls back to default error message
      expect(result.code).toBeNull()
      expect(result.originalMessage).toBe('')
      expect(result.localizedMessage).toBe('An error occurred. Please try again.')
    })

    it('should parse user management error codes', () => {
      // arrange
      const errorMessage = '302 No user found with that id'

      // act
      const result = ErrorWebService.resolveApiError(errorMessage)

      // assert
      expect(result.code).toBe('302')
      expect(result.localizedMessage).toBe(DEFAULT_STRINGS.USER_NOT_FOUND)
    })

    it('should parse authentication error codes', () => {
      // arrange
      const errorMessage = '101 Bad credentials'

      // act
      const result = ErrorWebService.resolveApiError(errorMessage)

      // assert
      expect(result.code).toBe('101')
      expect(result.localizedMessage).toBe(DEFAULT_STRINGS.AUTH_INVALID_CREDENTIALS)
    })
  })

  describe('integration with DEFAULT_STRINGS', () => {
    it('should have access to DEFAULT_STRINGS', () => {
      // assert
      expect(DEFAULT_STRINGS).toBeDefined()
      expect(DEFAULT_STRINGS.AUTH_FAILED).toBeDefined()
    })
  })
})
