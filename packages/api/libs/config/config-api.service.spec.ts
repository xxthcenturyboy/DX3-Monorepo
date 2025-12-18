import {
  getEnvironment,
  isDebug,
  isLocal,
  isProd,
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

describe('isLocal', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(isLocal).toBeDefined()
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
