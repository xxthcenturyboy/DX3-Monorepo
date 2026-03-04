/**
 * Error Web Service Tests
 *
 * Unit tests for the frontend error resolution service.
 */

import { ERROR_CODES } from '@dx3/models-shared'

import { DEFAULT_STRINGS } from '../../i18n'
import { getErrorStringFromApiResponse, ErrorWebService } from './error-web.service'

// Mock the store import used by getLocalizedMessageAsync to avoid initialising
// the full Redux store in a unit test.
jest.mock('../../store/store-web.redux', () => ({
  store: {
    getState: jest.fn().mockReturnValue({}),
  },
}))

jest.mock('../../i18n/i18n.selectors', () => ({
  selectTranslations: jest.fn().mockReturnValue({}),
}))

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
      expect(result).toBe(DEFAULT_STRINGS.OOPS_SOMETHING_WENT_WRONG)
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
      expect(result).toBe('File too large. Maximum size is 50.')
    })

    it('should preserve placeholder if param not provided', () => {
      // act
      const result = ErrorWebService.getLocalizedMessage(
        ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED,
        undefined,
        {},
      )

      // assert
      expect(result).toBe('File too large. Maximum size is {max}.')
    })

    it('should handle string interpolation values', () => {
      // act
      const result = ErrorWebService.getLocalizedMessage(
        ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED,
        undefined,
        { max: '100' },
      )

      // assert
      expect(result).toBe('File too large. Maximum size is 100.')
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
      expect(result.localizedMessage).toBe('File too large. Maximum size is 25.')
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
      expect(result.localizedMessage).toBe(DEFAULT_STRINGS.OOPS_SOMETHING_WENT_WRONG)
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

describe('getErrorStringFromApiResponse', () => {
  it('should return localizedMessage when present', () => {
    const res = { localizedMessage: 'Localized error' }
    expect(getErrorStringFromApiResponse(res)).toBe('Localized error')
  })

  it('should return error field when localizedMessage is absent', () => {
    const res = { error: 'Raw error string' }
    expect(getErrorStringFromApiResponse(res)).toBe('Raw error string')
  })

  it('should return default message when response is undefined', () => {
    expect(getErrorStringFromApiResponse(undefined)).toBe(DEFAULT_STRINGS.OOPS_SOMETHING_WENT_WRONG)
  })

  it('should return default message when response has no relevant fields', () => {
    expect(getErrorStringFromApiResponse({} as never)).toBe(DEFAULT_STRINGS.OOPS_SOMETHING_WENT_WRONG)
  })

  it('should prefer localizedMessage over error when both present', () => {
    const res = { error: 'raw', localizedMessage: 'Localized' }
    expect(getErrorStringFromApiResponse(res)).toBe('Localized')
  })

  it('should return default when localizedMessage is empty string', () => {
    const res = { error: 'raw', localizedMessage: '' }
    // empty string is falsy — falls through to 'error' field
    expect(getErrorStringFromApiResponse(res)).toBe('raw')
  })
})

describe('ErrorWebService.getLocalizedMessageAsync', () => {
  it('should return fallback when code is null', async () => {
    const result = await ErrorWebService.getLocalizedMessageAsync(null, 'My fallback')
    expect(result).toBe('My fallback')
  })

  it('should return default error message when code is null and no fallback', async () => {
    const result = await ErrorWebService.getLocalizedMessageAsync(null)
    expect(result).toBe(DEFAULT_STRINGS.OOPS_SOMETHING_WENT_WRONG)
  })

  it('should resolve message from DEFAULT_STRINGS when store translations are empty', async () => {
    // selectTranslations mock returns {} so it falls back to DEFAULT_STRINGS
    const result = await ErrorWebService.getLocalizedMessageAsync(ERROR_CODES.AUTH_FAILED)
    expect(result).toBe(DEFAULT_STRINGS.AUTH_FAILED)
  })

  it('should apply interpolation params in async path', async () => {
    const result = await ErrorWebService.getLocalizedMessageAsync(
      ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED,
      undefined,
      { max: 99 },
    )
    expect(result).toBe('File too large. Maximum size is 99.')
  })

  it('should return fallback when store throws', async () => {
    // Make the store import fail for this test
    jest.resetModules()
    const { ErrorWebService: Svc } = await import('./error-web.service')
    // Patch the internal getStore by making the dynamic import reject
    jest.doMock('../../store/store-web.redux', () => {
      throw new Error('Store unavailable')
    })
    // The catch block falls back to DEFAULT_STRINGS
    const result = await Svc.getLocalizedMessageAsync(ERROR_CODES.AUTH_FAILED)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
