/**
 * Error Web Hooks Tests
 *
 * Unit tests for the frontend error handling React hooks.
 */

import { renderHook } from '@testing-library/react'

import { ERROR_CODES } from '@dx3/models-shared'

import { useApiError } from './error-web.hooks'

// Mock the i18n useTranslation hook
const mockTranslate = jest.fn((key: string, params?: Record<string, string | number>) => {
  const translations: Record<string, string> = {
    AUTH_FAILED: 'Authentication failed. Please try again.',
    AUTH_INVALID_CREDENTIALS: 'Invalid username or password.',
    GENERIC: 'An error occurred. Please try again.',
    MEDIA_FILE_SIZE_EXCEEDED: 'File too large. Maximum size is {max} MB.',
    USER_NOT_FOUND: 'User not found.',
  }

  let message = translations[key] || key

  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      message = message.replace(`{${paramKey}}`, String(value))
    })
  }

  return message
})

jest.mock('../../i18n', () => ({
  useTranslation: () => mockTranslate,
}))

describe('useApiError', () => {
  beforeEach(() => {
    mockTranslate.mockClear()
  })

  describe('hook initialization', () => {
    it('should return object with expected functions', () => {
      // act
      const { result } = renderHook(() => useApiError())

      // assert
      expect(result.current).toBeDefined()
      expect(typeof result.current.getErrorMessage).toBe('function')
      expect(typeof result.current.getI18nKey).toBe('function')
      expect(typeof result.current.resolveApiError).toBe('function')
    })

    it('should be stable across re-renders', () => {
      // act
      const { result, rerender } = renderHook(() => useApiError())
      const firstResult = result.current

      rerender()

      // assert
      expect(result.current.getErrorMessage).toBe(firstResult.getErrorMessage)
      expect(result.current.getI18nKey).toBe(firstResult.getI18nKey)
      expect(result.current.resolveApiError).toBe(firstResult.resolveApiError)
    })
  })

  describe('getErrorMessage', () => {
    it('should return localized message for valid error code', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const message = result.current.getErrorMessage(ERROR_CODES.AUTH_FAILED)

      // assert
      expect(message).toBe('Authentication failed. Please try again.')
      expect(mockTranslate).toHaveBeenCalledWith('AUTH_FAILED', undefined)
    })

    it('should return localized message for user error code', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const message = result.current.getErrorMessage(ERROR_CODES.USER_NOT_FOUND)

      // assert
      expect(message).toBe('User not found.')
    })

    it('should return fallback message for null code', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const message = result.current.getErrorMessage(null, 'Custom fallback')

      // assert
      expect(message).toBe('Custom fallback')
    })

    it('should return default error message when no fallback for null code', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const message = result.current.getErrorMessage(null)

      // assert
      expect(message).toBe('An error occurred. Please try again.')
    })

    it('should return fallback for invalid code format', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const message = result.current.getErrorMessage('invalid', 'Fallback')

      // assert
      expect(message).toBe('Fallback')
    })

    it('should apply interpolation parameters', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const message = result.current.getErrorMessage(
        ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED,
        undefined,
        { max: 50 },
      )

      // assert
      expect(message).toBe('File too large. Maximum size is 50 MB.')
      expect(mockTranslate).toHaveBeenCalledWith('MEDIA_FILE_SIZE_EXCEEDED', { max: 50 })
    })
  })

  describe('getI18nKey', () => {
    it('should return i18n key for valid error code', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const key = result.current.getI18nKey(ERROR_CODES.AUTH_FAILED)

      // assert
      expect(key).toBe('AUTH_FAILED')
    })

    it('should return i18n key for media error code', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const key = result.current.getI18nKey(ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED)

      // assert
      expect(key).toBe('MEDIA_FILE_SIZE_EXCEEDED')
    })

    it('should return null for null code', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const key = result.current.getI18nKey(null)

      // assert
      expect(key).toBeNull()
    })

    it('should return null for invalid code', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const key = result.current.getI18nKey('invalid')

      // assert
      expect(key).toBeNull()
    })

    it('should return null for empty string', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const key = result.current.getI18nKey('')

      // assert
      expect(key).toBeNull()
    })
  })

  describe('resolveApiError', () => {
    it('should parse and resolve error with code prefix', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const resolved = result.current.resolveApiError('100 Auth failed')

      // assert
      expect(resolved.code).toBe('100')
      expect(resolved.originalMessage).toBe('Auth failed')
      expect(resolved.localizedMessage).toBe('Authentication failed. Please try again.')
    })

    it('should handle error without code prefix', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const resolved = result.current.resolveApiError('Something went wrong')

      // assert
      expect(resolved.code).toBeNull()
      expect(resolved.originalMessage).toBe('Something went wrong')
      expect(resolved.localizedMessage).toBe('Something went wrong')
    })

    it('should apply interpolation params', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const resolved = result.current.resolveApiError('201 File exceeded', { max: 25 })

      // assert
      expect(resolved.code).toBe('201')
      expect(resolved.localizedMessage).toBe('File too large. Maximum size is 25 MB.')
    })

    it('should return original message when code not in mapping', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const resolved = result.current.resolveApiError('999 Unknown error')

      // assert
      expect(resolved.code).toBe('999')
      expect(resolved.originalMessage).toBe('Unknown error')
      expect(resolved.localizedMessage).toBe('Unknown error')
    })

    it('should parse authentication error codes', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const resolved = result.current.resolveApiError('101 Bad credentials')

      // assert
      expect(resolved.code).toBe('101')
      expect(resolved.localizedMessage).toBe('Invalid username or password.')
    })

    it('should parse user management error codes', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const resolved = result.current.resolveApiError('302 No user with that id')

      // assert
      expect(resolved.code).toBe('302')
      expect(resolved.localizedMessage).toBe('User not found.')
    })

    it('should handle empty error message', () => {
      // arrange
      const { result } = renderHook(() => useApiError())

      // act
      const resolved = result.current.resolveApiError('')

      // assert
      expect(resolved.code).toBeNull()
      expect(resolved.originalMessage).toBe('')
    })
  })
})
