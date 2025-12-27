import fs from 'node:fs'

import {
  getEnvironment,
  isDebug,
  isDev,
  isProd,
  isRunningInContainer,
  isStaging,
  webDomain,
  webUrl,
} from './config-api.service'

describe('getEnvironment', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(getEnvironment).toBeDefined()
  })
  it('should get values when invoked', () => {
    // arrange
    // act
    const env = getEnvironment()
    // assert
    expect(env).toBeDefined()
  })
})

describe('isDebug', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(isDebug).toBeDefined()
  })
})

describe('isDev', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(isDev).toBeDefined()
  })
})

describe('isProd', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(isProd).toBeDefined()
  })
})

describe('isStaging', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(isStaging).toBeDefined()
  })
})

describe('webDomain', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(webDomain).toBeDefined()
  })
})

describe('webUrl', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(webUrl).toBeDefined()
  })
})

describe('isRunningInContainer', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.ROOT_DIR
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should exist when imported', () => {
    expect(isRunningInContainer).toBeDefined()
  })

  it('should return true when ROOT_DIR is /app', () => {
    process.env.ROOT_DIR = '/app'

    expect(isRunningInContainer()).toBe(true)
  })

  it('should return false when ROOT_DIR is not /app', () => {
    process.env.ROOT_DIR = '/some/other/path'

    jest.spyOn(fs, 'accessSync').mockImplementation(() => {
      throw new Error('ENOENT')
    })

    expect(isRunningInContainer()).toBe(false)
  })

  it('should return true when /.dockerenv exists', () => {
    delete process.env.ROOT_DIR

    jest.spyOn(fs, 'accessSync').mockImplementation(() => undefined)

    expect(isRunningInContainer()).toBe(true)
  })

  it('should return false when not in container and no /.dockerenv', () => {
    delete process.env.ROOT_DIR

    jest.spyOn(fs, 'accessSync').mockImplementation(() => {
      throw new Error('ENOENT')
    })

    expect(isRunningInContainer()).toBe(false)
  })
})
