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
})
