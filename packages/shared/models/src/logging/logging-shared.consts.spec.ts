import {
  ADMIN_LOGS_SOCKET_NS,
  DEFAULT_LOG_LIMIT,
  LOG_EVENT_TYPE,
  LOG_EVENT_TYPE_ARRAY,
  LOG_RETENTION_DAYS,
  MAX_LOG_LIMIT,
  METRIC_EVENT_TYPE,
  METRIC_EVENT_TYPE_ARRAY,
  METRIC_FEATURE_NAME,
  REDACTED_VALUE,
} from './logging-shared.consts'

describe('LOG_EVENT_TYPE', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE).toBeDefined()
  })

  it('should have correct values for API events', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE.API_ERROR).toEqual('API_ERROR')
    expect(LOG_EVENT_TYPE.API_REQUEST).toEqual('API_REQUEST')
  })

  it('should have correct values for Auth events', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE.AUTH_FAILED).toEqual('AUTH_FAILED')
    expect(LOG_EVENT_TYPE.AUTH_LOGOUT).toEqual('AUTH_LOGOUT')
    expect(LOG_EVENT_TYPE.AUTH_OTP_SENT).toEqual('AUTH_OTP_SENT')
    expect(LOG_EVENT_TYPE.AUTH_OTP_VERIFIED).toEqual('AUTH_OTP_VERIFIED')
    expect(LOG_EVENT_TYPE.AUTH_SUCCESS).toEqual('AUTH_SUCCESS')
  })

  it('should have correct values for Cache events', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE.CACHE_HIT).toEqual('CACHE_HIT')
    expect(LOG_EVENT_TYPE.CACHE_MISS).toEqual('CACHE_MISS')
  })

  it('should have correct values for Database events', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE.DATABASE_ERROR).toEqual('DATABASE_ERROR')
    expect(LOG_EVENT_TYPE.DATABASE_QUERY).toEqual('DATABASE_QUERY')
  })

  it('should have correct values for Email events', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE.EMAIL_BOUNCED).toEqual('EMAIL_BOUNCED')
    expect(LOG_EVENT_TYPE.EMAIL_DELIVERED).toEqual('EMAIL_DELIVERED')
    expect(LOG_EVENT_TYPE.EMAIL_SENT).toEqual('EMAIL_SENT')
  })

  it('should have correct values for Feature Flag events', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE.FEATURE_FLAG_EVALUATED).toEqual('FEATURE_FLAG_EVALUATED')
    expect(LOG_EVENT_TYPE.FEATURE_FLAG_UPDATED).toEqual('FEATURE_FLAG_UPDATED')
  })

  it('should have correct values for Media events', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE.MEDIA_DELETED).toEqual('MEDIA_DELETED')
    expect(LOG_EVENT_TYPE.MEDIA_PROCESSED).toEqual('MEDIA_PROCESSED')
    expect(LOG_EVENT_TYPE.MEDIA_UPLOADED).toEqual('MEDIA_UPLOADED')
  })

  it('should have correct values for Metric events', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE.METRIC_FEATURE_USED).toEqual('METRIC_FEATURE_USED')
    expect(LOG_EVENT_TYPE.METRIC_LOGIN).toEqual('METRIC_LOGIN')
    expect(LOG_EVENT_TYPE.METRIC_LOGOUT).toEqual('METRIC_LOGOUT')
    expect(LOG_EVENT_TYPE.METRIC_PAGE_VIEW).toEqual('METRIC_PAGE_VIEW')
    expect(LOG_EVENT_TYPE.METRIC_SESSION_END).toEqual('METRIC_SESSION_END')
    expect(LOG_EVENT_TYPE.METRIC_SESSION_START).toEqual('METRIC_SESSION_START')
    expect(LOG_EVENT_TYPE.METRIC_SIGNUP).toEqual('METRIC_SIGNUP')
  })

  it('should have correct values for Notification events', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE.NOTIFICATION_READ).toEqual('NOTIFICATION_READ')
    expect(LOG_EVENT_TYPE.NOTIFICATION_SENT).toEqual('NOTIFICATION_SENT')
  })

  it('should have correct values for Rate Limit and Security events', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE.RATE_LIMIT_EXCEEDED).toEqual('RATE_LIMIT_EXCEEDED')
    expect(LOG_EVENT_TYPE.SECURITY_BLOCKED_IP).toEqual('SECURITY_BLOCKED_IP')
    expect(LOG_EVENT_TYPE.SECURITY_SUSPICIOUS_ACTIVITY).toEqual('SECURITY_SUSPICIOUS_ACTIVITY')
  })

  it('should have correct values for Support events', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE.SUPPORT_REQUEST_CLOSED).toEqual('SUPPORT_REQUEST_CLOSED')
    expect(LOG_EVENT_TYPE.SUPPORT_REQUEST_CREATED).toEqual('SUPPORT_REQUEST_CREATED')
    expect(LOG_EVENT_TYPE.SUPPORT_REQUEST_UPDATED).toEqual('SUPPORT_REQUEST_UPDATED')
  })

  it('should have correct values for System events', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE.SYSTEM_ERROR).toEqual('SYSTEM_ERROR')
    expect(LOG_EVENT_TYPE.SYSTEM_STARTUP).toEqual('SYSTEM_STARTUP')
  })

  it('should have correct values for User events', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE.USER_CREATED).toEqual('USER_CREATED')
    expect(LOG_EVENT_TYPE.USER_DELETED).toEqual('USER_DELETED')
    expect(LOG_EVENT_TYPE.USER_LOGIN).toEqual('USER_LOGIN')
    expect(LOG_EVENT_TYPE.USER_LOGOUT).toEqual('USER_LOGOUT')
    expect(LOG_EVENT_TYPE.USER_PROFILE_UPDATED).toEqual('USER_PROFILE_UPDATED')
    expect(LOG_EVENT_TYPE.USER_SIGNUP).toEqual('USER_SIGNUP')
  })

  it('should have exactly 42 event types', () => {
    // arrange
    // act
    // assert
    expect(Object.keys(LOG_EVENT_TYPE).length).toEqual(42)
  })
})

describe('LOG_EVENT_TYPE_ARRAY', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE_ARRAY).toBeDefined()
  })

  it('should contain known event type values', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE_ARRAY).toContain('API_ERROR')
    expect(LOG_EVENT_TYPE_ARRAY).toContain('AUTH_SUCCESS')
    expect(LOG_EVENT_TYPE_ARRAY).toContain('USER_CREATED')
    expect(LOG_EVENT_TYPE_ARRAY).toContain('SYSTEM_STARTUP')
  })

  it('should have length equal to the number of LOG_EVENT_TYPE entries', () => {
    // arrange
    // act
    // assert
    expect(LOG_EVENT_TYPE_ARRAY.length).toEqual(Object.values(LOG_EVENT_TYPE).length)
  })
})

describe('METRIC_EVENT_TYPE', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(METRIC_EVENT_TYPE).toBeDefined()
  })

  it('should have correct values for all metric event types', () => {
    // arrange
    // act
    // assert
    expect(METRIC_EVENT_TYPE.METRIC_FEATURE_USED).toEqual('METRIC_FEATURE_USED')
    expect(METRIC_EVENT_TYPE.METRIC_LOGIN).toEqual('METRIC_LOGIN')
    expect(METRIC_EVENT_TYPE.METRIC_LOGOUT).toEqual('METRIC_LOGOUT')
    expect(METRIC_EVENT_TYPE.METRIC_PAGE_VIEW).toEqual('METRIC_PAGE_VIEW')
    expect(METRIC_EVENT_TYPE.METRIC_SESSION_END).toEqual('METRIC_SESSION_END')
    expect(METRIC_EVENT_TYPE.METRIC_SESSION_START).toEqual('METRIC_SESSION_START')
    expect(METRIC_EVENT_TYPE.METRIC_SIGNUP).toEqual('METRIC_SIGNUP')
  })

  it('should have exactly 7 metric event types', () => {
    // arrange
    // act
    // assert
    expect(Object.keys(METRIC_EVENT_TYPE).length).toEqual(7)
  })

  it('should be a strict subset of LOG_EVENT_TYPE values', () => {
    // arrange
    const logEventTypeValues = Object.values(LOG_EVENT_TYPE)
    // act
    const metricValues = Object.values(METRIC_EVENT_TYPE)
    // assert
    for (const value of metricValues) {
      expect(logEventTypeValues).toContain(value)
    }
  })
})

describe('METRIC_EVENT_TYPE_ARRAY', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(METRIC_EVENT_TYPE_ARRAY).toBeDefined()
  })

  it('should contain all metric event type values', () => {
    // arrange
    // act
    // assert
    expect(METRIC_EVENT_TYPE_ARRAY).toContain('METRIC_FEATURE_USED')
    expect(METRIC_EVENT_TYPE_ARRAY).toContain('METRIC_LOGIN')
    expect(METRIC_EVENT_TYPE_ARRAY).toContain('METRIC_LOGOUT')
    expect(METRIC_EVENT_TYPE_ARRAY).toContain('METRIC_PAGE_VIEW')
    expect(METRIC_EVENT_TYPE_ARRAY).toContain('METRIC_SESSION_END')
    expect(METRIC_EVENT_TYPE_ARRAY).toContain('METRIC_SESSION_START')
    expect(METRIC_EVENT_TYPE_ARRAY).toContain('METRIC_SIGNUP')
  })

  it('should have length equal to number of METRIC_EVENT_TYPE entries', () => {
    // arrange
    // act
    // assert
    expect(METRIC_EVENT_TYPE_ARRAY.length).toEqual(Object.values(METRIC_EVENT_TYPE).length)
  })
})

describe('METRIC_FEATURE_NAME', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(METRIC_FEATURE_NAME).toBeDefined()
  })

  it('should have correct values for all feature names', () => {
    // arrange
    // act
    // assert
    expect(METRIC_FEATURE_NAME.EMAIL_SENT).toEqual('email_sent')
    expect(METRIC_FEATURE_NAME.MEDIA_UPLOAD).toEqual('media_upload')
    expect(METRIC_FEATURE_NAME.PROFILE_UPDATE).toEqual('profile_update')
    expect(METRIC_FEATURE_NAME.SMS_SENT).toEqual('sms_sent')
    expect(METRIC_FEATURE_NAME.SUPPORT_REQUEST_CREATED).toEqual('support_request_created')
  })

  it('should have exactly 5 feature names', () => {
    // arrange
    // act
    // assert
    expect(Object.keys(METRIC_FEATURE_NAME).length).toEqual(5)
  })

  it('should use snake_case values', () => {
    // arrange
    const snakeCasePattern = /^[a-z]+(_[a-z]+)*$/
    // act
    const values = Object.values(METRIC_FEATURE_NAME)
    // assert
    for (const value of values) {
      expect(value).toMatch(snakeCasePattern)
    }
  })
})

describe('ADMIN_LOGS_SOCKET_NS', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(ADMIN_LOGS_SOCKET_NS).toBeDefined()
  })

  it('should have the correct namespace value', () => {
    // arrange
    // act
    // assert
    expect(ADMIN_LOGS_SOCKET_NS).toEqual('/admin-logs')
  })
})

describe('DEFAULT_LOG_LIMIT', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(DEFAULT_LOG_LIMIT).toBeDefined()
  })

  it('should have the correct value of 100', () => {
    // arrange
    // act
    // assert
    expect(DEFAULT_LOG_LIMIT).toEqual(100)
  })

  it('should be less than MAX_LOG_LIMIT', () => {
    // arrange
    // act
    // assert
    expect(DEFAULT_LOG_LIMIT).toBeLessThan(MAX_LOG_LIMIT)
  })
})

describe('MAX_LOG_LIMIT', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(MAX_LOG_LIMIT).toBeDefined()
  })

  it('should have the correct value of 1000', () => {
    // arrange
    // act
    // assert
    expect(MAX_LOG_LIMIT).toEqual(1000)
  })
})

describe('REDACTED_VALUE', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(REDACTED_VALUE).toBeDefined()
  })

  it('should have the correct redaction string', () => {
    // arrange
    // act
    // assert
    expect(REDACTED_VALUE).toEqual('[REDACTED]')
  })
})

describe('LOG_RETENTION_DAYS', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(LOG_RETENTION_DAYS).toBeDefined()
  })

  it('should have the correct value of 90 days', () => {
    // arrange
    // act
    // assert
    expect(LOG_RETENTION_DAYS).toEqual(90)
  })
})
