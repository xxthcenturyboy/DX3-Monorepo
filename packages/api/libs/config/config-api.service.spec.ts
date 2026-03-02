import fs from 'node:fs'

import {
  allowsDevFallbacks,
  getEnvironment,
  isDebug,
  isDev,
  isProd,
  isRunningInContainer,
  isStaging,
  isTest,
  webDomain,
  webUrl,
} from './config-api.service'

describe('getEnvironment', () => {
  it('should return a copy of process.env', () => {
    const env = getEnvironment()
    expect(env).toBeDefined()
    expect(typeof env).toBe('object')
  })
})

describe('isRunningInContainer', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.ROOT_DIR
    jest.restoreAllMocks()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should return true when ROOT_DIR is /app', () => {
    process.env.ROOT_DIR = '/app'
    expect(isRunningInContainer()).toBe(true)
  })

  it('should return true when /.dockerenv exists', () => {
    jest.spyOn(fs, 'accessSync').mockImplementation(() => undefined)
    expect(isRunningInContainer()).toBe(true)
  })

  it('should return false when ROOT_DIR is not /app and /.dockerenv is absent', () => {
    process.env.ROOT_DIR = '/some/other/path'
    jest.spyOn(fs, 'accessSync').mockImplementation(() => {
      throw new Error('ENOENT')
    })
    expect(isRunningInContainer()).toBe(false)
  })

  it('should return false when no ROOT_DIR and no /.dockerenv', () => {
    jest.spyOn(fs, 'accessSync').mockImplementation(() => {
      throw new Error('ENOENT')
    })
    expect(isRunningInContainer()).toBe(false)
  })
})

describe('isDebug', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should return false in production', () => {
    process.env.NODE_ENV = 'production'
    expect(isDebug()).toBe(false)
  })

  it('should return true when DEBUG is not set and not production', () => {
    process.env.NODE_ENV = 'development'
    delete process.env.DEBUG
    expect(isDebug()).toBe(true)
  })

  it('should return true when DEBUG is "true"', () => {
    process.env.NODE_ENV = 'development'
    process.env.DEBUG = 'true'
    expect(isDebug()).toBe(true)
  })

  it('should return false when DEBUG is "false"', () => {
    process.env.NODE_ENV = 'development'
    process.env.DEBUG = 'false'
    expect(isDebug()).toBe(false)
  })
})

describe('isDev', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should return true when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development'
    expect(isDev()).toBe(true)
  })

  it('should return false when NODE_ENV is not development', () => {
    process.env.NODE_ENV = 'production'
    expect(isDev()).toBe(false)
  })
})

describe('isTest', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should return true when NODE_ENV is test', () => {
    process.env.NODE_ENV = 'test'
    expect(isTest()).toBe(true)
  })

  it('should return false when NODE_ENV is not test', () => {
    process.env.NODE_ENV = 'production'
    expect(isTest()).toBe(false)
  })
})

describe('isProd', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should return true when NODE_ENV is production', () => {
    process.env.NODE_ENV = 'production'
    expect(isProd()).toBe(true)
  })

  it('should return false when NODE_ENV is not production', () => {
    process.env.NODE_ENV = 'development'
    expect(isProd()).toBe(false)
  })
})

describe('isStaging', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should return true when NODE_ENV is staging', () => {
    process.env.NODE_ENV = 'staging'
    expect(isStaging()).toBe(true)
  })

  it('should return false when NODE_ENV is not staging', () => {
    process.env.NODE_ENV = 'development'
    expect(isStaging()).toBe(false)
  })
})

describe('allowsDevFallbacks', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should return true in development', () => {
    process.env.NODE_ENV = 'development'
    expect(allowsDevFallbacks()).toBe(true)
  })

  it('should return true in test', () => {
    process.env.NODE_ENV = 'test'
    expect(allowsDevFallbacks()).toBe(true)
  })

  it('should return false in production', () => {
    process.env.NODE_ENV = 'production'
    expect(allowsDevFallbacks()).toBe(false)
  })
})

describe('webDomain', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should return WEB_APP_URL from env', () => {
    process.env.WEB_APP_URL = 'http://localhost'
    expect(webDomain()).toBe('http://localhost')
  })

  it('should return undefined when WEB_APP_URL is not set', () => {
    delete process.env.WEB_APP_URL
    expect(webDomain()).toBeUndefined()
  })
})

describe('webUrl', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should append port when WEB_APP_PORT is not 80', () => {
    process.env.WEB_APP_URL = 'http://localhost'
    process.env.WEB_APP_PORT = '3000'
    expect(webUrl()).toBe('http://localhost:3000')
  })

  it('should not append port when WEB_APP_PORT is 80', () => {
    process.env.WEB_APP_URL = 'http://localhost'
    process.env.WEB_APP_PORT = '80'
    expect(webUrl()).toBe('http://localhost')
  })

  it('should return undefined when WEB_APP_URL is not set', () => {
    delete process.env.WEB_APP_URL
    process.env.WEB_APP_PORT = '8080'
    const result = webUrl()
    expect(result).toContain('8080')
  })
})
