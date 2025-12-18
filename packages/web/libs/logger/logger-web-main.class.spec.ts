import { logger } from './logger-web-main.class'

describe('logger', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(logger).toBeDefined()
  })
  it('should have methods when instantiated', () => {
    expect(logger).toBeDefined()
    expect(logger.error).toBeDefined()
    expect(logger.warn).toBeDefined()
    expect(logger.log).toBeDefined()
  })
})
