import { RATE_LIMIT_MESSAGE, RATE_LIMITS } from './rate-limter.const'

describe('RATE_LIMIT_MESSAGE', () => {
  it('should exist', () => {
    expect(RATE_LIMIT_MESSAGE).toBeDefined()
  })

  it('should have the correct value', () => {
    expect(RATE_LIMIT_MESSAGE).toEqual('429 Too many requests.')
  })
})

describe('RATE_LIMITS', () => {
  it('should exist', () => {
    expect(RATE_LIMITS).toBeDefined()
  })

  it('should have the correct values', () => {
    expect(RATE_LIMITS.AUTH_LOOKUP).toEqual(20)
    expect(RATE_LIMITS.LOGIN).toEqual(25)
    expect(RATE_LIMITS.STD).toEqual(5000)
    expect(RATE_LIMITS.STRICT).toEqual(100)
    expect(RATE_LIMITS.VERY_STRICT).toEqual(3)
  })
})
