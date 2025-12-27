import { LOG_LEVEL, LOGGER_ENTITY_NAME, WINSTON_LOG_LEVELS } from './logger-api.consts'

describe('LOGGER_ENTITY_NAME ', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(LOGGER_ENTITY_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    expect(LOGGER_ENTITY_NAME).toEqual('logger')
  })
})

describe('LOG_LEVEL ', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(LOG_LEVEL).toBeDefined()
  })

  it('should have correct values', () => {
    expect(LOG_LEVEL.DATA).toEqual('data')
    expect(LOG_LEVEL.DEBUG).toEqual('debug')
    expect(LOG_LEVEL.ERROR).toEqual('error')
    expect(LOG_LEVEL.INFO).toEqual('info')
    expect(LOG_LEVEL.WARN).toEqual('warn')
  })
})

describe('WINSTON_LOG_LEVELS', () => {
  it('should exist when imported', () => {
    expect(WINSTON_LOG_LEVELS).toBeDefined()
  })

  it('should have correct priority values (lower = higher priority)', () => {
    expect(WINSTON_LOG_LEVELS.error).toEqual(0)
    expect(WINSTON_LOG_LEVELS.warn).toEqual(1)
    expect(WINSTON_LOG_LEVELS.info).toEqual(2)
    expect(WINSTON_LOG_LEVELS.debug).toEqual(4)
    expect(WINSTON_LOG_LEVELS.data).toEqual(5)
  })

  it('should have error as highest priority', () => {
    const priorities = Object.values(WINSTON_LOG_LEVELS)
    expect(Math.min(...priorities)).toEqual(WINSTON_LOG_LEVELS.error)
  })
})
