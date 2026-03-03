import { dxGenerateOtp, dxGenerateRandomValue } from './randomValue'

describe('dxGenerateRandomValue', () => {
  // arrange
  const BYTES = 16
  // act
  const randomValue = dxGenerateRandomValue(BYTES)
  // assert
  it('should exist when imported', () => {
    expect(dxGenerateRandomValue).toBeDefined()
  })

  it('should generate a random value when invoked', () => {
    expect(randomValue).toBeDefined()
    expect(randomValue).toHaveLength(BYTES * 2)
  })

  it('should use the 48-byte default when called without an argument', () => {
    // arrange — tests the `length || 48` fallback branch
    // act
    const defaultValue = dxGenerateRandomValue()
    // assert — 48 bytes hex-encoded = 96 characters
    expect(defaultValue).toBeDefined()
    expect(defaultValue).toHaveLength(48 * 2)
  })

  it('should generate different values on consecutive calls', () => {
    // arrange
    // act
    const v1 = dxGenerateRandomValue(16)
    const v2 = dxGenerateRandomValue(16)
    // assert
    expect(v1).not.toBe(v2)
  })
})

describe('dxGenerateOtp', () => {
  // arrange
  const CODE_LENGTH = 6
  // act
  const otp = dxGenerateOtp(CODE_LENGTH)
  // assert
  it('should exist when imported', () => {
    expect(dxGenerateOtp).toBeDefined()
  })

  it('should generate an OTP code when invoked', () => {
    expect(otp).toBeDefined()
    expect(otp).toHaveLength(CODE_LENGTH)
  })

  it('should default to a 6-digit OTP when called without an argument', () => {
    // arrange — tests the `codeLength = 6` default parameter branch
    // act
    const defaultOtp = dxGenerateOtp()
    // assert
    expect(defaultOtp).toBeDefined()
    expect(defaultOtp).toHaveLength(6)
    expect(defaultOtp).toMatch(/^\d{6}$/)
  })

  it('should produce only numeric digits', () => {
    // arrange
    // act
    const numericOtp = dxGenerateOtp(8)
    // assert
    expect(numericOtp).toMatch(/^\d{8}$/)
  })
})
