import {
  allowedCorsOrigins,
  allowsDevFallbacks,
  getEnvironment,
  isDebug,
  isDev,
  isProd,
  isStaging,
  isTest,
  webDomain,
  webUrl,
} from './config-api.service'

describe('getEnvironment', () => {
  it('should exist when imported', () => {
    expect(getEnvironment).toBeDefined()
  })

  it('should return a copy of process.env', () => {
    // arrange
    // act
    const env = getEnvironment()
    // assert
    expect(env).toBeDefined()
    expect(typeof env).toBe('object')
  })
})

describe('isDev', () => {
  it('should exist when imported', () => {
    expect(isDev).toBeDefined()
  })

  it('should return true when NODE_ENV is development', () => {
    // arrange
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    // act
    const result = isDev()
    // assert
    expect(result).toBe(true)
    // cleanup
    process.env.NODE_ENV = originalEnv
  })

  it('should return false when NODE_ENV is test', () => {
    // arrange
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'test'
    // act
    const result = isDev()
    // assert
    expect(result).toBe(false)
    // cleanup
    process.env.NODE_ENV = originalEnv
  })
})

describe('isTest', () => {
  it('should exist when imported', () => {
    expect(isTest).toBeDefined()
  })

  it('should return true when NODE_ENV is test', () => {
    // arrange
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'test'
    // act
    const result = isTest()
    // assert
    expect(result).toBe(true)
    // cleanup
    process.env.NODE_ENV = originalEnv
  })

  it('should return false when NODE_ENV is production', () => {
    // arrange
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    // act
    const result = isTest()
    // assert
    expect(result).toBe(false)
    // cleanup
    process.env.NODE_ENV = originalEnv
  })
})

describe('isProd', () => {
  it('should exist when imported', () => {
    expect(isProd).toBeDefined()
  })

  it('should return true when NODE_ENV is production', () => {
    // arrange
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    // act
    const result = isProd()
    // assert
    expect(result).toBe(true)
    // cleanup
    process.env.NODE_ENV = originalEnv
  })

  it('should return false in test environment', () => {
    // arrange (NODE_ENV is already "test" in Jest)
    // act
    const result = isProd()
    // assert
    expect(result).toBe(false)
  })
})

describe('isStaging', () => {
  it('should exist when imported', () => {
    expect(isStaging).toBeDefined()
  })

  it('should return true when NODE_ENV is staging', () => {
    // arrange
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'staging'
    // act
    const result = isStaging()
    // assert
    expect(result).toBe(true)
    // cleanup
    process.env.NODE_ENV = originalEnv
  })

  it('should return false in test environment', () => {
    // arrange
    // act
    const result = isStaging()
    // assert
    expect(result).toBe(false)
  })
})

describe('isDebug', () => {
  it('should exist when imported', () => {
    expect(isDebug).toBeDefined()
  })

  it('should return false when NODE_ENV is production', () => {
    // arrange
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    // act
    const result = isDebug()
    // assert
    expect(result).toBe(false)
    // cleanup
    process.env.NODE_ENV = originalEnv
  })

  it('should return false when DEBUG is explicitly set to false', () => {
    // arrange
    const originalDebug = process.env.DEBUG
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    process.env.DEBUG = 'false'
    // act
    const result = isDebug()
    // assert
    expect(result).toBe(false)
    // cleanup
    process.env.NODE_ENV = originalEnv
    process.env.DEBUG = originalDebug
  })
})

describe('allowsDevFallbacks', () => {
  it('should exist when imported', () => {
    expect(allowsDevFallbacks).toBeDefined()
  })

  it('should return true in development environment', () => {
    // arrange
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    // act
    const result = allowsDevFallbacks()
    // assert
    expect(result).toBe(true)
    // cleanup
    process.env.NODE_ENV = originalEnv
  })

  it('should return true in test environment', () => {
    // arrange (NODE_ENV is already "test" in Jest)
    // act
    const result = allowsDevFallbacks()
    // assert
    expect(result).toBe(true)
  })

  it('should return false in production environment', () => {
    // arrange
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    // act
    const result = allowsDevFallbacks()
    // assert
    expect(result).toBe(false)
    // cleanup
    process.env.NODE_ENV = originalEnv
  })
})

describe('webDomain', () => {
  it('should exist when imported', () => {
    expect(webDomain).toBeDefined()
  })

  it('should return the WEB_APP_URL env var', () => {
    // arrange
    const original = process.env.WEB_APP_URL
    process.env.WEB_APP_URL = 'http://localhost:3000'
    // act
    const result = webDomain()
    // assert
    expect(result).toBe('http://localhost:3000')
    // cleanup
    process.env.WEB_APP_URL = original
  })
})

describe('webUrl', () => {
  it('should exist when imported', () => {
    expect(webUrl).toBeDefined()
  })

  it('should return base URL with port appended when port is not 80', () => {
    // arrange
    const originalUrl = process.env.WEB_APP_URL
    const originalPort = process.env.WEB_APP_PORT
    process.env.WEB_APP_URL = 'http://localhost'
    process.env.WEB_APP_PORT = '3000'
    // act
    const result = webUrl()
    // assert
    expect(result).toBe('http://localhost:3000')
    // cleanup
    process.env.WEB_APP_URL = originalUrl
    process.env.WEB_APP_PORT = originalPort
  })
})

describe('allowedCorsOrigins', () => {
  it('should exist when imported', () => {
    expect(allowedCorsOrigins).toBeDefined()
  })

  it('should return empty array when WEB_APP_URL is not set', () => {
    // arrange — webUrl() only returns falsy when WEB_APP_URL is absent AND WEB_APP_PORT is '80'
    // (port 80 is skipped, so url stays as the raw undefined WEB_APP_URL value)
    const originalUrl = process.env.WEB_APP_URL
    const originalPort = process.env.WEB_APP_PORT
    delete process.env.WEB_APP_URL
    process.env.WEB_APP_PORT = '80'
    // act
    const result = allowedCorsOrigins()
    // assert
    expect(result).toEqual([])
    // cleanup
    if (originalUrl !== undefined) process.env.WEB_APP_URL = originalUrl
    else delete process.env.WEB_APP_URL
    process.env.WEB_APP_PORT = originalPort
  })

  it('should include SSR origin in dev/test environments', () => {
    // arrange
    const originalUrl = process.env.WEB_APP_URL
    const originalPort = process.env.WEB_APP_PORT
    const originalSsrPort = process.env.WEB_APP_SSR_PORT
    process.env.WEB_APP_URL = 'http://localhost'
    process.env.WEB_APP_PORT = '3000'
    process.env.WEB_APP_SSR_PORT = '3001'
    // act (NODE_ENV is already 'test')
    const result = allowedCorsOrigins()
    // assert
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result).toContain('http://localhost:3001')
    // cleanup
    process.env.WEB_APP_URL = originalUrl
    process.env.WEB_APP_PORT = originalPort
    process.env.WEB_APP_SSR_PORT = originalSsrPort
  })
})
