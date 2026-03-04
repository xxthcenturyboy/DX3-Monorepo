import { ERROR_CODE_TO_I18N_KEY, ERROR_CODES } from './error-shared.consts'

describe('ERROR_CODES', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(ERROR_CODES).toBeDefined()
  })

  describe('Authentication codes (100-199)', () => {
    it('should have correct values for all auth error codes', () => {
      // arrange
      // act
      // assert
      expect(ERROR_CODES.AUTH_FAILED).toEqual('100')
      expect(ERROR_CODES.AUTH_INVALID_CREDENTIALS).toEqual('101')
      expect(ERROR_CODES.AUTH_OTP_EXPIRED).toEqual('102')
      expect(ERROR_CODES.AUTH_OTP_INVALID).toEqual('103')
      expect(ERROR_CODES.AUTH_SESSION_EXPIRED).toEqual('104')
      expect(ERROR_CODES.AUTH_TOKEN_INVALID).toEqual('105')
      expect(ERROR_CODES.AUTH_UNAUTHORIZED).toEqual('106')
      expect(ERROR_CODES.AUTH_INCOMPLETE_BIOMETRIC).toEqual('107')
      expect(ERROR_CODES.AUTH_INVALID_BIOMETRIC).toEqual('108')
      expect(ERROR_CODES.AUTH_SIGNUP_FAILED).toEqual('109')
      expect(ERROR_CODES.AUTH_SIGNUP_BAD_PHONE_TYPE).toEqual('110')
    })

    it('should have all auth codes in the 100-199 range', () => {
      // arrange
      const authKeys = Object.keys(ERROR_CODES).filter((k) => k.startsWith('AUTH_'))
      // act
      // assert
      for (const key of authKeys) {
        const code = Number(ERROR_CODES[key as keyof typeof ERROR_CODES])
        expect(code).toBeGreaterThanOrEqual(100)
        expect(code).toBeLessThanOrEqual(199)
      }
    })
  })

  describe('Media/Upload codes (200-299)', () => {
    it('should have correct values for all media error codes', () => {
      // arrange
      // act
      // assert
      expect(ERROR_CODES.MEDIA_FILE_COUNT_EXCEEDED).toEqual('200')
      expect(ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED).toEqual('201')
      expect(ERROR_CODES.MEDIA_INVALID_TYPE).toEqual('202')
      expect(ERROR_CODES.MEDIA_UPLOAD_FAILED).toEqual('203')
    })
  })

  describe('User Management codes (300-399)', () => {
    it('should have correct values for all user management error codes', () => {
      // arrange
      // act
      // assert
      expect(ERROR_CODES.USER_ALREADY_EXISTS).toEqual('300')
      expect(ERROR_CODES.USER_CREATE_FAILED).toEqual('301')
      expect(ERROR_CODES.USER_NOT_FOUND).toEqual('302')
      expect(ERROR_CODES.USER_UPDATE_FAILED).toEqual('303')
      expect(ERROR_CODES.USER_PROFANE_USERNAMES_NOT_ALLOWED).toEqual('304')
      expect(ERROR_CODES.USER_USERNAME_UNAVAILABLE).toEqual('305')
      expect(ERROR_CODES.USER_ACCOUNT_NOT_SECURED).toEqual('306')
    })
  })

  describe('Email codes (400-499)', () => {
    it('should have correct values for all email error codes', () => {
      // arrange
      // act
      // assert
      expect(ERROR_CODES.EMAIL_ALREADY_EXISTS).toEqual('400')
      expect(ERROR_CODES.EMAIL_DELETE_FAILED).toEqual('401')
      expect(ERROR_CODES.EMAIL_INVALID).toEqual('402')
      expect(ERROR_CODES.EMAIL_NOT_FOUND).toEqual('403')
      expect(ERROR_CODES.EMAIL_SEND_FAILED).toEqual('404')
      expect(ERROR_CODES.EMAIL_VERIFICATION_FAILED).toEqual('405')
    })
  })

  describe('Phone codes (500-599)', () => {
    it('should have correct values for all phone error codes', () => {
      // arrange
      // act
      // assert
      expect(ERROR_CODES.PHONE_ALREADY_EXISTS).toEqual('500')
      expect(ERROR_CODES.PHONE_DELETE_FAILED).toEqual('501')
      expect(ERROR_CODES.PHONE_INVALID).toEqual('502')
      expect(ERROR_CODES.PHONE_NOT_FOUND).toEqual('503')
      expect(ERROR_CODES.PHONE_VERIFICATION_FAILED).toEqual('504')
    })
  })

  describe('Notification codes (600-699)', () => {
    it('should have correct values for all notification error codes', () => {
      // arrange
      // act
      // assert
      expect(ERROR_CODES.NOTIFICATION_CREATE_FAILED).toEqual('600')
      expect(ERROR_CODES.NOTIFICATION_MISSING_PARAMS).toEqual('601')
      expect(ERROR_CODES.NOTIFICATION_MISSING_USER_ID).toEqual('602')
      expect(ERROR_CODES.NOTIFICATION_SERVER_ERROR).toEqual('603')
    })
  })

  describe('Feature Flag codes (700-799)', () => {
    it('should have correct values for all feature flag error codes', () => {
      // arrange
      // act
      // assert
      expect(ERROR_CODES.FEATURE_FLAG_CREATE_FAILED).toEqual('700')
      expect(ERROR_CODES.FEATURE_FLAG_DISABLED).toEqual('701')
      expect(ERROR_CODES.FEATURE_FLAG_EVALUATION_ERROR).toEqual('702')
      expect(ERROR_CODES.FEATURE_FLAG_NOT_FOUND).toEqual('703')
      expect(ERROR_CODES.FEATURE_FLAG_UPDATE_FAILED).toEqual('704')
    })
  })

  describe('Generic/System codes (900-999)', () => {
    it('should have correct values for all generic error codes', () => {
      // arrange
      // act
      // assert
      expect(ERROR_CODES.GENERIC_BAD_REQUEST).toEqual('900')
      expect(ERROR_CODES.GENERIC_FORBIDDEN).toEqual('901')
      expect(ERROR_CODES.GENERIC_NOT_FOUND).toEqual('902')
      expect(ERROR_CODES.GENERIC_SERVER_ERROR).toEqual('903')
      expect(ERROR_CODES.GENERIC_VALIDATION_FAILED).toEqual('904')
    })
  })

  it('should have all codes as 3-digit numeric strings', () => {
    // arrange
    const threeDigitPattern = /^\d{3}$/
    // act
    const values = Object.values(ERROR_CODES)
    // assert
    for (const value of values) {
      expect(value).toMatch(threeDigitPattern)
    }
  })

  it('should have no duplicate error code values', () => {
    // arrange
    const values = Object.values(ERROR_CODES)
    // act
    const uniqueValues = new Set(values)
    // assert
    expect(uniqueValues.size).toEqual(values.length)
  })
})

describe('ERROR_CODE_TO_I18N_KEY', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(ERROR_CODE_TO_I18N_KEY).toBeDefined()
  })

  it('should have an i18n key entry for every ERROR_CODES value', () => {
    // arrange
    const allCodes = Object.values(ERROR_CODES)
    // act
    // assert
    for (const code of allCodes) {
      expect(ERROR_CODE_TO_I18N_KEY[code]).toBeDefined()
    }
  })

  it('should map auth error codes to correct i18n keys', () => {
    // arrange
    // act
    // assert
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.AUTH_FAILED]).toEqual('AUTH_FAILED')
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.AUTH_INVALID_CREDENTIALS]).toEqual(
      'AUTH_INVALID_CREDENTIALS',
    )
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.AUTH_UNAUTHORIZED]).toEqual('AUTH_UNAUTHORIZED')
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.AUTH_INCOMPLETE_BIOMETRIC]).toEqual(
      'AUTH_INCOMPLETE_BIOMETRIC',
    )
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.AUTH_INVALID_BIOMETRIC]).toEqual(
      'AUTH_INVALID_BIOMETRIC',
    )
  })

  it('should map user management error codes to correct i18n keys', () => {
    // arrange
    // act
    // assert
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.USER_ALREADY_EXISTS]).toEqual('USER_ALREADY_EXISTS')
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.USER_NOT_FOUND]).toEqual('USER_NOT_FOUND')
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.USER_USERNAME_UNAVAILABLE]).toEqual(
      'USER_USERNAME_UNAVAILABLE',
    )
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.USER_ACCOUNT_NOT_SECURED]).toEqual(
      'USER_ACCOUNT_NOT_SECURED',
    )
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.USER_PROFANE_USERNAMES_NOT_ALLOWED]).toEqual(
      'USER_PROFANE_USERNAMES_NOT_ALLOWED',
    )
  })

  it('should map media error codes to correct i18n keys', () => {
    // arrange
    // act
    // assert
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.MEDIA_FILE_COUNT_EXCEEDED]).toEqual(
      'MEDIA_FILE_COUNT_EXCEEDED',
    )
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.MEDIA_UPLOAD_FAILED]).toEqual('MEDIA_UPLOAD_FAILED')
  })

  it('should map generic error codes to correct i18n keys', () => {
    // arrange
    // act
    // assert
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.GENERIC_BAD_REQUEST]).toEqual('GENERIC_BAD_REQUEST')
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.GENERIC_SERVER_ERROR]).toEqual('GENERIC_SERVER_ERROR')
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.GENERIC_NOT_FOUND]).toEqual('GENERIC_NOT_FOUND')
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.GENERIC_FORBIDDEN]).toEqual('GENERIC_FORBIDDEN')
    expect(ERROR_CODE_TO_I18N_KEY[ERROR_CODES.GENERIC_VALIDATION_FAILED]).toEqual(
      'GENERIC_VALIDATION_FAILED',
    )
  })

  it('should have i18n key values that match the ERROR_CODES key names', () => {
    // arrange — the convention is that the i18n key mirrors the ERROR_CODES constant name
    const codesToKeys = Object.entries(ERROR_CODES) as [keyof typeof ERROR_CODES, string][]
    // act
    // assert
    for (const [keyName, codeValue] of codesToKeys) {
      expect(ERROR_CODE_TO_I18N_KEY[codeValue]).toEqual(keyName)
    }
  })

  it('should return undefined for an unknown error code', () => {
    // arrange
    // act
    // assert
    expect(ERROR_CODE_TO_I18N_KEY['999']).toBeUndefined()
  })
})
